import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import postgres from 'postgres';

/**
 * Apply pending SQL migrations on server startup (production only).
 *
 * Why: the deploy pipeline is `git push → image build → webhook restart`. It
 * NEVER runs the manual `migrate.ts` step, so a schema change would otherwise
 * never reach the VPS (and code expecting the new columns would 500). Running
 * migrations here means a plain code push is enough to migrate production.
 *
 * Tracking mirrors migrate.ts: applied files are recorded in `_migrations`, so
 * each migration runs at most once. It's also defensive about a DB that was
 * initialised WITHOUT that tracking table (e.g. via drizzle-kit push): an
 * "already exists" error is treated as already-applied and recorded, rather than
 * aborting — so pre-existing schemas converge cleanly and new migrations still run.
 *
 * Failures on a genuinely new migration are logged loudly but do NOT crash the
 * app — a bad migration shouldn't take the whole storefront offline.
 */

// Postgres "object already exists" SQLSTATEs: duplicate_table / _object /
// _column / _database. Treated as "this migration's effect is already present".
const ALREADY_EXISTS = new Set(['42P07', '42710', '42701', '42P04', '42P06', '42723']);

export default defineNitroPlugin(async () => {
  if (process.env.NODE_ENV !== 'production') return;
  if (process.env.DISABLE_BOOT_MIGRATE === 'true') return;

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('[migrate] DATABASE_URL not set — skipping boot migrations.');
    return;
  }

  // The Dockerfile copies server/database → /app/server/database, and cwd is /app.
  const candidates = [
    resolve(process.cwd(), 'server/database/migrations'),
    resolve(process.cwd(), '.output/server/database/migrations'),
  ];
  let dir: string | null = null;
  for (const c of candidates) {
    try {
      await readdir(c);
      dir = c;
      break;
    } catch {
      /* try next */
    }
  }
  if (!dir) {
    console.error('[migrate] migrations folder not found; skipping. Looked in:', candidates);
    return;
  }

  // `onnotice` off: IF NOT EXISTS / DO blocks emit NOTICE spam we don't want in logs.
  const sql = postgres(url, { max: 1, onnotice: () => {} });
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS _migrations (
        name text PRIMARY KEY,
        applied_at timestamp NOT NULL DEFAULT now()
      )
    `;

    const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
    const appliedRows = (await sql`SELECT name FROM _migrations`) as unknown as Array<{ name: string }>;
    const applied = new Set((appliedRows ?? []).map((r) => r.name));

    let applied_count = 0;
    for (const file of files) {
      if (applied.has(file)) continue;
      const contents = await readFile(resolve(dir, file), 'utf-8');
      try {
        await sql.unsafe(contents);
        await sql`INSERT INTO _migrations (name) VALUES (${file})`;
        applied_count++;
        console.log(`[migrate] applied ${file}`);
      } catch (err: any) {
        if (ALREADY_EXISTS.has(err?.code)) {
          // Objects already present (DB initialised without tracking) — record it
          // so we don't retry every boot, and move on.
          await sql`INSERT INTO _migrations (name) VALUES (${file}) ON CONFLICT DO NOTHING`;
          console.warn(`[migrate] ${file}: objects already exist — marking as applied.`);
        } else {
          // A real failure on a needed migration. Log loudly and stop (don't record),
          // so it's retried next boot once fixed — but keep the app running.
          console.error(`[migrate] ✖ ${file} failed (app continues, feature may be degraded):`, err?.message || err);
          break;
        }
      }
    }
    if (applied_count) console.log(`[migrate] ✔ ${applied_count} migration(s) applied on boot.`);
  } catch (err) {
    console.error('[migrate] ✖ boot migration error (app continues):', err);
  } finally {
    await sql.end();
  }
});
