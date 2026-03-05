import { db } from '../../../utils/db';
import { reviews } from '../../../database/schema';
import { requireSession } from '../../../utils/session';

export default defineEventHandler(async (event) => {
  const session = await requireSession(event)

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
