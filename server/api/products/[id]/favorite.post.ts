import { db } from '../../../utils/db';
import { favorites } from '../../../database/schema';
import { eq, and } from 'drizzle-orm';
import { requireSession } from '../../../utils/session';

export default defineEventHandler(async (event) => {
  const session = await requireSession(event)

  const productId = parseInt(event.context.params?.id || '0');
  if (!productId) throw createError({ statusCode: 400 });

  const existing = await db.query.favorites.findFirst({
    where: and(
      eq(favorites.productId, productId),
      eq(favorites.userId, session.user.id)
    )
  });

  if (existing) {
    await db.delete(favorites).where(eq(favorites.id, existing.id));
    return { isFavorite: false };
  } else {
    await db.insert(favorites).values({
      productId,
      userId: session.user.id
    });
    return { isFavorite: true };
  }
});
