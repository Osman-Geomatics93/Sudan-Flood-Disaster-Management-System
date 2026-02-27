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

// Lazy singleton for the query client so it doesn't crash at build time
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    const queryClient = postgres(getConnectionString(), {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    _db = drizzle(queryClient, { schema });
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

export { schema };
