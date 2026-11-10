/**
 * Centralized storage keys — all localStorage/sessionStorage keys used by the app.
 * Values MUST NOT change (would clear user preferences/sessions).
 * Only centralizing the string constants; keys remain exactly as before.
 */

// Theme persistence
export const THEME_KEY = "undangan-theme";

// CatchTheLove game
export const CATCH_LOVE_BEST_KEY = "undangan-catch-love-best";
export const CATCH_LOVE_NAME_KEY = "undangan-catch-love-name";

// PhotoBooth
export const PHOTOBOOTH_LAST_SEND_KEY = "photobooth_last_send_at";

// Admin
export const ADMIN_PIN_KEY = "admin_pin";
export const ADMIN_AUTH_KEY = "admin_authenticated";