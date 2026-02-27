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
    const migrationPath = resolve(__dirname, '../migrations/001_initial_schema.sql');
    const migrationSql = readFileSync(migrationPath, 'utf-8');

    console.log('Running migration: 001_initial_schema.sql');

    // Use sql.file or execute the whole migration via unsafe.
    // postgres.js's unsafe() sends multi-statement SQL in a single
    // simple-query message, which Postgres executes statement-by-statement.
    // However, if ANY statement fails, the entire batch is aborted.
    //
    // To make the migration idempotent, we wrap everything in a
    // transaction so either all succeed or nothing changes.
    await sql.begin(async (tx) => {
      await tx.unsafe(migrationSql);
    });

    console.log('Migration completed successfully!');
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      console.log('Schema already up to date — nothing to migrate.');
    } else {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  } finally {
    await sql.end();
  }
}

migrate();
