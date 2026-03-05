import { db } from '../../utils/db';
import { users } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { requireSession } from '../../utils/session';

export default defineEventHandler(async (event) => {
  const session = await requireSession(event)
  const userId = session.user?.id
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const userName = session.user?.name || ''
  const userEmail = session.user?.email || ''
  const method = getMethod(event)

  // --- GET: Načtení profilu ---
  if (method === 'GET') {
    const user = await db.query.users.findFirst({
      where: eq(users.neonAuthId, userId),
    });

    if (user) return user;

    // Uživatel v DB ještě není – vrátíme základní data ze session
    return {
      id: null,
      name: userName,
      email: userEmail,
      neonAuthId: userId,
      phone: null,
      street: null,
      city: null,
      zip: null,
      createdAt: null,
      updatedAt: null,
    };
  }

  // --- PATCH: Uložení profilu ---
  if (method === 'PATCH') {
    const body = await readBody(event);
    const name = String(body?.name || userName || 'Uživatel').trim()
    const phone = body?.phone ? String(body.phone).trim() : null
    const street = body?.street ? String(body.street).trim() : null
    const city = body?.city ? String(body.city).trim() : null
    const zip = body?.zip ? String(body.zip).trim() : null
    const email = userEmail || `${userId}@no-email.local`

    const existing = await db.query.users.findFirst({
      where: eq(users.neonAuthId, userId),
    });

    if (existing) {
      const [updated] = await db.update(users)
        .set({ name, phone, street, city, zip, updatedAt: new Date() })
        .where(eq(users.neonAuthId, userId))
        .returning();
      return updated;
    }

    const [created] = await db.insert(users)
      .values({
        name,
        email,
        neonAuthId: userId,
        phone,
        street,
        city,
        zip,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          neonAuthId: userId,
          name,
          phone,
          street,
          city,
          zip,
          updatedAt: new Date(),
        },
      })
      .returning();
    return created;
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
});
