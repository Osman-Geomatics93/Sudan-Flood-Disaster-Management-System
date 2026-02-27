'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import type { DisplacedPersonStatus, HealthStatus } from '@sudanflood/shared';
import { DISPLACED_PERSON_STATUSES, HEALTH_STATUSES } from '@sudanflood/shared';

const STATUS_STYLES: Record<string, string> = {
  registered: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  sheltered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  relocated: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  returned_home: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  missing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  deceased: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const HEALTH_STYLES: Record<string, string> = {
  healthy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  minor_injury: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  major_injury: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  chronic_condition: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export default function DisplacedPersonsPage() {
  const t = useTranslations('displacedPerson');
  const tCommon = useTranslations('common');
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [healthFilter, setHealthFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const shelterIdParam = searchParams.get('shelterId') ?? undefined;

  const listQuery = trpc.displacedPerson.list.useQuery({
    page,
    limit: 20,
    ...(statusFilter && { status: statusFilter as DisplacedPersonStatus }),
    ...(healthFilter && { healthStatus: healthFilter as HealthStatus }),
    ...(searchInput && { search: searchInput }),
    ...(shelterIdParam && { shelterId: shelterIdParam }),
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/displaced-persons/search"
            className="flex items-center gap-1.5 rounded-md border px-4 py-1.5 text-sm hover:bg-accent"
          >
            <Search className="h-4 w-4" />
            {t('search')}
          </Link>
          <Link
            href="/dashboard/displaced-persons/register"
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {t('register')}
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-md border bg-card px-3 py-2 text-sm"
        >
          <option value="">{t('allStatuses')}</option>
          {DISPLACED_PERSON_STATUSES.map((s) => (
            <option key={s} value={s}>{t(`status_${s}`)}</option>
          ))}
        </select>
        <select
          value={healthFilter}
          onChange={(e) => { setHealthFilter(e.target.value); setPage(1); }}
          className="rounded-md border bg-card px-3 py-2 text-sm"
        >
          <option value="">{t('allHealthStatuses')}</option>
          {HEALTH_STATUSES.map((h) => (
            <option key={h} value={h}>{t(`health_${h}`)}</option>
          ))}
        </select>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
          placeholder={t('searchPlaceholder')}
          className="rounded-md border bg-background px-3 py-2 text-sm min-w-[200px]"
        />
      </div>

      {listQuery.isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {listQuery.data && listQuery.data.items.length === 0 && (
        <div className="rounded-lg border py-12 text-center text-muted-foreground">
          {tCommon('noData')}
        </div>
      )}

      {listQuery.data && listQuery.data.items.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">{t('code')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('nameAr')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('nameEn')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('status')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('healthStatus')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('phone')}</th>
                </tr>
              </thead>
              <tbody>
                {listQuery.data.items.map((person) => (
                  <tr key={person.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono">
                      <Link href={`/dashboard/displaced-persons/${person.id}`} className="text-primary hover:underline">
                        {person.registrationCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3" dir="rtl">
                      <Link href={`/dashboard/displaced-persons/${person.id}`} className="hover:underline">
                        {person.firstName_ar} {person.lastName_ar}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {person.firstName_en && person.lastName_en
                        ? `${person.firstName_en} ${person.lastName_en}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[person.status] ?? ''}`}>
                        {t(`status_${person.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${HEALTH_STYLES[person.healthStatus] ?? ''}`}>
                        {t(`health_${person.healthStatus}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{person.phone ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {listQuery.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t('page')} {listQuery.data.page} / {listQuery.data.totalPages} ({listQuery.data.total} {t('total')})
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={page >= (listQuery.data?.totalPages ?? 1)}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
