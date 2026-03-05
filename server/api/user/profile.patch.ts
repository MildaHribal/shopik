import { db } from '../../utils/db';
import { users } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { serverAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const sessionData = await serverAuth.api.getSession({
      headers: event.headers
  });
  const session = 'data' in sessionData ? sessionData.data : sessionData;

  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const body = await readBody(event);
  const { name, phone, street, city, zip } = body;

  const [updated] = await db.update(users)
    .set({ name, phone, street, city, zip, updatedAt: new Date() })
    .where(eq(users.neonAuthId, session.user.id))
    .returning();

  return updated;
});
