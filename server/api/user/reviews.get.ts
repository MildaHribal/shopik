import { db } from '../../utils/db';
import { reviews, products } from '../../database/schema';
import { eq, desc } from 'drizzle-orm';
import { requireSession } from '../../utils/session';

export default defineEventHandler(async (event) => {
  const session = await requireSession(event)

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
