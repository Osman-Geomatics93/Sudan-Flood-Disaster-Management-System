'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft } from 'lucide-react';
import { ORG_TYPES } from '@sudanflood/shared';
import type { OrgType } from '@sudanflood/shared';

export default function CreateOrganizationPage() {
  const t = useTranslations('org');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [acronym, setAcronym] = useState('');
  const [orgType, setOrgType] = useState<OrgType | ''>('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [headquartersStateId, setHeadquartersStateId] = useState('');

  const statesQuery = trpc.organization.listStates.useQuery();

  const createMutation = trpc.organization.create.useMutation({
    onSuccess: (data) => {
      if (data) router.push(`/dashboard/organizations/${data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgType) return;

    createMutation.mutate({
      name_en: nameEn,
      name_ar: nameAr,
      ...(acronym && { acronym }),
      orgType,
      ...(contactEmail && { contactEmail }),
      ...(contactPhone && { contactPhone }),
      ...(website && { website }),
      ...(headquartersStateId && { headquartersStateId }),
    });
  };

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/dashboard/organizations"
          className="btn-secondary flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToList')}
        </Link>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('createOrg')}</h1>
      </div>

      {createMutation.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {createMutation.error.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">{t('name')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('nameEn')}</label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="input-field w-full"
                maxLength={200}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('nameAr')}</label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="input-field w-full"
                dir="rtl"
                maxLength={400}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('acronym')}</label>
              <input
                type="text"
                value={acronym}
                onChange={(e) => setAcronym(e.target.value)}
                className="input-field w-full"
                maxLength={20}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('orgType')}</label>
              <select
                required
                value={orgType}
                onChange={(e) => setOrgType(e.target.value as OrgType)}
                className="input-field w-full"
              >
                <option value="">{t('selectType')}</option>
                {ORG_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`type_${type}` as any)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">{t('contact')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('contactEmail')}</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('contactPhone')}</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">{t('website')}</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="input-field w-full"
                placeholder="https://"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">{t('headquartersState')}</h2>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t('headquartersState')}</label>
            <select
              value={headquartersStateId}
              onChange={(e) => setHeadquartersStateId(e.target.value)}
              className="input-field w-full sm:w-1/2"
            >
              <option value="">{t('selectState')}</option>
              {statesQuery.data?.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name_en}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn-primary"
          >
            {createMutation.isPending ? t('creating') : t('createOrg')}
          </button>
          <Link href="/dashboard/organizations" className="btn-secondary">
            {tCommon('cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
