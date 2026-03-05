import { db } from '../../../utils/db';
import { categories } from '../../../database/schema';
import { eq } from 'drizzle-orm';

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID kategorie je povinné',
    });
  }

  const updateData: Record<string, any> = {};
  if (body.name) {
    updateData.name = body.name;
    updateData.slug = slugify(body.name);
  }

  const result = await db
    .update(categories)
    .set(updateData)
    .where(eq(categories.id, id))
    .returning();

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Kategorie nenalezena',
    });
  }

  return result[0];
});
