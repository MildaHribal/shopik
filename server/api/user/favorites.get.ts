import { db } from '../../utils/db';
import { favorites, products } from '../../database/schema';
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
