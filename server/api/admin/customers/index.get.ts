import { db } from '../../../utils/db';
import { orders } from '../../../database/schema';

export default defineEventHandler(async () => {
  const allOrders = await db.select().from(orders);

  const customerMap = new Map<string, { name: string; email: string; orders: number; totalSpent: number }>();

  for (const order of allOrders) {
    const existing = customerMap.get(order.customerEmail);
    if (existing) {
      existing.orders++;
      if (order.paymentStatus === 'paid') existing.totalSpent += order.totalPrice;
    } else {
      customerMap.set(order.customerEmail, {
        name: order.customerName,
        email: order.customerEmail,
        orders: 1,
        totalSpent: order.paymentStatus === 'paid' ? order.totalPrice : 0,
      });
    }
  }

  return Array.from(customerMap.values());
});
