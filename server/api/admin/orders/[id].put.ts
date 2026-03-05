import { db } from '../../../utils/db';
import { orders } from '../../../database/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID objednávky je povinné',
    });
  }

  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(body.status)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Neplatný stav objednávky',
    });
  }

  const updateData: Record<string, any> = {
    status: body.status,
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

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Objednávka nenalezena',
    });
  }

  return result[0];
});
