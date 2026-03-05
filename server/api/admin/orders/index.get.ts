import { db } from '../../../utils/db';
import { orders, orderItems } from '../../../database/schema';
import { eq, desc } from 'drizzle-orm';

export default defineEventHandler(async () => {
  const allOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));

  // Fetch items for each order
  const result = await Promise.all(
    allOrders.map(async (order) => {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));
      return { ...order, items };
    }),
  );

  return result;
});
