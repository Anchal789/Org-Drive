import 'server-only';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

declare global {
  var postgresClient: postgres.Sql | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error('Missing required env var: DATABASE_URL');
}

const connectionString = process.env.DATABASE_URL;

const client =
  globalThis.postgresClient ??
  postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.postgresClient = client;
}

export const db = drizzle(client, { schema });
