import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

function getConnectionString(): string {
  const url = process.env['DATABASE_URL'];
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return url;
}

const isProduction = process.env['NODE_ENV'] === 'production';

// Lazy singleton for the query client so it doesn't crash at build time
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _sql: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (!_db) {
    _sql = postgres(getConnectionString(), {
      max: parseInt(process.env['DB_POOL_MAX'] ?? '10', 10),
      idle_timeout: parseInt(process.env['DB_IDLE_TIMEOUT'] ?? '20', 10),
      connect_timeout: parseInt(process.env['DB_CONNECT_TIMEOUT'] ?? '10', 10),
      ...(isProduction && { ssl: { rejectUnauthorized: false } }),
      onnotice: () => {},
    });
    _db = drizzle(_sql, { schema });
  }
  return _db;
}

// For backwards compatibility - uses a proxy to lazily initialize
export const db: ReturnType<typeof drizzle<typeof schema>> = new Proxy(
  {} as ReturnType<typeof drizzle<typeof schema>>,
  {
    get(_target, prop, receiver) {
      const instance = getDb();
      const value = Reflect.get(instance, prop, receiver);
      if (typeof value === 'function') {
        return value.bind(instance);
      }
      return value;
    },
  },
);

export type Database = ReturnType<typeof drizzle<typeof schema>>;

// Connection for migrations (single, non-pooled)
export function createMigrationClient() {
  const migrationClient = postgres(getConnectionString(), { max: 1 });
  return drizzle(migrationClient, { schema });
}

// Graceful shutdown — close the connection pool
export async function closeDb() {
  if (_sql) {
    await _sql.end();
    _sql = null;
    _db = null;
  }
}

// Auto-cleanup on process termination
if (typeof process !== 'undefined') {
  const shutdown = () => {
    closeDb().catch(() => {});
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

export { schema };
