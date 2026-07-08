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
  // Require both host AND user — a half-filled config (host set, no credentials)
  // would otherwise try to connect and hang/fail, slowing down signup/reset.
  if (!host || !process.env.SMTP_USER) {
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

// ── Shared email shell ──────────────────────────────────────────────────────────
// Emails can't rely on webfonts (Gmail/Outlook strip them), so the look is built
// on a warm cream card + deep-plum header with a psychedelic gradient rule, all
// using robust serif fallbacks — the "handmade cosmic receipt" of Tynky Bordel.
const FONT_SERIF = "Georgia,'Times New Roman',serif";
const FONT_SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif";

type PillTone = 'pink' | 'green' | 'violet' | 'teal';
const PILL_TONES: Record<PillTone, { bg: string; fg: string; bd: string }> = {
  pink: { bg: '#fbe0e9', fg: '#b3305f', bd: '#f3b8cd' },
  green: { bg: '#d9f2e4', fg: '#1f7a4d', bd: '#a9dec2' },
  violet: { bg: '#eaddfb', fg: '#6a3fb0', bd: '#cfb4f2' },
  teal: { bg: '#d5f0f2', fg: '#1c7a83', bd: '#a6dfe4' },
};

function statusPill(label: string, tone: PillTone) {
  const t = PILL_TONES[tone];
  return `<span style="display:inline-block;background:${t.bg};color:${t.fg};border:1px solid ${t.bd};font-family:${FONT_SANS};font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;padding:7px 15px;border-radius:999px;">${label}</span>`;
}

/**
 * Wraps inner content in the shared shell (header band + gradient rule + footer).
 * `preheader` is the grey preview line shown by inbox clients.
 */
function emailShell(opts: { subject: string; preheader: string; content: string }) {
  return `<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${opts.subject}</title>
</head>
<body style="margin:0;padding:0;background:#ece3f0;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${opts.preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ece3f0;padding:34px 14px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;background:#fbf4ea;border-radius:22px;overflow:hidden;box-shadow:0 14px 44px rgba(42,19,64,0.16);">
        <tr><td style="background:#1c0d2e;background-image:linear-gradient(135deg,#271247,#160a24);padding:30px 36px 26px;">
          <div style="font-family:${FONT_SANS};font-size:11px;letter-spacing:0.34em;text-transform:uppercase;color:#c6a2ff;margin-bottom:8px;">Ručně dělané originály</div>
          <div style="font-family:${FONT_SERIF};font-size:32px;font-weight:bold;color:#fbf4ea;letter-spacing:0.01em;">Tynky&nbsp;Bordel</div>
        </td></tr>
        <tr><td style="height:5px;line-height:5px;font-size:0;background:#ff5c8a;background-image:linear-gradient(90deg,#ff5c8a 0%,#a878ff 55%,#5ad1ff 100%);">&nbsp;</td></tr>
        <tr><td style="padding:30px 36px 10px;">${opts.content}</td></tr>
        <tr><td style="padding:22px 36px 30px;border-top:1px solid rgba(42,19,64,0.1);">
          <div style="font-family:${FONT_SERIF};font-size:14px;color:#2a1340;font-weight:bold;">Tynky Bordel</div>
          <div style="font-family:${FONT_SANS};font-size:12px;line-height:1.7;color:#8a6f9a;margin-top:3px;">
            Ručně dělané originály — obrazy, sochy, klíčenky.<br>
            <a href="https://www.instagram.com/tynky_bordel/" style="color:#b3305f;text-decoration:none;">Instagram</a>
            &nbsp;·&nbsp;
            <a href="mailto:info@tynkybordel.shop" style="color:#b3305f;text-decoration:none;">info@tynkybordel.shop</a>
          </div>
        </td></tr>
      </table>
      <div style="font-family:${FONT_SANS};font-size:11px;text-align:center;color:#a294ad;margin-top:16px;">© Tynky Bordel · Každý kousek je jeden na světě ✦</div>
    </td></tr>
  </table>
</body></html>`;
}

// ── Account emails (verification / password reset) ──────────────────────────────
/** Renders a branded action email (headline + text + a bulletproof button). */
function renderActionHtml(opts: {
  subject: string;
  preheader: string;
  pill: { label: string; tone: PillTone };
  headline: string;
  intro: string;
  buttonLabel: string;
  url: string;
  footnote?: string;
}) {
  const content = `
    ${statusPill(opts.pill.label, opts.pill.tone)}
    <h1 style="margin:14px 0 0;font-family:${FONT_SERIF};font-size:27px;line-height:1.18;color:#2a1340;">${opts.headline}</h1>
    <p style="margin:14px 0 0;font-family:${FONT_SERIF};font-size:16px;line-height:1.6;color:#4a3560;">${opts.intro}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px;">
      <tr><td style="border-radius:999px;background:#2a1340;background-image:linear-gradient(135deg,#3a1b5c,#2a1340);">
        <a href="${opts.url}" style="display:inline-block;font-family:${FONT_SANS};font-size:15px;font-weight:700;letter-spacing:0.02em;color:#fbf4ea;text-decoration:none;padding:15px 32px;border-radius:999px;">${opts.buttonLabel} →</a>
      </td></tr>
    </table>
    <p style="margin:18px 0 6px;font-family:${FONT_SANS};font-size:12px;line-height:1.55;color:#8a6f9a;">
      Kdyby tlačítko nefungovalo, otevři tento odkaz:<br>
      <a href="${opts.url}" style="color:#7a5f8a;word-break:break-all;">${opts.url}</a>
      ${opts.footnote ? `<br><br>${opts.footnote}` : ''}
    </p>`;
  return emailShell({ subject: opts.subject, preheader: opts.preheader, content });
}

/** Sent after registration so the user can confirm their address (soft, non-blocking). */
export async function sendVerificationEmail(args: { to: string; name?: string; url: string }): Promise<boolean> {
  const greeting = args.name ? `Ahoj <strong>${args.name}</strong>,` : 'Ahoj,';
  return sendMail({
    to: args.to,
    subject: 'Ověř svůj email ✨',
    html: renderActionHtml({
      subject: 'Ověř svůj email',
      preheader: 'Potvrď svůj email a je hotovo.',
      pill: { label: 'Vítej ✦', tone: 'violet' },
      headline: 'Ještě jeden krok',
      intro: `${greeting}<br>díky za registraci u Tynky Bordel! Klikni na tlačítko a potvrď, že tenhle email patří tobě.`,
      buttonLabel: 'Ověřit email',
      url: args.url,
      footnote: 'Pokud sis účet nezakládal/a, tenhle email klidně ignoruj.',
    }),
    text: `Ověř svůj email otevřením tohoto odkazu: ${args.url}`,
  });
}

/** Sent on a password-reset request; the URL leads to the reset-password page. */
export async function sendPasswordResetEmail(args: { to: string; name?: string; url: string }): Promise<boolean> {
  const greeting = args.name ? `Ahoj <strong>${args.name}</strong>,` : 'Ahoj,';
  return sendMail({
    to: args.to,
    subject: 'Obnovení hesla 🔐',
    html: renderActionHtml({
      subject: 'Obnovení hesla',
      preheader: 'Odkaz pro nastavení nového hesla (platí 1 hodinu).',
      pill: { label: 'Obnovení hesla', tone: 'pink' },
      headline: 'Zapomenuté heslo?',
      intro: `${greeting}<br>někdo (snad ty) požádal o obnovení hesla k tvému účtu. Klikni na tlačítko a nastav si nové heslo. Odkaz platí 1 hodinu.`,
      buttonLabel: 'Nastavit nové heslo',
      url: args.url,
      footnote: 'Pokud jsi o obnovení nežádal/a, nic nedělej — heslo zůstává beze změny.',
    }),
    text: `Nastav si nové heslo otevřením tohoto odkazu: ${args.url}`,
  });
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

const ORDER_PILLS: Record<OrderStatusKey, { label: string; tone: PillTone }> = {
  created: { label: 'Objednávka přijata', tone: 'pink' },
  paid: { label: 'Zaplaceno', tone: 'green' },
  shipped: { label: 'Odesláno', tone: 'violet' },
  delivered: { label: 'Doručeno', tone: 'teal' },
};

function renderHtml(
  order: OrderForEmail,
  copy: { subject: string; headline: string; body: string },
  status: OrderStatusKey,
  extra?: BankTransferBlock,
) {
  const itemsRows = (order.items || [])
    .map(
      (i) => `
      <tr>
        <td style="padding:11px 0;border-bottom:1px solid rgba(42,19,64,0.08);font-family:${FONT_SERIF};font-size:15px;color:#2a1340;">${i.title} <span style="color:#9a7fab;">× ${i.quantity}</span></td>
        <td style="padding:11px 0;border-bottom:1px solid rgba(42,19,64,0.08);font-family:${FONT_SERIF};font-size:15px;color:#2a1340;text-align:right;white-space:nowrap;">${(i.price * i.quantity).toLocaleString('cs-CZ')} Kč</td>
      </tr>`,
    )
    .join('');

  const pill = ORDER_PILLS[status] || ORDER_PILLS.created;

  const content = `
    ${statusPill(pill.label, pill.tone)}
    <h1 style="margin:14px 0 0;font-family:${FONT_SERIF};font-size:27px;line-height:1.18;color:#2a1340;">${copy.headline}</h1>
    <p style="margin:14px 0 0;font-family:${FONT_SERIF};font-size:16px;line-height:1.6;color:#4a3560;">
      Ahoj <strong>${order.customerName}</strong>,<br>${copy.body}
    </p>

    <div style="margin-top:28px;font-family:${FONT_SANS};font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#9a7fab;font-weight:700;">Objednávka č. ${order.id}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;border-collapse:collapse;">
      ${itemsRows}
      <tr>
        <td style="padding:14px 0 0;font-family:${FONT_SANS};font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8a6f9a;font-weight:700;vertical-align:bottom;">Celkem</td>
        <td style="padding:14px 0 0;text-align:right;font-family:${FONT_SERIF};font-size:24px;font-weight:bold;color:#2a1340;">${order.totalPrice.toLocaleString('cs-CZ')} Kč</td>
      </tr>
    </table>

    <div style="margin-top:24px;padding:16px 18px;background:rgba(42,19,64,0.04);border-radius:14px;">
      <div style="font-family:${FONT_SANS};font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#8a6f9a;font-weight:700;margin-bottom:6px;">Doručovací adresa</div>
      <div style="font-family:${FONT_SERIF};font-size:15px;color:#3a2150;line-height:1.5;">${order.shippingAddress.replace(/\n/g, '<br>')}</div>
    </div>

    ${extra ? `
    <div style="margin-top:16px;padding:18px 20px;background:#fff;border:1px solid rgba(255,92,138,0.3);border-radius:14px;">
      <div style="font-family:${FONT_SANS};font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#b3305f;font-weight:700;margin-bottom:10px;">Platební údaje — převod na účet</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${FONT_SERIF};font-size:15px;color:#2a1340;line-height:1.7;">
        <tr><td style="color:#8a6f9a;padding-right:12px;">IBAN</td><td style="text-align:right;font-weight:bold;">${extra.iban}</td></tr>
        <tr><td style="color:#8a6f9a;padding-right:12px;">Částka</td><td style="text-align:right;font-weight:bold;">${extra.amount.toLocaleString('cs-CZ')} Kč</td></tr>
        <tr><td style="color:#8a6f9a;padding-right:12px;">Variabilní symbol</td><td style="text-align:right;font-weight:bold;">${extra.variableSymbol}</td></tr>
      </table>
      ${extra.qrDataUrl ? `<div style="text-align:center;margin-top:14px;"><img src="${extra.qrDataUrl}" alt="QR kód pro platbu" width="172" height="172" style="display:inline-block;border-radius:10px;border:1px solid rgba(42,19,64,0.08);"></div>` : ''}
    </div>` : ''}`;

  return emailShell({ subject: copy.subject, preheader: copy.body.slice(0, 90), content });
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
    html: renderHtml(order, copy, status, extra),
    text: `${copy.headline}\n\n${copy.body}\n\nObjednávka #${order.id}, celkem ${order.totalPrice.toFixed(0)} Kč.`,
  });
}
