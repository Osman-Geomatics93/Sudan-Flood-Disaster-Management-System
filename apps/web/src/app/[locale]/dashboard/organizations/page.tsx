'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { ORG_TYPES } from '@sudanflood/shared';
import type { OrgType } from '@sudanflood/shared';

const TYPE_STYLES: Record<string, string> = {
  government_federal: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  government_state: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  un_agency: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
  international_ngo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  local_ngo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  red_cross_crescent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  military: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  private_sector: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  community_based: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export default function OrganizationsPage() {
  const t = useTranslations('org');
  const tCommon = useTranslations('common');

  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');

  const listQuery = trpc.organization.list.useQuery({
    page,
    limit: 20,
    ...(type && { type: type as OrgType }),
    ...(search && { search }),
  });

  return (
    <div className="animate-in">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <Link
          href="/dashboard/organizations/create"
          className="btn-primary flex items-center gap-1.5 text-sm"
        >
          <Plus className="h-4 w-4" />
          {t('createOrg')}
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative">
          <Search className="text-muted-foreground absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t('searchPlaceholder')}
            className="input-field w-[240px] ps-9"
          />
        </div>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          className="input-field w-auto"
        >
          <option value="">{t('allTypes')}</option>
          {ORG_TYPES.map((orgType) => (
            <option key={orgType} value={orgType}>
              {orgType.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {listQuery.isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      )}

      {listQuery.data && listQuery.data.items.length === 0 && (
        <div className="text-muted-foreground rounded-lg border py-12 text-center">
          {tCommon('noData')}
        </div>
      )}

      {listQuery.data && listQuery.data.items.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="table-premium w-full">
              <thead>
                <tr>
                  <th className="text-muted-foreground px-4 py-3 text-start text-xs font-medium uppercase tracking-wider">
                    {t('name')}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-start text-xs font-medium uppercase tracking-wider">
                    {t('acronym')}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-start text-xs font-medium uppercase tracking-wider">
                    {t('type')}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-start text-xs font-medium uppercase tracking-wider">
                    {t('contact')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {listQuery.data.items.map((org) => (
                  <tr key={org.id} className="hover:bg-accent/50 border-b last:border-0">
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/dashboard/organizations/${org.id}`}
                        className="text-primary text-sm font-medium hover:underline"
                      >
                        {org.name_en}
                      </Link>
                      {org.name_ar && (
                        <div className="text-muted-foreground mt-0.5 text-xs" dir="rtl">
                          {org.name_ar}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-sm">{org.acronym ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`badge ${TYPE_STYLES[org.orgType] ?? ''}`}>
                        {org.orgType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      {org.contactEmail && <div>{org.contactEmail}</div>}
                      {org.contactPhone && (
                        <div className="text-muted-foreground">{org.contactPhone}</div>
                      )}
                      {!org.contactEmail && !org.contactPhone && (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {listQuery.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                {t('page')} {listQuery.data.page} / {listQuery.data.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="btn-secondary disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={page >= (listQuery.data?.totalPages ?? 1)}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-secondary disabled:opacity-50"
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
