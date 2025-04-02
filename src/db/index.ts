import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Initialize Neon connection
const sql = neon(process.env.DATABASE_URL!);

// Create Drizzle instance
export const db = drizzle(sql, { schema });

// Type exports for better TypeScript support
export type DbClient = typeof db;
export { schema }; 