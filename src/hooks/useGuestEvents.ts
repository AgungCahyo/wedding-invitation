"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { PublicEvent } from "@/src/lib/events-types";

/**
 * Events this guest may see, fetched from GET /api/events (server resolves the
 * guest's category from the invitation slug). Shared by EventDetails and RSVP
 * through a per-slug promise cache, so only one request is made.
 * Fails closed: on any error the guest simply gets no extra events.
 */
const cache = new Map<string, Promise<PublicEvent[]>>();

function loadEvents(slug: string): Promise<PublicEvent[]> {
  let p = cache.get(slug);
  if (!p) {
    p = fetch(`/api/events?guest=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json: { events?: PublicEvent[] }) => (Array.isArray(json.events) ? json.events : []))
      .catch(() => {
        cache.delete(slug); // allow a retry on the next mount
        return [] as PublicEvent[];
      });
    cache.set(slug, p);
  }
  return p;
}

export function useGuestEvents() {
  const params = useParams();
  // Raw (still-encoded) slug — same value the guest_links table stores.
  const slug = typeof params?.guest === "string" ? params.guest : "";
  const [loaded, setLoaded] = useState<{ slug: string; events: PublicEvent[] }>({
    slug: "",
    events: [],
  });

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    loadEvents(slug).then((events) => {
      if (alive) setLoaded({ slug, events });
    });
    return () => {
      alive = false;
    };
  }, [slug]);

  const events = slug && loaded.slug === slug ? loaded.events : [];

  return {
    slug,
    /** Visible events other than the main Akad & Resepsi block. */
    extraEvents: events.filter((e) => !e.isMain),
    calendarHref: slug ? `/calendar.ics?guest=${encodeURIComponent(slug)}` : "/calendar.ics",
  };
}
