import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing');
}

const client = postgres(process.env.DATABASE_URL as string, {
  ssl: {
    rejectUnauthorized: false,
  },
});
export const db = drizzle(client, { schema });
