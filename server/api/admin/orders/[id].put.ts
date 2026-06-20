import { db } from '../../../utils/db';
import { orders, orderItems } from '../../../database/schema';
import { eq } from 'drizzle-orm';
import { sendOrderStatusEmail } from '../../../utils/email';

const VALID_STATUSES = ['pending', 'shipped', 'delivered'] as const;
type OrderStatus = typeof VALID_STATUSES[number];

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  const body = await readBody(event);

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID objednávky je povinné' });
  }

  if (!VALID_STATUSES.includes(body.status)) {
    throw createError({ statusCode: 400, statusMessage: 'Neplatný stav objednávky' });
  }

  const newStatus = body.status as OrderStatus;

  // Read current status so we only email on real transitions.
  const existing = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (existing.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Objednávka nenalezena' });
  }
  const prevStatus = existing[0].status as string;

  const updateData: Record<string, any> = {
    status: newStatus,
    updatedAt: new Date(),
  };
  if (body.paymentStatus) {
    updateData.paymentStatus = body.paymentStatus;
  }

  const result = await db
    .update(orders)
    .set(updateData)
    .where(eq(orders.id, id))
    .returning();

  const updated = result[0];

  // Email customer when status flips into shipped or delivered (don't spam on noop).
  if (
    (newStatus === 'shipped' || newStatus === 'delivered') &&
    prevStatus !== newStatus &&
    updated.customerEmail
  ) {
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    // Fire & forget — don't block the response if SMTP is slow.
    sendOrderStatusEmail(
      {
        id: updated.id,
        customerName: updated.customerName,
        customerEmail: updated.customerEmail,
        totalPrice: updated.totalPrice,
        shippingAddress: updated.shippingAddress,
        items: items.map((i) => ({ title: i.title, quantity: i.quantity, price: i.price })),
      },
      newStatus,
    ).catch((err) => console.error('[orders] status email failed:', err));
  }

  return updated;
});
