import { db } from '../../../utils/db';
import { emailTemplates } from '../../../database/schema';
import { requireAdmin } from '../../../utils/session';
import { DEFAULT_TEMPLATES, TEMPLATE_KEYS, invalidateTemplateCache } from '../../../utils/email';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const key = getRouterParam(event, 'key');
  if (!key || !TEMPLATE_KEYS.includes(key as any)) {
    throw createError({ statusCode: 400, statusMessage: 'Neznámý klíč šablony' });
  }

  const body = await readBody(event);
  const subject = String(body?.subject ?? '').trim();
  const headline = String(body?.headline ?? '').trim();
  const bodyText = String(body?.body ?? '').trim();

  if (!subject || !headline || !bodyText) {
    throw createError({ statusCode: 400, statusMessage: 'Vyplň subject, headline i body' });
  }

  // Upsert. If body === default, we could delete the row, but keeping the row is
  // simpler and makes audit (updatedAt) meaningful.
  const [row] = await db
    .insert(emailTemplates)
    .values({ key, subject, headline, body: bodyText, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: emailTemplates.key,
      set: { subject, headline, body: bodyText, updatedAt: new Date() },
    })
    .returning();

  invalidateTemplateCache();
  return { ...row, defaults: DEFAULT_TEMPLATES[key] };
});
