import { db } from '../../utils/db';
import { categories } from '../../database/schema';

export default defineEventHandler(async () => {
  const result = await db
    .select()
    .from(categories)
    .orderBy(categories.name);

  return result;
});
