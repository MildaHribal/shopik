import { db } from '../../utils/db';
import { users } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { requireSession } from '../../utils/session';

export default defineEventHandler(async (event) => {
  const session = await requireSession(event)

  const method = event.method;

  // --- GET: Načtení profilu ---
  if (method === 'GET') {
    const user = await db.query.users.findFirst({
      where: eq(users.neonAuthId, session.user.id),
    });

    if (user) return user;

    // Uživatel v DB ještě není – vrátíme základní data ze session
    return {
      id: null,
      name: session.user.name || '',
      email: session.user.email || '',
      neonAuthId: session.user.id,
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
    const { name, phone, street, city, zip } = body;

    const existing = await db.query.users.findFirst({
      where: eq(users.neonAuthId, session.user.id),
    });

    if (existing) {
      const [updated] = await db.update(users)
        .set({ name, phone, street, city, zip, updatedAt: new Date() })
        .where(eq(users.neonAuthId, session.user.id))
        .returning();
      return updated;
    }

    const [created] = await db.insert(users)
      .values({
        name: name || session.user.name || 'Uživatel',
        email: session.user.email || '',
        neonAuthId: session.user.id,
        phone: phone || null,
        street: street || null,
        city: city || null,
        zip: zip || null,
      })
      .returning();
    return created;
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
});
