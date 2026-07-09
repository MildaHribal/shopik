import { getOptionalSession } from '../../utils/session';
import { sendOrderStatusEmail } from '../../utils/email';
import { capturePaypalOrder, paypalConfigured } from '../../utils/paypal';
import { persistOrder } from '../../utils/createOrder';

/**
 * Capture an approved PayPal payment, then create the internal order as PAID.
 *
 * Flow: the money is captured first; only on a COMPLETED capture do we persist
 * the order. If persistence fails after a successful capture we log the capture
 * id loudly so the payment can be reconciled manually (rare — a DB insert right
 * after a successful HTTP capture).
 */
export default defineEventHandler(async (event) => {
  if (!paypalConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Platba kartou není momentálně dostupná.' });
  }

  const body = await readBody(event);
  const paypalOrderId = body?.paypalOrderId;
  if (!paypalOrderId) {
    throw createError({ statusCode: 400, statusMessage: 'Chybí ID PayPal platby' });
  }

  // 1) Capture the money.
  const capture = await capturePaypalOrder(String(paypalOrderId));
  if (capture?.status !== 'COMPLETED') {
    throw createError({ statusCode: 402, statusMessage: 'Platba nebyla dokončena' });
  }
  const captureId = capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id || paypalOrderId;

  // 2) Persist the order as paid. Force the card payment method.
  const session = await getOptionalSession(event);
  let result;
  try {
    result = await persistOrder(
      { ...body, paymentMethod: 'card' },
      { userId: session?.user?.id ?? null, paymentStatus: 'paid' },
    );
  } catch (err) {
    console.error(`[paypal] CAPTURED but order persist FAILED — reconcile manually. captureId=${captureId}`, err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Platba proběhla, ale objednávku se nepodařilo uložit. Napiš nám prosím na info@tynkybordel.shop.',
    });
  }

  const { order, items } = result;

  // Confirmation email (the "paid" template doubles as the order confirmation).
  sendOrderStatusEmail(
    {
      id: order.orderNumber || order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      totalPrice: order.totalPrice,
      shippingAddress: order.shippingAddress,
      items: items.map((i) => ({ title: i.title, quantity: i.quantity, price: i.price })),
    },
    'paid',
  ).catch((err) => console.error('[paypal] paid email failed:', err));

  return {
    success: true,
    orderId: order.id,
    orderNumber: order.orderNumber || String(order.id),
  };
});
