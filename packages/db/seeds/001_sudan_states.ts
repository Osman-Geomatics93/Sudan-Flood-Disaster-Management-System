import { eq } from 'drizzle-orm';
import type { Database } from './types.js';
import { states } from '../src/schema/locations.js';
import { SUDAN_STATES } from '@sudanflood/shared';

export async function seedStates(db: Database): Promise<Record<string, string>> {
  const stateMap: Record<string, string> = {};

  for (const state of SUDAN_STATES) {
    // Check if already exists
    const existing = await db
      .select({ id: states.id })
      .from(states)
      .where(eq(states.code, state.code))
      .limit(1);

    if (existing.length > 0) {
      stateMap[state.code] = existing[0]!.id;
      continue;
    }

    const [inserted] = await db
      .insert(states)
      .values({
        code: state.code,
        name_en: state.name_en,
        name_ar: state.name_ar,
      })
      .returning({ id: states.id });

    if (inserted) {
      stateMap[state.code] = inserted.id;
    }
  }

  return stateMap;
}
