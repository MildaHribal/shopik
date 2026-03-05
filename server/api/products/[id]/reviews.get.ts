import { db } from '../../../utils/db';
import { reviews } from '../../../database/schema';
import { eq, desc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const productId = parseInt(event.context.params?.id || '0');
  if (!productId) return [];

  const productReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));

  return productReviews;
});
