'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { Phone, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { CALL_URGENCIES, CALL_STATUSES } from '@sudanflood/shared';
import type { CallUrgency, CallStatus } from '@sudanflood/shared';

const URGENCY_STYLES: Record<string, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  life_threatening: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const STATUS_STYLES: Record<string, string> = {
  received: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  triaged: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  dispatched: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  duplicate: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  false_alarm: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export default function EmergencyCallsPage() {
  const t = useTranslations('emergencyCall');
  const tCommon = useTranslations('common');

  const [page, setPage] = useState(1);
  const [urgency, setUrgency] = useState('');
  const [status, setStatus] = useState('');

  const listQuery = trpc.emergencyCall.list.useQuery({
    page,
    limit: 20,
    ...(urgency && { urgency: urgency as CallUrgency }),
    ...(status && { status: status as CallStatus }),
  });

  return (
    <div className="animate-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <Link
          href="/dashboard/emergency-calls/create"
          className="btn-primary flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          {t('create')}
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={urgency}
          onChange={(e) => { setUrgency(e.target.value); setPage(1); }}
          className="input-field"
        >
          <option value="">{t('allUrgencies')}</option>
          {CALL_URGENCIES.map((u) => (
            <option key={u} value={u}>{t(`urgency_${u}`)}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="input-field"
        >
          <option value="">{t('allStatuses')}</option>
          {CALL_STATUSES.map((s) => (
            <option key={s} value={s}>{t(`status_${s}`)}</option>
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
                  <th className="px-4 py-3 text-start font-medium">{t('callCode')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('caller')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('number')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('urgency')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('status')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('personsAtRisk')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('receivedAt')}</th>
                </tr>
              </thead>
              <tbody className="table-premium tbody">
                {listQuery.data.items.map((call) => (
                  <tr key={call.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/emergency-calls/${call.id}`}
                        className="font-mono text-primary dark:text-primary hover:underline"
                      >
                        {call.callCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div>{call.callerName ?? '-'}</div>
                      <div className="text-xs text-muted-foreground">{call.callerPhone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {call.callNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${URGENCY_STYLES[call.urgency] ?? ''}`}>
                        {call.urgency.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_STYLES[call.status] ?? ''}`}>
                        {call.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">{call.personsAtRisk ?? 0}</td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(call.receivedAt).toLocaleString()}
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
