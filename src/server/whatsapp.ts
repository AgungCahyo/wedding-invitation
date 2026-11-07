/**
 * SERVER-ONLY: pengirim WhatsApp untuk undangan. Tiga provider, dipilih lewat env:
 *
 *   WHATSAPP_PROVIDER   "meta" (default) | "fonnte" | "waha"
 *
 * ── meta  (WhatsApp Business Cloud API resmi) ────────────────────────────
 *   WHATSAPP_ACCESS_TOKEN       permanent system-user token
 *   WHATSAPP_PHONE_NUMBER_ID    id nomor pengirim
 *   WHATSAPP_MODE               "template" (default) | "text"
 *   WHATSAPP_TEMPLATE_NAME      template yang sudah disetujui (mode=template)
 *   WHATSAPP_TEMPLATE_LANG      default "id"
 *   WHATSAPP_API_VERSION        default "v21.0"
 *   WHATSAPP_GRAPH_URL          default "https://graph.facebook.com"
 *   Meta hanya mengizinkan teks bebas dalam 24 jam setelah tamu membalas, jadi
 *   undangan (inisiatif kita) harus memakai TEMPLATE dengan 3 variabel:
 *   {{1}} nama, {{2}} link undangan, {{3}} ringkasan acara/pesan.
 *
 * ── fonnte  (gateway; tanpa template, kirim teks penuh) ──────────────────
 *   FONNTE_TOKEN                token device dari dashboard Fonnte
 *   FONNTE_API_URL              default "https://api.fonnte.com/send"
 *
 * ── waha  (WhatsApp HTTP API self-hosted; tanpa template) ────────────────
 *   WAHA_URL                    mis. "https://waha.domainmu.com"
 *   WAHA_API_KEY                opsional (header X-Api-Key)
 *   WAHA_SESSION                default "default"
 *
 * Gateway non-resmi (fonnte/waha) berisiko dibatasi WhatsApp bila terlalu cepat,
 * jadi `waInfo()` memberi jeda acak antar pesan dan batch kecil.
 */
export type WaProvider = "meta" | "fonnte" | "waha";

export interface MetaConfig {
  provider: "meta";
  token: string;
  phoneNumberId: string;
  mode: "template" | "text";
  templateName: string;
  lang: string;
  version: string;
  graphUrl: string;
}
export interface FonnteConfig {
  provider: "fonnte";
  token: string;
  url: string;
}
export interface WahaConfig {
  provider: "waha";
  url: string;
  apiKey: string;
  session: string;
}
export type WaConfig = MetaConfig | FonnteConfig | WahaConfig;

const trimSlash = (s: string) => s.replace(/\/+$/, "");

export function waConfig(): WaConfig | null {
  const provider = (process.env.WHATSAPP_PROVIDER ?? "meta").trim().toLowerCase();

  if (provider === "fonnte") {
    const token = process.env.FONNTE_TOKEN;
    if (!token) return null;
    return { provider, token, url: process.env.FONNTE_API_URL || "https://api.fonnte.com/send" };
  }

  if (provider === "waha") {
    const url = process.env.WAHA_URL;
    if (!url) return null;
    return {
      provider,
      url: trimSlash(url),
      apiKey: process.env.WAHA_API_KEY ?? "",
      session: process.env.WAHA_SESSION || "default",
    };
  }

  if (provider !== "meta") return null;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return null;
  const mode = process.env.WHATSAPP_MODE === "text" ? "text" : "template";
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME ?? "";
  if (mode === "template" && !templateName) return null;
  return {
    provider: "meta",
    token,
    phoneNumberId,
    mode,
    templateName,
    lang: process.env.WHATSAPP_TEMPLATE_LANG || "id",
    version: process.env.WHATSAPP_API_VERSION || "v21.0",
    graphUrl: trimSlash(process.env.WHATSAPP_GRAPH_URL || "https://graph.facebook.com"),
  };
}

