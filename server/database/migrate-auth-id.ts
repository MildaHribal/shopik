import postgres from 'postgres';
import 'dotenv/config';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Missing DATABASE_URL");
  
  const sql = postgres(url, { ssl: 'require' });
  
  try {
    console.log("Running migration...");
    await sql`ALTER TABLE users RENAME COLUMN neon_auth_id TO supabase_auth_id;`;
    console.log("Successfully renamed 'neon_auth_id' to 'supabase_auth_id'!");
  } catch (error: any) {
    if (error.message.includes('does not exist') || error.message.includes('column "neon_auth_id" of relation "users" does not exist')) {
      console.log("Column already renamed or doesn't exist. Continuing.");
    } else {
      console.error("Migration error:", error);
    }
  } finally {
    await sql.end();
  }
}

main().catch(console.error);
