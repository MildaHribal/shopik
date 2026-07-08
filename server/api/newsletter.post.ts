import { db } from '../utils/db';
import { newsletterSubscribers } from '../database/schema';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const email = String(body?.email || '').trim().toLowerCase();

  if (!email || !EMAIL_RE.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Neplatná e-mailová adresa.' });
  }

  try {
    // Idempotent: re-subscribing with the same email is a silent success.
    await db
      .insert(newsletterSubscribers)
      .values({ email })
      .onConflictDoNothing({ target: newsletterSubscribers.email });
  } catch (err) {
    console.error('[newsletter] insert failed:', err);
    throw createError({ statusCode: 500, statusMessage: 'Nepodařilo se uložit. Zkuste to prosím znovu.' });
  }

  return { ok: true };
});