/** Cara mengirim yang pantas untuk tiap provider (dipakai route admin & UI). */
export interface WaPacing {
  /** Teks singkat untuk UI, mis. "meta/template". */
  label: string;
  /** Berapa pesan dikirim bersamaan. */
  concurrency: number;
  /** Jeda acak [min, max] ms setelah tiap pesan per pekerja. */
  delayMs: [number, number];
  /** Maks tamu per permintaan POST. */
  maxPerCall: number;
  /** Ukuran batch yang disarankan untuk klien. */
  clientBatch: number;
}

export function waInfo(cfg: WaConfig): WaPacing {
  if (cfg.provider === "meta") {
    return { label: `meta/${cfg.mode}`, concurrency: 5, delayMs: [0, 0], maxPerCall: 50, clientBatch: 25 };
  }
  return { label: cfg.provider, concurrency: 1, delayMs: [2000, 5000], maxPerCall: 8, clientBatch: 5 };
}

export interface WaSendInput {
  to: string; // digits, e.g. 6281234567890
  text: string; // pesan lengkap multi-baris (meta/text, fonnte, waha)
  params: [string, string, string]; // variabel template (meta/template)
}
export type WaSendResult = { ok: true; id: string } | { ok: false; error: string };

const TIMEOUT_MS = 15000;

async function post(url: string, init: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, method: "POST", signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function sendMeta(cfg: MetaConfig, input: WaSendInput): Promise<WaSendResult> {
  const payload =
    cfg.mode === "text"
      ? { messaging_product: "whatsapp", to: input.to, type: "text", text: { body: input.text, preview_url: true } }
      : {
          messaging_product: "whatsapp",
          to: input.to,
          type: "template",
          template: {
            name: cfg.templateName,
            language: { code: cfg.lang },
            components: [{ type: "body", parameters: input.params.map((text) => ({ type: "text", text })) }],
          },
        };

  const res = await post(`${cfg.graphUrl}/${cfg.version}/${cfg.phoneNumberId}/messages`, {
    headers: { Authorization: `Bearer ${cfg.token}`, "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = (await res.json().catch(() => ({}))) as {
    messages?: { id?: string }[];
    error?: { message?: string; code?: number };
  };
  if (!res.ok || !json.messages?.[0]?.id) {
    return { ok: false, error: (json.error?.message ?? `HTTP ${res.status}`).slice(0, 300) };
  }
  return { ok: true, id: json.messages[0].id };
}

async function sendFonnte(cfg: FonnteConfig, input: WaSendInput): Promise<WaSendResult> {
  const res = await post(cfg.url, {
    headers: { Authorization: cfg.token, "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ target: input.to, message: input.text, countryCode: "62" }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    status?: boolean;
    id?: (string | number)[];
    reason?: string;
    detail?: string;
  };
  if (!res.ok || json.status === false) {
    return { ok: false, error: (json.reason ?? json.detail ?? `HTTP ${res.status}`).slice(0, 300) };
  }
  return { ok: true, id: String(json.id?.[0] ?? "fonnte") };
}

async function sendWaha(cfg: WahaConfig, input: WaSendInput): Promise<WaSendResult> {
  const res = await post(`${cfg.url}/api/sendText`, {
    headers: { "content-type": "application/json", ...(cfg.apiKey ? { "X-Api-Key": cfg.apiKey } : {}) },
    body: JSON.stringify({ session: cfg.session, chatId: `${input.to}@c.us`, text: input.text }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    id?: string | { _serialized?: string; id?: string };
    message?: string;
    error?: string;
  };
  if (!res.ok) {
    return { ok: false, error: (json.message ?? json.error ?? `HTTP ${res.status}`).slice(0, 300) };
  }
  const id = typeof json.id === "string" ? json.id : (json.id?._serialized ?? json.id?.id ?? "waha");
  return { ok: true, id };
}

export async function sendWhatsApp(cfg: WaConfig, input: WaSendInput): Promise<WaSendResult> {
  try {
    if (cfg.provider === "fonnte") return await sendFonnte(cfg, input);
    if (cfg.provider === "waha") return await sendWaha(cfg, input);
    return await sendMeta(cfg, input);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message.slice(0, 300) : "Network error" };
  }
}
