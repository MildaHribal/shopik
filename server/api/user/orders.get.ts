import { db } from '../../utils/db';
import { orders, orderItems } from '../../database/schema';
import { eq, desc } from 'drizzle-orm';
import { requireSession } from '../../utils/session';

export default defineEventHandler(async (event) => {
  const session = await requireSession(event)

  const userOrdersRaw = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.user.id))
    .orderBy(desc(orders.createdAt));

  const userOrders = await Promise.all(
    userOrdersRaw.map(async (order) => {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));
      return { ...order, items };
    })
  );

  return userOrders;
});
