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
  const body = await readBody(event);

  if (!body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Název kategorie je povinný',
    });
  }

  const [category] = await db
    .insert(categories)
    .values({
      name: body.name,
      slug: slugify(body.name),
    })
    .returning();

  return category;
});
