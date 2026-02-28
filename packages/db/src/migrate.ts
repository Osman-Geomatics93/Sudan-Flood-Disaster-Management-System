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
    // Run initial schema migration
    const migrationPath = resolve(__dirname, '../migrations/001_initial_schema.sql');
    const migrationSql = readFileSync(migrationPath, 'utf-8');

    console.log('Running migration: 001_initial_schema.sql');
    try {
      await sql.begin(async (tx) => {
        await tx.unsafe(migrationSql);
      });
      console.log('Migration 001 completed successfully!');
    } catch (e) {
      if (e instanceof Error && e.message.includes('already exists')) {
        console.log('Migration 001 already applied, skipping.');
      } else {
        throw e;
      }
    }

    // Run drizzle-generated migration for new tables (weather_alerts, file_attachments, etc.)
    const drizzleMigrationPath = resolve(__dirname, '../migrations/0000_funny_wasp.sql');
    try {
      const drizzleMigrationSql = readFileSync(drizzleMigrationPath, 'utf-8');
      // Split on statement breakpoints and run each statement individually
      // to skip ones that already exist
      const statements = drizzleMigrationSql
        .split('--> statement-breakpoint')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      console.log('Running migration: 0000_funny_wasp.sql');
      for (const stmt of statements) {
        try {
          await sql.unsafe(stmt);
        } catch (e) {
          if (
            e instanceof Error &&
            (e.message.includes('already exists') || e.message.includes('duplicate key'))
          ) {
            // Skip — table/type/constraint already exists
          } else {
            throw e;
          }
        }
      }
      console.log('Migration 0000 completed successfully!');
    } catch (e) {
      if (e instanceof Error && e.message.includes('ENOENT')) {
        console.log('No drizzle migration file found, skipping.');
      } else {
        throw e;
      }
    }

    console.log('All migrations completed!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();
