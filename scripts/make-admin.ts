/**
 * Promote a user to admin (or demote back to a normal user).
 *
 * The `role` column lives only in the database — there is no UI for it, so this
 * one-off script is the way to grant admin access. Run it on the machine that
 * has the target DATABASE_URL in scope (i.e. the production server / container).
 *
 * Usage:
 *   npx tsx scripts/make-admin.ts <email>            # promote to admin
 *   npx tsx scripts/make-admin.ts <email> user       # demote to normal user
 *
 * On production (inside the app container), DATABASE_URL is already set, so:
 *   npx tsx scripts/make-admin.ts kikizaj12@gmail.com
 */
import 'dotenv/config';
import postgres from 'postgres';

const email = process.argv[2]?.trim().toLowerCase();
const role = (process.argv[3]?.trim() || 'admin').toLowerCase();

if (!email) {
  console.error('❌ Zadej email: npx tsx scripts/make-admin.ts <email> [admin|user]');
  process.exit(1);
}
if (role !== 'admin' && role !== 'user') {
  console.error(`❌ Neplatná role "${role}" — použij "admin" nebo "user".`);
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL není nastavené — spusť skript tam, kde je databáze dostupná (produkční server).');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL);

try {
  // Case-insensitive match so "Kikizaj12@gmail.com" and "kikizaj12@gmail.com" both hit.
  const rows = await sql`
    UPDATE "user"
    SET role = ${role}, updated_at = now()
    WHERE lower(email) = ${email}
    RETURNING id, email, role
  `;

  if (rows.length === 0) {
    console.error(`❌ Uživatel s emailem "${email}" v databázi neexistuje.`);
    console.error('   (Účet musí nejdřív alespoň jednou být přihlášený/zaregistrovaný, aby existoval v DB.)');
    process.exit(1);
  }

  for (const r of rows) {
    console.log(`✅ ${r.email} → role: ${r.role}`);
  }
} catch (err) {
  console.error('❌ Chyba při aktualizaci role:', err);
  process.exit(1);
} finally {
  await sql.end();
}
