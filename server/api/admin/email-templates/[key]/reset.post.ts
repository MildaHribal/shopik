import { db } from '../../../../utils/db';
import { emailTemplates } from '../../../../database/schema';
import { requireAdmin } from '../../../../utils/session';
import { TEMPLATE_KEYS, invalidateTemplateCache } from '../../../../utils/email';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const key = getRouterParam(event, 'key');
  if (!key || !TEMPLATE_KEYS.includes(key as any)) {
    throw createError({ statusCode: 400, statusMessage: 'Neznámý klíč šablony' });
  }

  await db.delete(emailTemplates).where(eq(emailTemplates.key, key));
  invalidateTemplateCache();
  return { success: true };
});
