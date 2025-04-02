import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as relations from './relations';

// Configure Neon to work with Edge Functions
neonConfig.fetchConnectionCache = true;

// Create SQL client directly using the unpooled URL
const sql = neon(process.env.DATABASE_URL_UNPOOLED!);

// Create Drizzle instance
export const db = drizzle(sql, { 
  schema: { ...schema, ...relations },
  casing: 'snake_case' 
});

// Helper to check if the database is connected
export async function checkDatabaseConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    return { connected: true, timestamp: result[0].now };
  } catch (error) {
    console.error('Database connection error:', error);
    return { connected: false, error };
  }
}

export * from './schema'; 