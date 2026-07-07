/**
 * Transactional email helper.
 *
 * Configure via env vars (e.g. in .env):
 *   SMTP_HOST=smtp.example.com
 *   SMTP_PORT=587
 *   SMTP_USER=apikey
 *   SMTP_PASS=...
 *   MAIL_FROM="Tynky Bordel <hello@tynky.cz>"
 *
 * If SMTP_HOST is empty, calls become no-ops that log to console. That keeps dev
 * environments from crashing when email isn't wired up.
 */

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

let cachedTransport: any = null;

async function getTransport() {
  if (cachedTransport !== null) return cachedTransport;

  const host = process.env.SMTP_HOST;
  if (!host) {
    cachedTransport = false; // sentinel: no transport configured
    return cachedTransport;
  }

  // Dynamic import so the lib only loads when actually needed.
  const nodemailer = (await import('nodemailer')).default;

  cachedTransport = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });

  return cachedTransport;
}

export async function sendMail({ to, subject, html, text }: SendArgs): Promise<boolean> {
  try {
    const transport = await getTransport();
    if (!transport) {
      console.warn(`[mail] SMTP not configured — would send to ${to}: "${subject}"`);
      return false;
    }
    const from = process.env.MAIL_FROM || 'Tynky Bordel <noreply@localhost>';
    await transport.sendMail({ from, to, subject, html, text });
    return true;
  } catch (err) {
    console.error('[mail] send failed:', err);
    return false;
  }
}

// ── Order status email ──────────────────────────────────────────────────────────
type OrderForEmail = {
  id: number | string;
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  shippingAddress: string;
  items?: Array<{ title: string; quantity: number; price: number }>;
};

// Hardcoded defaults — used as fallback when a template row is missing in DB.
export const DEFAULT_TEMPLATES: Record<string, { subject: string; headline: string; body: string }> = {
  created: {
    subject: 'Objednávka přijata ✨',
    headline: 'Díky za objednávku!',
    body: 'Tvoji objednávku jsem přijala a chystám ji k odeslání. Ozvu se, jakmile balíček vyrazí.',
  },
  paid: {
    subject: 'Platba přijata 💜',
    headline: 'Platba byla přijata',
    body: 'Peníze dorazily. Chystám balíček a brzy ti dám vědět, že vyrazil na cestu.',
  },
  shipped: {
    subject: 'Tvoje objednávka je na cestě 💌',
    headline: 'Tvoje objednávka je odeslána',
    body: 'Zabalili jsme tvoje kousky a poslali je do světa. Brzy budou u tebe!',
  },
  delivered: {
    subject: 'Tvoje objednávka dorazila ✨',
    headline: 'Tvoje objednávka byla doručena',
    body: 'Snad ti všechno sedí. Kdyby cokoliv, dej vědět — ráda to vyřeším.',
  },
};

export type OrderStatusKey = keyof typeof DEFAULT_TEMPLATES;
export const TEMPLATE_KEYS = Object.keys(DEFAULT_TEMPLATES) as OrderStatusKey[];

// In-memory cache of custom template overrides. TTL keeps admin edits reflected
// within seconds without hammering the DB on every email send.
const TEMPLATE_CACHE_TTL_MS = 30_000;
let cachedTemplates: Record<string, { subject: string; headline: string; body: string }> | null = null;
let cacheExpiresAt = 0;

export function invalidateTemplateCache() {
  cachedTemplates = null;
  cacheExpiresAt = 0;
}

async function getTemplate(key: OrderStatusKey): Promise<{ subject: string; headline: string; body: string }> {
  const def = DEFAULT_TEMPLATES[key];
  const now = Date.now();

  if (!cachedTemplates || now > cacheExpiresAt) {
    try {
      const { db } = await import('./db');
      const { emailTemplates } = await import('../database/schema');
      const rows = await db.select().from(emailTemplates);
      const map: Record<string, { subject: string; headline: string; body: string }> = {};
      for (const row of rows) {
        map[row.key] = { subject: row.subject, headline: row.headline, body: row.body };
      }
      cachedTemplates = map;
      cacheExpiresAt = now + TEMPLATE_CACHE_TTL_MS;
    } catch (err) {
      console.warn('[mail] template DB load failed, using defaults:', err);
      cachedTemplates = {};
      cacheExpiresAt = now + TEMPLATE_CACHE_TTL_MS;
    }
  }

  return cachedTemplates[key] || def;
}

