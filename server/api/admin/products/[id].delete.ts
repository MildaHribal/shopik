import { db } from '../../../utils/db';
import { products } from '../../../database/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID produktu je povinné',
    });
  }

  const result = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning();

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Produkt nenalezen',
    });
  }

  return { success: true, message: 'Produkt smazán' };
});
