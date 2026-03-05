import { db } from '../../utils/db';
import { reviews, products } from '../../database/schema';
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

  const userReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      productName: products.name,
      productSlug: products.slug,
      productImage: products.image
    })
    .from(reviews)
    .innerJoin(products, eq(reviews.productId, products.id))
    .where(eq(reviews.userId, session.user.id))
    .orderBy(desc(reviews.createdAt));

  return userReviews;
});
