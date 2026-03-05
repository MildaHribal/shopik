import { db } from '../../../utils/db';
import { reviews } from '../../../database/schema';
import { serverAuth } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  const sessionData = await serverAuth.api.getSession({
      headers: event.headers
  });
  const session = 'data' in sessionData ? sessionData.data : sessionData;

  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const productId = parseInt(event.context.params?.id || '0');
  if (!productId) throw createError({ statusCode: 400 });

  const body = await readBody(event);
  const { rating, comment } = body;

  const [row] = await db.insert(reviews)
    .values({
      productId,
      userId: session.user.id,
      userName: session.user.name || 'Anonym',
      rating: Number(rating),
      comment
    })
    .returning();

  return row;
});
