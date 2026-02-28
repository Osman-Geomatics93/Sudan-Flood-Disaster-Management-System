'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { OPERATION_STATUSES, TASK_PRIORITIES } from '@sudanflood/shared';
import type { OperationStatus, TaskPriority } from '@sudanflood/shared';

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  dispatched: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  en_route: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  on_site: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  aborted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function RescueOperationsPage() {
  const t = useTranslations('rescue');
  const tCommon = useTranslations('common');

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const listQuery = trpc.rescue.list.useQuery({
    page,
    limit: 20,
    ...(status && { status: status as OperationStatus }),
    ...(priority && { priority: priority as TaskPriority }),
  });

  return (
    <div className="animate-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <Link
          href="/dashboard/rescue-operations/create"
          className="btn-primary flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          {t('createOperation')}
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="input-field"
        >
          <option value="">{t('allStatuses')}</option>
          {OPERATION_STATUSES.map((s) => (
            <option key={s} value={s}>{t(`status_${s}`)}</option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => { setPriority(e.target.value); setPage(1); }}
          className="input-field"
        >
          <option value="">{t('allPriorities')}</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>{t(`priority_${p}`)}</option>
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
              <thead className="table-premium thead">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">{t('operationCode')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('titleLabel')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('type')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('priority')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('status')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('personsAtRisk')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('rescued')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('teamSize')}</th>
                </tr>
              </thead>
              <tbody className="table-premium tbody">
                {listQuery.data.items.map((op) => (
                  <tr key={op.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/rescue-operations/${op.id}`}
                        className="font-mono text-primary dark:text-primary hover:underline"
                      >
                        {op.operationCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{op.title_en}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs">{op.operationType.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${PRIORITY_STYLES[op.priority] ?? ''}`}>
                        {op.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_STYLES[op.status] ?? ''}`}>
                        {op.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">{op.estimatedPersonsAtRisk ?? 0}</td>
                    <td className="px-4 py-3">{op.personsRescued ?? 0}</td>
                    <td className="px-4 py-3">{op.teamSize ?? 0}</td>
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
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button disabled={page >= (listQuery.data?.totalPages ?? 1)} onClick={() => setPage((p) => p + 1)} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50">
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
