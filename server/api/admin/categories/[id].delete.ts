import { db } from '../../../utils/db';
import { categories } from '../../../database/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID kategorie je povinné',
    });
  }

  const result = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning();

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Kategorie nenalezena',
    });
  }

  return { success: true, message: 'Kategorie smazána' };
});
