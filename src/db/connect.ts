import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Ensure the DATABASE_URL is set in your environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);

// Initialize Drizzle with the Neon serverless driver and your schema
export const db = drizzle(sql, { schema }); 