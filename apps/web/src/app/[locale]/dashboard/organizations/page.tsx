'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc-client';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
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
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('title')}</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('searchPlaceholder')}
            className="input-field ps-9 w-[240px]"
          />
        </div>
        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="input-field w-auto"
        >
          <option value="">{t('allTypes')}</option>
          {ORG_TYPES.map((orgType) => (
            <option key={orgType} value={orgType}>{orgType.replace(/_/g, ' ')}</option>
          ))}
        </select>
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
            <table className="table-premium w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-muted-foreground">{t('name')}</th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-muted-foreground">{t('acronym')}</th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-muted-foreground">{t('type')}</th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-muted-foreground">{t('contact')}</th>
                </tr>
              </thead>
              <tbody>
                {listQuery.data.items.map((org) => (
                  <tr key={org.id} className="border-b last:border-0 hover:bg-accent/50">
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-sm">{org.name_en}</div>
                      {org.name_ar && <div className="text-xs text-muted-foreground mt-0.5" dir="rtl">{org.name_ar}</div>}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-sm">{org.acronym ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`badge ${TYPE_STYLES[org.orgType] ?? ''}`}>
                        {org.orgType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      {org.contactEmail && <div>{org.contactEmail}</div>}
                      {org.contactPhone && <div className="text-muted-foreground">{org.contactPhone}</div>}
                      {!org.contactEmail && !org.contactPhone && <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {listQuery.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t('page')} {listQuery.data.page} / {listQuery.data.totalPages}
              </span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary disabled:opacity-50">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button disabled={page >= (listQuery.data?.totalPages ?? 1)} onClick={() => setPage((p) => p + 1)} className="btn-secondary disabled:opacity-50">
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
