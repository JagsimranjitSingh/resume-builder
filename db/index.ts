// db/index.ts or wherever your database connection is defined
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// This is critical for proper connection management
const sql = neon(process.env.DATABASE_URL!);

// Create the database instance with the schema
export const db = drizzle(sql, { schema });