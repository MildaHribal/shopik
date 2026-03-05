import { db } from '../../../utils/db';
import { reviews } from '../../../database/schema';
import { and, eq } from 'drizzle-orm';
import { requireSession } from '../../../utils/session';

export default defineEventHandler(async (event) => {
  const session = await requireSession(event)
  const userId = session.user?.id
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const userName = session.user?.name || 'Anonym'

  const productId = parseInt(event.context.params?.id || '0');
  if (!productId) throw createError({ statusCode: 400 });

  const body = await readBody(event);
  const rating = Number(body?.rating)
  const comment = body?.comment ? String(body.comment).trim() : null
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw createError({ statusCode: 400, statusMessage: 'Neplatné hodnocení' })
  }
  if (comment && comment.length > 1000) {
    throw createError({ statusCode: 400, statusMessage: 'Komentář je příliš dlouhý' })
  }

  const existing = await db.query.reviews.findFirst({
    where: and(eq(reviews.productId, productId), eq(reviews.userId, userId))
  })

  if (existing) {
    const [updated] = await db.update(reviews)
      .set({
        rating,
        comment,
        userName,
      })
      .where(eq(reviews.id, existing.id))
      .returning()
    return updated
  }

  const [row] = await db.insert(reviews)
    .values({
      productId,
      userId,
      userName,
      rating,
      comment
    })
    .returning();

  return row;
});
