import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../database/schema';

if (!process.env.DATABASE_URL) {
  // Fail fast with a readable message. Without this, postgres.js connects
  // lazily to localhost defaults and the app dies later with an opaque error.
  throw new Error('DATABASE_URL is required — set it in the container environment (e.g. .env.production).');
}

export const queryClient = postgres(process.env.DATABASE_URL);
export const db = drizzle(queryClient, { schema });