function renderHtml(
  order: OrderForEmail,
  copy: { subject: string; headline: string; body: string },
  extra?: BankTransferBlock,
) {
  const itemsRows = (order.items || [])
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;color:#2a1340;">${i.title} <span style="color:#7a5f8a;">× ${i.quantity}</span></td>
        <td style="padding:8px 0;color:#2a1340;text-align:right;">${(i.price * i.quantity).toFixed(0)} Kč</td>
      </tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="cs">
<head><meta charset="utf-8"><title>${copy.subject}</title></head>
<body style="margin:0;padding:0;background:#FFD8DF;font-family:'Petrona',Georgia,serif;color:#2a1340;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFD8DF;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:rgba(255,255,255,0.65);border:1px solid rgba(42,19,64,0.12);border-radius:18px;overflow:hidden;">
        <tr><td style="padding:32px 32px 16px 32px;">
          <div style="font-family:'Berkshire Swash',cursive;font-size:28px;color:#2a1340;letter-spacing:-0.02em;">🍄 Tynky Bordel</div>
        </td></tr>
        <tr><td style="padding:8px 32px 4px 32px;">
          <h1 style="margin:0;font-family:'Caprasimo',Georgia,serif;font-size:32px;line-height:1.1;color:#2a1340;">${copy.headline}</h1>
        </td></tr>
        <tr><td style="padding:16px 32px 24px 32px;font-size:16px;line-height:1.5;color:#3a2150;">
          Ahoj <strong>${order.customerName}</strong>,<br>${copy.body}
        </td></tr>
        <tr><td style="padding:0 32px 24px 32px;">
          <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#7a5f8a;margin-bottom:8px;">Objednávka č. ${order.id}</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(42,19,64,0.15);">
            ${itemsRows}
            <tr><td style="padding:12px 0 0 0;border-top:1px solid rgba(42,19,64,0.15);font-weight:600;">Celkem</td>
                <td style="padding:12px 0 0 0;border-top:1px solid rgba(42,19,64,0.15);text-align:right;font-weight:600;">${order.totalPrice.toFixed(0)} Kč</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px 24px 32px;font-size:13px;color:#5a3f6a;">
          <strong>Doručovací adresa:</strong><br>
          ${order.shippingAddress.replace(/\n/g, '<br>')}
        </td></tr>
        ${extra ? `
        <tr><td style="padding:0 32px 24px 32px;">
          <div style="background:#fff;border:1px solid rgba(42,19,64,0.12);border-radius:12px;padding:16px 18px;">
            <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#7a5f8a;font-weight:600;margin-bottom:6px;">Platební údaje</div>
            <div style="font-size:14px;color:#2a1340;line-height:1.55;">
              <strong>Číslo účtu (IBAN):</strong> ${extra.iban}<br>
              <strong>Částka:</strong> ${extra.amount.toFixed(0)} Kč<br>
              <strong>Variabilní symbol:</strong> ${extra.variableSymbol}<br>
              <strong>Zpráva pro příjemce:</strong> Objednavka ${extra.variableSymbol}
            </div>
            ${extra.qrDataUrl ? `<div style="text-align:center;margin-top:14px;"><img src="${extra.qrDataUrl}" alt="QR kód pro platbu" width="180" height="180" style="display:inline-block;border-radius:8px;"></div>` : ''}
          </div>
        </td></tr>` : ''}
        <tr><td style="padding:20px 32px;background:rgba(42,19,64,0.05);font-size:12px;color:#5a3f6a;text-align:center;">
          Pssst — shopik ještě není legal 🤫 &nbsp;|&nbsp; Tynky Bordel
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export type BankTransferBlock = {
  iban: string;
  amount: number;
  variableSymbol: string | number;
  qrDataUrl?: string | null;
};

export async function sendOrderStatusEmail(
  order: OrderForEmail,
  status: OrderStatusKey,
  extra?: BankTransferBlock,
): Promise<boolean> {
  if (!order.customerEmail) return false;
  const copy = await getTemplate(status);
  if (!copy) return false;

  return sendMail({
    to: order.customerEmail,
    subject: copy.subject,
    html: renderHtml(order, copy, extra),
    text: `${copy.headline}\n\n${copy.body}\n\nObjednávka #${order.id}, celkem ${order.totalPrice.toFixed(0)} Kč.`,
  });
}
