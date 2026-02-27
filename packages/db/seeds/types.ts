import type { drizzle } from 'drizzle-orm/postgres-js';
import type * as schema from '../src/schema/index.js';

export type Database = ReturnType<typeof drizzle<typeof schema>>;
