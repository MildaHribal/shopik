import { db } from '../../../utils/db';
import { favorites } from '../../../database/schema';
import { serverAuth } from '../../../utils/auth';
import { eq, and } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const sessionData = await serverAuth.api.getSession({
      headers: event.headers
  });
  const session = 'data' in sessionData ? sessionData.data : sessionData;

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
