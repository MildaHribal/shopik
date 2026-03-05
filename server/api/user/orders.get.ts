import { db } from '../../utils/db';
import { orders, orderItems } from '../../database/schema';
import { eq, desc } from 'drizzle-orm';
import { serverAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const sessionData = await serverAuth.api.getSession({
      headers: event.headers
  });
  const session = 'data' in sessionData ? sessionData.data : sessionData;

  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

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
