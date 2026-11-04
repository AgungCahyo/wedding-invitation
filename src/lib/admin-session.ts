/** sessionStorage key holding the PIN the admin typed (sent to the server API). */
export const ADMIN_PIN_KEY = "admin_pin";
/** sessionStorage flag: the server accepted the PIN in this tab. */
export const ADMIN_SESSION_KEY = "admin_authenticated";
/** Fired on window when the server rejects the stored PIN (401). */
export const ADMIN_EXPIRED_EVENT = "admin-session-expired";
