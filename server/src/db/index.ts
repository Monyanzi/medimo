import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

// Get the database URL from environment
const getDatabaseUrl = () => {
    const url = process.env.DATABASE_URL;
    if (!url) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    return url;
};

// Detect if we're using Neon (serverless) or local PostgreSQL
const databaseUrl = getDatabaseUrl();
const isNeonDb = databaseUrl.includes('neon.tech') || databaseUrl.includes('neon.database');

// Create the appropriate database connection
let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzleNode>;

if (isNeonDb) {
    // Neon serverless connection
    const sql = neon(databaseUrl);
    db = drizzleNeon(sql, { schema });
    console.log('📡 Using Neon serverless database');
} else {
    // Standard PostgreSQL connection (local, Docker, or other hosted)
    const pool = new pg.Pool({
        connectionString: databaseUrl,
    });
    db = drizzleNode(pool, { schema });
    console.log('🐘 Using local PostgreSQL database');
}

export { db };

// Export schema for use in queries
export * from './schema';
