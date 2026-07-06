import { db } from '../../utils/db';
import { user as userTable } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { requireSession } from '../../utils/session';

export default defineEventHandler(async (event) => {
  const session = await requireSession(event)
  const userId = session.user.id
  const method = getMethod(event)

  if (method === 'GET') {
    const u = await db.query.user.findFirst({ where: eq(userTable.id, userId) });
    if (u) return u;
    return null;
  }

  if (method === 'PATCH') {
    const body = await readBody(event);
    const name = body?.name ? String(body.name).trim() : undefined
    const phone = body?.phone !== undefined ? (body.phone ? String(body.phone).trim() : null) : undefined
    const street = body?.street !== undefined ? (body.street ? String(body.street).trim() : null) : undefined
    const city = body?.city !== undefined ? (body.city ? String(body.city).trim() : null) : undefined
    const zip = body?.zip !== undefined ? (body.zip ? String(body.zip).trim() : null) : undefined

    const patch: Record<string, unknown> = { updatedAt: new Date() }
    if (name !== undefined) patch.name = name
    if (phone !== undefined) patch.phone = phone
    if (street !== undefined) patch.street = street
    if (city !== undefined) patch.city = city
    if (zip !== undefined) patch.zip = zip

    const [updated] = await db.update(userTable)
      .set(patch)
      .where(eq(userTable.id, userId))
      .returning();
    return updated;
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
});
