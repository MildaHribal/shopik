/**
 * PayPal Orders v2 helper (server-side).
 *
 * Configure via env:
 *   PAYPAL_ENV=sandbox|live         (default sandbox)
 *   PAYPAL_CLIENT_ID=...
 *   PAYPAL_SECRET=...
 *
 * The client id is also exposed to the browser (NUXT_PUBLIC_PAYPAL_CLIENT_ID)
 * to load the JS SDK — that's expected and safe. The SECRET stays server-only.
 */

const base = () =>
  (process.env.PAYPAL_ENV || 'sandbox') === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

export function paypalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_SECRET);
}

async function accessToken(): Promise<string> {
  if (!paypalConfigured()) {
    throw createError({ statusCode: 500, statusMessage: 'PayPal není nakonfigurován (chybí klíče).' });
  }
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
  const res = await $fetch<{ access_token: string }>(`${base()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  return res.access_token;
}

/** Create a PayPal order (intent CAPTURE) for the given CZK amount. Returns the PayPal order object (has `id`). */
export async function createPaypalOrder(amount: number, opts: { description?: string; reference?: string } = {}): Promise<any> {
  const token = await accessToken();
  return $fetch<any>(`${base()}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: 'CZK', value: amount.toFixed(2) },
          description: opts.description?.slice(0, 127),
          custom_id: opts.reference,
        },
      ],
    },
  });
}

/** Capture an approved PayPal order. Returns the capture result (status should be COMPLETED). */
export async function capturePaypalOrder(paypalOrderId: string): Promise<any> {
  const token = await accessToken();
  return $fetch<any>(`${base()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
}

/** Read a PayPal order (used to cross-check the paid amount before trusting a capture). */
export async function getPaypalOrder(paypalOrderId: string): Promise<any> {
  const token = await accessToken();
  return $fetch<any>(`${base()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
