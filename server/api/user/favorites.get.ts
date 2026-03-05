import { db } from '../../utils/db';
import { favorites, products } from '../../database/schema';
import { eq, desc } from 'drizzle-orm';
import { requireSession } from '../../utils/session';

export default defineEventHandler(async (event) => {
  const session = await requireSession(event)

  const faves = await db
    .select({
      id: favorites.id,
      product: products,
      createdAt: favorites.createdAt
    })
    .from(favorites)
    .innerJoin(products, eq(favorites.productId, products.id))
    .where(eq(favorites.userId, session.user.id))
    .orderBy(desc(favorites.createdAt));

  return faves.map(f => f.product);
});
