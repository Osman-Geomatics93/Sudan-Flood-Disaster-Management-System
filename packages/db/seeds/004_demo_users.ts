import { eq } from 'drizzle-orm';
import { createHash } from 'crypto';
import type { Database } from './types.js';
import { users } from '../src/schema/users.js';
import type { UserRole } from '@sudanflood/shared';

// Simple hash for demo purposes — in production, use bcrypt
// Seeds use SHA-256 as a placeholder; actual auth will use bcrypt
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

interface UserSeed {
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  firstName_en: string;
  firstName_ar: string;
  lastName_en: string;
  lastName_ar: string;
  orgAcronym: string;
  stateCode?: string;
}

const SEED_USERS: UserSeed[] = [
  {
    email: 'admin@nema.gov.sd',
    phone: '+249912345001',
    password: 'Admin@123456',
    role: 'super_admin',
    firstName_en: 'Ahmed',
    firstName_ar: 'أحمد',
    lastName_en: 'Hassan',
    lastName_ar: 'حسن',
    orgAcronym: 'NEMA',
    stateCode: 'KRT',
  },
  {
    email: 'manager@unhcr.org',
    phone: '+249912345002',
    password: 'Agency@123456',
    role: 'agency_admin',
    firstName_en: 'Fatima',
    firstName_ar: 'فاطمة',
    lastName_en: 'Ali',
    lastName_ar: 'علي',
    orgAcronym: 'UNHCR',
    stateCode: 'KRT',
  },
  {
    email: 'manager@wfp.org',
    phone: '+249912345003',
    password: 'Agency@123456',
    role: 'agency_admin',
    firstName_en: 'Omar',
    firstName_ar: 'عمر',
    lastName_en: 'Ibrahim',
    lastName_ar: 'إبراهيم',
    orgAcronym: 'WFP',
    stateCode: 'KRT',
  },
  {
    email: 'manager@srcs.sd',
    phone: '+249912345004',
    password: 'Agency@123456',
    role: 'agency_admin',
    firstName_en: 'Maryam',
    firstName_ar: 'مريم',
    lastName_en: 'Mohamed',
    lastName_ar: 'محمد',
    orgAcronym: 'SRCS',
    stateCode: 'KRT',
  },
  {
    email: 'field1@nema.gov.sd',
    phone: '+249912345005',
    password: 'Field@123456',
    role: 'field_worker',
    firstName_en: 'Khalid',
    firstName_ar: 'خالد',
    lastName_en: 'Osman',
    lastName_ar: 'عثمان',
    orgAcronym: 'NEMA',
    stateCode: 'KRT',
  },
  {
    email: 'field2@srcs.sd',
    phone: '+249912345006',
    password: 'Field@123456',
    role: 'field_worker',
    firstName_en: 'Aisha',
    firstName_ar: 'عائشة',
    lastName_en: 'Abdallah',
    lastName_ar: 'عبدالله',
    orgAcronym: 'SRCS',
    stateCode: 'RNL',
  },
  {
    email: 'field3@wfp.org',
    phone: '+249912345007',
    password: 'Field@123456',
    role: 'field_worker',
    firstName_en: 'Yusuf',
    firstName_ar: 'يوسف',
    lastName_en: 'Adam',
    lastName_ar: 'آدم',
    orgAcronym: 'WFP',
    stateCode: 'WNL',
  },
  {
    email: 'citizen@example.com',
    phone: '+249912345008',
    password: 'Citizen@123456',
    role: 'citizen',
    firstName_en: 'Huda',
    firstName_ar: 'هدى',
    lastName_en: 'Saleh',
    lastName_ar: 'صالح',
    orgAcronym: 'NEMA', // citizens are loosely associated
    stateCode: 'KRT',
  },
];

export async function seedUsers(
  db: Database,
  orgMap: Record<string, string>,
  stateMap: Record<string, string>,
): Promise<number> {
  let count = 0;

  for (const user of SEED_USERS) {
    // Check if already exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1);

    if (existing.length > 0) {
      count++;
      continue;
    }

    const orgId = orgMap[user.orgAcronym];
    const assignedStateId = user.stateCode ? stateMap[user.stateCode] : undefined;

    await db.insert(users).values({
      email: user.email,
      phone: user.phone,
      passwordHash: hashPassword(user.password),
      role: user.role,
      firstName_en: user.firstName_en,
      firstName_ar: user.firstName_ar,
      lastName_en: user.lastName_en,
      lastName_ar: user.lastName_ar,
      orgId: orgId ?? null,
      assignedStateId: assignedStateId ?? null,
      preferredLocale: 'ar',
    });

    count++;
  }

  return count;
}
