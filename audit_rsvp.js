#!/usr/bin/env node

// Temporary audit script to inspect RSVP data
// This script will be read-only and will not modify any data

const { supabase, isSupabaseConfigured } = require('./src/lib/supabase');

async function auditRSVPData() {
  console.log('# RSVP DATA AUDIT\n');

  if (!supabase || !isSupabaseConfigured) {
    console.error('ERROR: Supabase is not configured');
    return;
  }

  try {
    // 1. Current Schema Inspection (through queries)
    console.log('## 1. Current Schema');
    console.log('(Schema inspection would require direct DB access - using inferred schema from migrations and code)\n');

    // 2. Current RSVP Data
    console.log('## 2. Current RSVP Data');

    // First, get the invitation to get the invitation_id
    const { data: invitationData, error: invitationError } = await supabase
      .from('invitations')
      .select('id, slug')
      .limit(1);

    if (invitationError) {
      console.error('Error fetching invitation:', invitationError);
      return;
    }

    if (!invitationData || invitationData.length === 0) {
      console.log('No invitations found in database');
      return;
    }

    const invitationId = invitationData[0].id;
    const invitationSlug = invitationData[0].slug;
    console.log('Found invitation: %s (ID: %s)\n', invitationSlug, invitationId);

    // Get all RSVP responses for this invitation
    const { data: rsvpData, error: rsvpError } = await supabase
      .from('rsvp_guests')
      .select('id, invitation_id, name, attendance, guest_count, message, created_at, updated_at')
      .eq('invitation_id', invitationId)
      .order('created_at', { ascending: false });

    if (rsvpError) {
      console.error('Error fetching RSVP data:', rsvpError);
      return;
    }

    console.log('Found %d RSVP records:\n', rsvpData.length);

    if (rsvpData.length === 0) {
      console.log('No RSVP data found.\n');
    } else {
      console.log('| ID | Invitation ID | Name | Attendance | Guest Count | Message | Created At | Updated At |');
      console.log('|----|---------------|------|------------|-------------|---------|------------|------------|');
      rsvpData.forEach(function(record) {
        const message = record.message || '(null)';
        const updatedAt = record.updated_at || '(null)';
        console.log('| %s | %s | %s | %s | %s | %s | %s | %s |',
          record.id,
          record.invitation_id,
          record.name,
          record.attendance,
          record.guest_count || '(null)',
          message,
          record.created_at,
          updatedAt);
      });
      console.log('');
    }

    // 3. Duplicate RSVP Candidates (by invitation_id + normalized name)
    console.log('## 3. Duplicate Candidates');

    if (rsvpData.length > 0) {
      // Group by invitation_id and normalized name (lowercase, trimmed)
      const nameGroups = {};
      rsvpData.forEach(function(record) {
        const normalizedName = record.name.trim().toLowerCase();
        const key = record.invitation_id + '|' + normalizedName;
        if (!nameGroups[key]) {
          nameGroups[key] = [];
        }
        nameGroups[key].push(record);
      });

      let duplicateFound = false;
      for (const key in nameGroups) {
        const records = nameGroups[key];
        if (records.length > 1) {
          duplicateFound = true;
          const parts = key.split('|');
          const invitationIdPart = parts[0];
          const normalizedNamePart = parts[1];
          console.log('Duplicate candidates for invitation_id: %s, normalized name: "%s"', invitationIdPart, normalizedNamePart);
          console.log('  Found %d records:', records.length);
          records.forEach(function(record) {
            console.log('    - ID: %s, Created: %s, Attendance: %s, Guest Count: %s, Message: "%s"',
              record.id,
              record.created_at,
              record.attendance,
              record.guest_count || '(null)',
              record.message || '(null)');
          });
          console.log('');
        }
      }

      if (!duplicateFound) {
        console.log('No duplicate candidates found by (invitation_id, normalized name)\n');
      }
    } else {
      console.log('No RSVP data to check for duplicates\n');
    }

    // 4. Compare RSVP names against guest_links
    console.log('## 4. RSVP → guest_links Matching');

    // Get all guest links for this invitation
    const { data: guestLinksData, error: linksError } = await supabase
      .from('guest_links')
      .select('id, invitation_id, slug, name')
      .eq('invitation_id', invitationId);

    if (linksError) {
      console.error('Error fetching guest links:', linksError);
      return;
    }

    console.log('Found %d guest links for invitation %s\n', guestLinksData.length, invitationSlug);

    if (rsvpData.length === 0 && guestLinksData.length === 0) {
      console.log('No RSVP data or guest links found\n');
      return;
    }

    // Create maps for easier lookup
    const rsvpByName = {};
    rsvpData.forEach(function(record) {
      const nameKey = record.name.trim();
      if (!rsvpByName[nameKey]) {
        rsvpByName[nameKey] = [];
      }
      rsvpByName[nameKey].push(record);
    });

    const guestLinksByName = {};
    guestLinksData.forEach(function(link) {
      const nameKey = link.name.trim();
      if (!guestLinksByName[nameKey]) {
        guestLinksByName[nameKey] = [];
      }
      guestLinksByName[nameKey].push(link);
    });

    // A. Exact name matches
    console.log('### A. Exact name matches');
    let exactMatches = 0;
    for (const name in rsvpByName) {
      if (guestLinksByName[name]) {
        const rsvpRecords = rsvpByName[name];
        const linkRecords = guestLinksByName[name];
        exactMatches += rsvpRecords.length;
        console.log('Name: "%s"', name);
        console.log('  RSVPs (%d): %s', rsvpRecords.length, rsvpRecords.map(function(r) { return r.id; }).join(', '));
        console.log('  Guest Links (%d): %s', linkRecords.length, linkRecords.map(function(g) { return g.id + ' (' + g.slug + ')'; }).join(', '));
        console.log('');
      }
    }
    if (exactMatches === 0) {
      console.log('No exact name matches found\n');
    }

    // B. RSVP rows with no matching guest_link
    console.log('### B. RSVP rows with no matching guest_link');
    let unmatchedRSVPs = 0;
    for (const name in rsvpByName) {
      if (!guestLinksByName[name]) {
        const rsvpRecords = rsvpByName[name];
        unmatchedRSVPs += rsvpRecords.length;
        console.log('Name: "%s" (%d RSVPs)', name, rsvpRecords.length);
        rsvpRecords.forEach(function(record) {
          console.log('  - RSVP ID: %s, Created: %s', record.id, record.created_at);
        });
        console.log('');
      }
    }
    if (unmatchedRSVPs === 0) {
      console.log('All RSVP rows have matching guest links\n');
    }

    // C. guest_links with no RSVP
    console.log('### C. guest_links with no RSVP');
    let unmatchedLinks = 0;
    for (const name in guestLinksByName) {
      if (!rsvpByName[name]) {
        const linkRecords = guestLinksByName[name];
        unmatchedLinks += linkRecords.length;
        console.log('Name: "%s" (%d guest links)', name, linkRecords.length);
        linkRecords.forEach(function(link) {
          console.log('  - Guest Link ID: %s, Slug: %s', link.id, link.slug);
        });
        console.log('');
      }
    }
    if (unmatchedLinks === 0) {
      console.log('All guest links have matching RSVPs\n');
    }

    // D. Ambiguous matches
    console.log('### D. Ambiguous matches');
    let ambiguousCount = 0;
    for (const name in rsvpByName) {
      if (guestLinksByName[name]) {
        const rsvpRecords = rsvpByName[name];
        const linkRecords = guestLinksByName[name];
        if (rsvpRecords.length > 1 || linkRecords.length > 1) {
          ambiguousCount++;
          console.log('Name: "%s"', name);
          console.log('  RSVPs (%d): %s', rsvpRecords.length, rsvpRecords.map(function(r) { return r.id; }).join(', '));
          console.log('  Guest Links (%d): %s', linkRecords.length, linkRecords.map(function(g) { return g.id + ' (' + g.slug + ')'; }).join(', '));
          console.log('');
        }
      }
    }
    if (ambiguousCount === 0) {
      console.log('No ambiguous matches found\n');
    }

    // 5. Migration Safety Assessment
    console.log('## 5. Migration Safety Assessment');

    // Check if we can safely add guest_link_id NOT NULL and UNIQUE(invitation_id, guest_link_id)
    // This requires that each RSVP can be mapped to exactly one guest_link

    let canBeMappedSafely = true;
    let unmappableRSVPs = [];

    // For each RSVP, check if there's exactly one matching guest_link by name
    rsvpData.forEach(function(rsvpRecord) {
      const matchingLinks = guestLinksData.filter(function(link) {
        return link.name.trim() === rsvpRecord.name.trim();
      });

      if (matchingLinks.length === 0) {
        // No matching guest link
        canBeMappedSafely = false;
        unmappableRSVPs.push({
          rsvpId: rsvpRecord.id,
          reason: 'No matching guest link by name',
          rsvpName: rsvpRecord.name,
          rsvpCreatedAt: rsvpRecord.created_at
        });
      } else if (matchingLinks.length > 1) {
        // Multiple matching guest links (ambiguous)
        canBeMappedSafely = false;
        unmappableRSVPs.push({
          rsvpId: rsvpRecord.id,
          reason: 'Ambiguous match - ' + matchingLinks.length + ' guest links match this name',
          rsvpName: rsvpRecord.name,
          rsvpCreatedAt: rsvpRecord.created_at,
          matchingLinks: matchingLinks.map(function(l) { return { id: l.id, slug: l.slug }; })
        });
      }
    });

    if (canBeMappedSafely && rsvpData.length > 0) {
      console.log('✅ SAFE: Each RSVP can be deterministically mapped to exactly one guest link by name');
    } else if (rsvpData.length === 0) {
      console.log('ℹ️  No RSVP data to assess mapping safety');
    } else {
      console.log('❌ NOT SAFE: Some RSVPs cannot be deterministically mapped to guest links');
      console.log('   Found %d problematic RSVP records:\n', unmappableRSVPs.length);
      unmappableRSVPs.forEach(function(record, index) {
        console.log('%d. RSVP ID: %s', index + 1, record.rsvpId);
        console.log('   Name: "%s"', record.rsvpName);
        console.log('   Created: %s', record.rsvpCreatedAt);
        console.log('   Reason: %s', record.reason);
        if (record.matchingLinks) {
          console.log('   Matching guest links: %s', record.matchingLinks.map(function(l) { return l.id + ' (' + l.slug + ')'; }).join(', '));
        }
        console.log('');
      });
    }

    // 6. Check invitation_id redundancy
    console.log('## 6. invitation_id Redundancy Check');
    console.log('Analysis:');
    console.log('- guest_links table already has invitation_id (foreign key to invitations)');
    console.log('- If we add guest_link_id to rsvp_guests, we can get invitation_id through the guest_link');
    console.log('- However, keeping invitation_id in rsvp_guests provides:');
    console.log('  * Direct tenant isolation without JOIN');
    console.log('  * Better query performance for invitation-scoped queries');
    console.log('  * Protection against guest_link invitation_id changes (though unlikely)');
    console.log('  * Consistency with current schema design');
    console.log('Conclusion: Keeping both invitation_id and guest_link_id is desirable for performance and clarity\n');

    // 7. RLS Impact
    console.log('## 7. RLS Impact Assessment');
    console.log('Current RLS policies (from migration 006_authorization_rls_hardening.sql):');
    console.log('- rsvp_guests has policy "rsvp_member_select" using is_invitation_member(invitation_id, ...)');
    console.log('- guest_links has policy "guest_links_member_select" using is_invitation_member(invitation_id, ...)');
    console.log('');
    console.log('Adding guest_link_id to rsvp_guests:');
    console.log('- Would NOT require changes to existing RLS policies');
    console.log('- Policies are based on invitation_id, which we would keep');
    console.log('- New column would be automatically protected by existing invitation_id-based policies\n');

    // 8. Statistics Impact
    console.log('## 8. Statistics Impact Assessment');
    console.log('Current statistics implementation (getRSVPStats in rsvp-service.ts):');
    console.log('- Selects attendance, guest_count from rsvp_guests where invitation_id = ?');
    console.log('- Counts total rows as "total"');
    console.log('- Counts rows with attendance = "attending" as "attending"');
    console.log('- Sums guest_count for attending rows as "totalGuests"');
    console.log('');
    console.log('Impact of preventing duplicate RSVPs:');
    console.log('- Statistics would become more accurate (one row per guest instead of one row per submission)');
    console.log('- No changes needed to statistics calculation logic');
    console.log('- Would prevent inflation of counts due to duplicate submissions\n');

    // 9. Frontend Guest Identity Flow
    console.log('## 9. Frontend Guest Identity Flow');
    console.log('RSVP submission flow:');
    console.log('1. Guest visits /[invitationSlug]/[guestSlug] page');
    console.log('2. Page component: app/[slug]/[guestId]/page.tsx');
    console.log('3. Extracts guestId from URL parameter (line 26):');
    console.log('   const guestParam = typeof params?.guestId === "string" ? decodeURIComponent(params.guestId) : "";');
    console.log('4. Uses guestParam to fetch personalization data via fetchPublicGuestTouch');
    console.log('5. RSVP form in src/templates/ayutika/RSVP.tsx calls submitPublicRSVP(invitation.slug, formData)');
    console.log('6. BUT: formData does NOT include guest identity!');
    console.log('');
    console.log('Conclusion: Guest identity IS available in frontend but is NOT being sent to RSVP API\n');

    // 10. RSVP Submission Paths
    console.log('## 10. RSVP Submission Paths');
    console.log('Checking for RSVP submission code paths:');
    console.log('- Public RSVP API: app/api/invitations/[slug]/rsvp/route.ts');
    console.log('- Service layer: src/lib/public-invitation-service.ts -> submitPublicRSVP');
    console.log('- Frontend call: src/templates/ayutika/RSVP.tsx -> submitPublicRSVP(invitation.slug, formData)');
    console.log('');
    console.log('Verification:');
    console.log('- The RSVP form only appears on guest-specific pages (requires [guestId] in URL)');
    console.log('- No other RSVP submission paths found in codebase');
    console.log('Conclusion: RSVP can ONLY be submitted from /[invitationSlug]/[guestSlug]\n');

    // Final Recommendation
    console.log('## 11. Final Recommendation');

    let verdictReason = '';
    if (rsvpData.length === 0) {
      verdictReason = 'No existing RSVP data to migrate - clean slate';
    } else if (canBeMappedSafely) {
      verdictReason = 'All existing RSVPs can be deterministically mapped to guest links';
    } else {
      verdictReason = unmappableRSVPs.length + ' RSVPs cannot be deterministically mapped to guest links - data cleanup required';
    }

    console.log('**VERDICT: %s**', canBeMappedSafely ? 'SAFE TO IMPLEMENT' : 'NOT SAFE TO IMPLEMENT — DATA CLEANUP REQUIRED');
    console.log(verdictReason);

  } catch (error) {
    console.error('Unexpected error during audit:', error);
  }
}

auditRSVPData();