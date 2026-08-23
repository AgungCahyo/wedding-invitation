/**
 * Ayutika-owned stylesheet entry point.
 *
 * Re-exports ayutika.css as a module boundary (mirrors fonts.ts from
 * Step 7B) so the app shell depends on an Ayutika-owned entry point
 * instead of reaching directly into the template's internal CSS file.
 *
 * This does NOT change what is loaded, when it loads, or its cascade
 * order relative to app/globals.css — ayutika.css is still loaded
 * unconditionally from app/layout.tsx, at the same position.
 *
 * Known constraint (Step 7C audit): some classes in ayutika.css —
 * .eyebrow, .btn-editorial, .btn-editorial-filled — are also used by
 * app/admin/page.tsx, which is not part of any template. That is why
 * this step only relocates the import boundary and does not attempt
 * conditional/template-scoped loading; doing so would break admin
 * styling. Conditional loading is deferred to the template-switching
 * stage, once the admin dependency is addressed separately.
 */
import "./ayutika.css";