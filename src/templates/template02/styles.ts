/**
 * Template 02-owned stylesheet entry point (Step 10A).
 *
 * Mirrors src/templates/ayutika/styles.ts: a pure side-effect import
 * boundary so consumers depend on this module rather than reaching into
 * template02.css directly.
 *
 * NOTE (Step 10A scope): app/layout.tsx does not import this module yet.
 * Wiring it into the app shell's CSS loading is deferred to a later step.
 */
import "./template02.css";