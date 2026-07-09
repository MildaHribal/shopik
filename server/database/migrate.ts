/**
 * One-shot migration runner. Applies every SQL file in ./migrations/*.sql
 * in lexicographic order, tracking applied files in a `_migrations` table.
 *
 * Idempotent — safe to run on every deploy. Prints a summary and exits.
 */

import 'dotenv/config';
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const sql = postgres(url, { max: 1 });

  await sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      name text PRIMARY KEY,
      applied_at timestamp NOT NULL DEFAULT now()
    )
  `;

  const dir = join(__dirname, 'migrations');
  const files = (await readdir(dir))
    .filter((f) => f.endsWith('.sql'))
    .sort();

  // postgres-js returns the rows array directly (no `.rows` wrapper) — reading
  // `.rows` here left `applied` empty, so re-runs re-applied every file (and blew
  // up on the non-idempotent 0000). Read the array directly.
  const appliedRows = (await sql`SELECT name FROM _migrations`) as unknown as Array<{ name: string }>;
  const applied = new Set((appliedRows ?? []).map((r) => r.name));

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  · ${file} (already applied)`);
      continue;
    }
    console.log(`  → ${file} …`);
    const contents = await readFile(join(dir, file), 'utf-8');
    await sql.unsafe(contents);
    await sql`INSERT INTO _migrations (name) VALUES (${file})`;
    count++;
  }

  console.log(`✔ Migrations complete (${count} newly applied).`);
  await sql.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('✖ Migration failed:', err);
  process.exit(1);
});
