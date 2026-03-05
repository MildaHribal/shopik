import { db } from '../../../utils/db';
import { favorites } from '../../../database/schema';
import { eq, and } from 'drizzle-orm';
import { getOptionalSession } from '../../../utils/session';

export default defineEventHandler(async (event) => {
  const session = await getOptionalSession(event)
  if (!session?.user?.id) {
    return { isFavorite: false };
  }

  const productId = parseInt(event.context.params?.id || '0');
  if (!productId) return { isFavorite: false };

  const existing = await db.query.favorites.findFirst({
    where: and(
      eq(favorites.productId, productId),
      eq(favorites.userId, session.user.id)
    )
  });

  return { isFavorite: !!existing };
});
