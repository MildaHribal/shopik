import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function clear() {
  console.log('🗑️  Clearing all data...');
  await db.delete(schema.orderItems);
  await db.delete(schema.orders);
  await db.delete(schema.products);
  await db.delete(schema.categories);
  await db.delete(schema.users);
  console.log('✅ All data cleared!');
  process.exit(0);
}

clear().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
