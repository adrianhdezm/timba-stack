import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load environment variables from .env file
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

export default defineConfig({
  out: './db/migrations',
  schema: './src/server/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl
  },
  migrations: {
    prefix: 'timestamp',
    table: '__migrations__',
    schema: 'public'
  }
});
