import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const url = process.env['DATABASE_URL'];
  if (!url) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const sql = postgres(url, { max: 1 });

  try {
    // Run the raw SQL migration file
    const migrationPath = resolve(__dirname, '../migrations/001_initial_schema.sql');
    const migrationSql = readFileSync(migrationPath, 'utf-8');

    console.log('Running migration: 001_initial_schema.sql');

    // Split by statement and execute (handle multi-statement SQL)
    // We need to execute the whole file as-is since it has functions, triggers, etc.
    await sql.unsafe(migrationSql);

    console.log('Migration completed successfully!');
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      console.log('Schema already exists, skipping migration.');
    } else {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  } finally {
    await sql.end();
  }
}

migrate();
