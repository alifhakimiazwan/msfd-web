import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

// max:1 keeps connection count low in serverless environments
// prepare:false required for Supabase transaction-mode pooler (port 6543)
const client = postgres(connectionString, { max: 1, prepare: false });
export const db = drizzle(client, { schema });
