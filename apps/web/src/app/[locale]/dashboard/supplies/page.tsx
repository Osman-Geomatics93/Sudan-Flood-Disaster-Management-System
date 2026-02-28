'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SupplyType, SupplyStatus } from '@sudanflood/shared';
import { SUPPLY_TYPES, SUPPLY_STATUSES } from '@sudanflood/shared';
import ExportButton from '@/components/common/ExportButton';

const STATUS_STYLES: Record<string, string> = {
  requested: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  in_transit: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  distributed: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  expired: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  damaged: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function SuppliesPage() {
  const t = useTranslations('supply');
  const tCommon = useTranslations('common');

  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const exportMutation = trpc.export.supplies.useMutation();

  const listQuery = trpc.supply.list.useQuery({
    page,
    limit: 20,
    ...(typeFilter && { type: typeFilter as SupplyType }),
    ...(statusFilter && { status: statusFilter as SupplyStatus }),
  });

  return (
    <div className="animate-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <div className="flex items-center gap-3">
          <ExportButton onExport={(format) => exportMutation.mutateAsync({ format })} />
          <Link
            href="/dashboard/supplies/request"
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {t('requestSupply')}
          </Link>
        </div>
      </div>

      <div className="mb-4 flex gap-3">
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="input-field"
        >
          <option value="">{t('allTypes')}</option>
          {SUPPLY_TYPES.map((s) => (
            <option key={s} value={s}>{t(`type_${s}`)}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field"
        >
          <option value="">{t('allStatuses')}</option>
          {SUPPLY_STATUSES.map((s) => (
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
            <table className="table-premium w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">{t('trackingCode')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('itemName')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('supplyType')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('status')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('quantity')}</th>
                </tr>
              </thead>
              <tbody>
                {listQuery.data.items.map((supply) => (
                  <tr key={supply.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono">
                      <Link href={`/dashboard/supplies/${supply.id}`} className="text-primary hover:underline">
                        {supply.trackingCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{supply.itemName_en}</td>
                    <td className="px-4 py-3">{t(`type_${supply.supplyType}`)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_STYLES[supply.status] ?? ''}`}>
                        {t(`status_${supply.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{supply.quantity} {supply.unit}</td>
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
                  className="btn-secondary"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={page >= (listQuery.data?.totalPages ?? 1)}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-secondary"
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
