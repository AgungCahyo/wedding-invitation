/**
 * SERVER-ONLY: WhatsApp Business Cloud API (Meta) sender.
 *
 * Env:
 *   WHATSAPP_ACCESS_TOKEN       permanent system-user token
 *   WHATSAPP_PHONE_NUMBER_ID    sender phone-number id
 *   WHATSAPP_MODE               "template" (default) | "text"
 *   WHATSAPP_TEMPLATE_NAME      approved template (mode=template)
 *   WHATSAPP_TEMPLATE_LANG      default "id"
 *   WHATSAPP_API_VERSION        default "v21.0"
 *   WHATSAPP_GRAPH_URL          default "https://graph.facebook.com"
 *
 * Meta only allows free-form text inside a 24h window after the guest wrote to
 * you, so invitations (business-initiated) must use an approved TEMPLATE whose
 * body has 3 variables: {{1}} nama, {{2}} link undangan, {{3}} ringkasan acara/pesan.
 */
export interface WaConfig {
  token: string;
  phoneNumberId: string;
  mode: "template" | "text";
  templateName: string;
  lang: string;
  version: string;
  graphUrl: string;
}

export function waConfig(): WaConfig | null {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return null;
  const mode = process.env.WHATSAPP_MODE === "text" ? "text" : "template";
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME ?? "";
  if (mode === "template" && !templateName) return null;
  return {
    token,
    phoneNumberId,
    mode,
    templateName,
    lang: process.env.WHATSAPP_TEMPLATE_LANG || "id",
    version: process.env.WHATSAPP_API_VERSION || "v21.0",
    graphUrl: (process.env.WHATSAPP_GRAPH_URL || "https://graph.facebook.com").replace(/\/$/, ""),
  };
}

export interface WaSendInput {
  to: string; // digits, e.g. 6281234567890
  text: string; // full multi-line message (mode=text)
  params: [string, string, string]; // template variables (mode=template)
}
export type WaSendResult = { ok: true; id: string } | { ok: false; error: string };

export async function sendWhatsApp(cfg: WaConfig, input: WaSendInput): Promise<WaSendResult> {
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

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(`${cfg.graphUrl}/${cfg.version}/${cfg.phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.token}`, "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    const json = (await res.json().catch(() => ({}))) as {
      messages?: { id?: string }[];
      error?: { message?: string; code?: number };
    };
    if (!res.ok || !json.messages?.[0]?.id) {
      return { ok: false, error: (json.error?.message ?? `HTTP ${res.status}`).slice(0, 300) };
    }
    return { ok: true, id: json.messages[0].id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message.slice(0, 300) : "Network error" };
  } finally {
    clearTimeout(timer);
  }
}
