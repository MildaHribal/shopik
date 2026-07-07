import { db } from '../../../utils/db';
import { emailTemplates } from '../../../database/schema';
import { requireAdmin } from '../../../utils/session';
import { DEFAULT_TEMPLATES, TEMPLATE_KEYS } from '../../../utils/email';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const rows = await db.select().from(emailTemplates);
  const map = new Map(rows.map((r) => [r.key, r]));

  // Return all known keys, merged with defaults so the admin UI has a stable list.
  return TEMPLATE_KEYS.map((key) => {
    const custom = map.get(key);
    const def = DEFAULT_TEMPLATES[key];
    return {
      key,
      subject: custom?.subject ?? def.subject,
      headline: custom?.headline ?? def.headline,
      body: custom?.body ?? def.body,
      isCustom: !!custom,
      defaults: def,
      updatedAt: custom?.updatedAt ?? null,
    };
  });
});
