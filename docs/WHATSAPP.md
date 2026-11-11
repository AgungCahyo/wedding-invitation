# WhatsApp broadcast

Admin mass-send from `/admin` via `POST /api/admin/wa`. Provider is chosen with `WHATSAPP_PROVIDER`. See `.env.example` for variable names (no secrets in this file).

## Providers

**meta** (default) — WhatsApp Business Cloud API.

- Required: `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_MODE=template` (default) needs `WHATSAPP_TEMPLATE_NAME` (approved template with `{{1}}` name, `{{2}}` link, `{{3}}` summary)
- `WHATSAPP_MODE=text` sends free-form body only inside Meta’s 24-hour customer-care window

**fonnte** — gateway, full text, no Meta template.

- Required: `FONNTE_TOKEN`
- Optional: `FONNTE_API_URL` (default `https://api.fonnte.com/send`)

**waha** — self-hosted WhatsApp HTTP API, full text.

- Required: `WAHA_URL`
- Optional: `WAHA_API_KEY`, `WAHA_SESSION` (default `default`)

Unofficial gateways (fonnte/waha) can be rate-limited or banned by WhatsApp if you send too fast. The send route already uses small batches and delays.

## If automatic send is not configured

The API returns 503 and the admin UI still allows opening `wa.me` per guest and marking sent/reset status.

Guest links use `NEXT_PUBLIC_SITE_URL` when set, otherwise `invitation.meta.url`.
