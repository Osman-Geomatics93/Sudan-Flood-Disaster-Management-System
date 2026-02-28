import { eq } from 'drizzle-orm';
import type { Database } from './types.js';
import { organizations } from '../src/schema/organizations.js';
import type { OrgType } from '@sudanflood/shared';

interface OrgSeed {
  name_en: string;
  name_ar: string;
  acronym: string;
  orgType: OrgType;
  contactEmail: string;
  stateCode?: string; // for linking headquarters
}

const SEED_ORGS: OrgSeed[] = [
  {
    name_en: 'National Emergency Management Authority',
    name_ar: 'الهيئة الوطنية لإدارة الطوارئ',
    acronym: 'NEMA',
    orgType: 'government_federal',
    contactEmail: 'info@nema.gov.sd',
    stateCode: 'KRT',
  },
  {
    name_en: 'Humanitarian Aid Commission',
    name_ar: 'مفوضية العون الإنساني',
    acronym: 'HAC',
    orgType: 'government_federal',
    contactEmail: 'info@hac.gov.sd',
    stateCode: 'KRT',
  },
  {
    name_en: 'Khartoum State Emergency Committee',
    name_ar: 'لجنة طوارئ ولاية الخرطوم',
    acronym: 'KSEC',
    orgType: 'government_state',
    contactEmail: 'emergency@khartoum.gov.sd',
    stateCode: 'KRT',
  },
  {
    name_en: 'United Nations High Commissioner for Refugees',
    name_ar: 'المفوضية السامية للأمم المتحدة لشؤون اللاجئين',
    acronym: 'UNHCR',
    orgType: 'un_agency',
    contactEmail: 'sudkh@unhcr.org',
    stateCode: 'KRT',
  },
  {
    name_en: 'World Food Programme',
    name_ar: 'برنامج الأغذية العالمي',
    acronym: 'WFP',
    orgType: 'un_agency',
    contactEmail: 'wfp.sudan@wfp.org',
    stateCode: 'KRT',
  },
  {
    name_en: "United Nations Children's Fund",
    name_ar: 'منظمة الأمم المتحدة للطفولة',
    acronym: 'UNICEF',
    orgType: 'un_agency',
    contactEmail: 'khartoum@unicef.org',
    stateCode: 'KRT',
  },
  {
    name_en: 'Office for the Coordination of Humanitarian Affairs',
    name_ar: 'مكتب تنسيق الشؤون الإنسانية',
    acronym: 'OCHA',
    orgType: 'un_agency',
    contactEmail: 'ocha-sudan@un.org',
    stateCode: 'KRT',
  },
  {
    name_en: 'International Committee of the Red Cross',
    name_ar: 'اللجنة الدولية للصليب الأحمر',
    acronym: 'ICRC',
    orgType: 'red_cross_crescent',
    contactEmail: 'khartoum@icrc.org',
    stateCode: 'KRT',
  },
  {
    name_en: 'Sudanese Red Crescent Society',
    name_ar: 'جمعية الهلال الأحمر السوداني',
    acronym: 'SRCS',
    orgType: 'red_cross_crescent',
    contactEmail: 'info@srcs.sd',
    stateCode: 'KRT',
  },
  {
    name_en: 'Doctors Without Borders',
    name_ar: 'أطباء بلا حدود',
    acronym: 'MSF',
    orgType: 'international_ngo',
    contactEmail: 'msf-sudan@msf.org',
    stateCode: 'KRT',
  },
  {
    name_en: 'Save the Children',
    name_ar: 'منظمة إنقاذ الطفولة',
    acronym: 'SCI',
    orgType: 'international_ngo',
    contactEmail: 'sudan@savethechildren.org',
    stateCode: 'KRT',
  },
  {
    name_en: 'World Vision International',
    name_ar: 'منظمة الرؤية العالمية',
    acronym: 'WVI',
    orgType: 'international_ngo',
    contactEmail: 'sudan@wvi.org',
    stateCode: 'KRT',
  },
  {
    name_en: 'Sudanese Engineers Society',
    name_ar: 'جمعية المهندسين السودانيين',
    acronym: 'SES',
    orgType: 'local_ngo',
    contactEmail: 'info@ses.sd',
    stateCode: 'KRT',
  },
  {
    name_en: 'Sudan Armed Forces - Rescue Division',
    name_ar: 'القوات المسلحة السودانية - فرقة الإنقاذ',
    acronym: 'SAF-RD',
    orgType: 'military',
    contactEmail: 'rescue@saf.mil.sd',
    stateCode: 'KRT',
  },
];

export async function seedOrganizations(
  db: Database,
  stateMap: Record<string, string>,
): Promise<Record<string, string>> {
  const orgMap: Record<string, string> = {};

  for (const org of SEED_ORGS) {
    // Check if already exists
    const existing = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.acronym, org.acronym))
      .limit(1);

    if (existing.length > 0) {
      orgMap[org.acronym] = existing[0]!.id;
      continue;
    }

    const headquartersStateId = org.stateCode ? stateMap[org.stateCode] : undefined;

    const [inserted] = await db
      .insert(organizations)
      .values({
        name_en: org.name_en,
        name_ar: org.name_ar,
        acronym: org.acronym,
        orgType: org.orgType,
        contactEmail: org.contactEmail,
        headquartersStateId: headquartersStateId ?? null,
      })
      .returning({ id: organizations.id });

    if (inserted) {
      orgMap[org.acronym] = inserted.id;
    }
  }

  return orgMap;
}
