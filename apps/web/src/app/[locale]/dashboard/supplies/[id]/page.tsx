'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft, CheckCircle, XCircle, Truck, Package, Ban } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  requested: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  in_transit: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  distributed: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  expired: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  damaged: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const TIMELINE_STEPS = ['requested', 'approved', 'in_transit', 'delivered'] as const;

export default function SupplyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations('supply');
  const tCommon = useTranslations('common');
  const utils = trpc.useUtils();

  const supplyQuery = trpc.supply.getById.useQuery({ id });

  const approveMutation = trpc.supply.approve.useMutation({
    onSuccess: () => utils.supply.getById.invalidate({ id }),
  });
  const rejectMutation = trpc.supply.reject.useMutation({
    onSuccess: () => utils.supply.getById.invalidate({ id }),
  });
  const shipMutation = trpc.supply.ship.useMutation({
    onSuccess: () => utils.supply.getById.invalidate({ id }),
  });
  const deliverMutation = trpc.supply.markDelivered.useMutation({
    onSuccess: () => utils.supply.getById.invalidate({ id }),
  });
  const cancelMutation = trpc.supply.cancel.useMutation({
    onSuccess: () => utils.supply.getById.invalidate({ id }),
  });

  if (supplyQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (supplyQuery.error || !supplyQuery.data) {
    return <div className="text-muted-foreground py-12 text-center">{tCommon('error')}</div>;
  }

  const supply = supplyQuery.data;
  const currentStepIndex = TIMELINE_STEPS.indexOf(supply.status as (typeof TIMELINE_STEPS)[number]);

  return (
    <div className="animate-in mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/supplies" className="hover:bg-accent rounded-md p-1">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('details')}</h1>
          <p className="text-muted-foreground font-mono text-sm">{supply.trackingCode}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span className={`badge ${STATUS_STYLES[supply.status] ?? ''}`}>
          {t(`status_${supply.status}`)}
        </span>
      </div>

      {/* Timeline */}
      <div className="card mb-8">
        <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">{t('timeline')}</h2>
        <div className="flex items-center justify-between">
          {TIMELINE_STEPS.map((step, i) => {
            const isCompleted = currentStepIndex >= i;
            const isCurrent = currentStepIndex === i;
            return (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                      isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    } ${isCurrent ? 'ring-primary ring-2 ring-offset-2' : ''}`}
                  >
                    {i + 1}
                  </div>
                  <span className="mt-1 text-center text-xs">{t(`status_${step}`)}</span>
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 ${currentStepIndex > i ? 'bg-primary' : 'bg-muted'}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Supply Info */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-xs">{t('itemName')}</p>
            <p className="font-medium">{supply.itemName_en}</p>
            {supply.itemName_ar && (
              <p className="text-muted-foreground text-sm" dir="rtl">
                {supply.itemName_ar}
              </p>
            )}
          </div>
          <div>
            <p className="text-muted-foreground text-xs">{t('supplyType')}</p>
            <p className="font-medium">{t(`type_${supply.supplyType}`)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">{t('quantity')}</p>
            <p className="font-medium">
              {supply.quantity} {supply.unit}
            </p>
          </div>
          {supply.expiryDate && (
            <div>
              <p className="text-muted-foreground text-xs">{t('expiryDate')}</p>
              <p className="font-medium">{supply.expiryDate}</p>
            </div>
          )}
          {supply.notes && (
            <div className="sm:col-span-2">
              <p className="text-muted-foreground text-xs">{t('notes')}</p>
              <p className="text-sm">{supply.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Timestamps */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-xs">{t('createdAt')}</p>
            <p className="text-sm">
              {supply.createdAt ? new Date(supply.createdAt).toLocaleString() : '-'}
            </p>
          </div>
          {supply.shippedAt && (
            <div>
              <p className="text-muted-foreground text-xs">{t('shippedAt')}</p>
              <p className="text-sm">{new Date(supply.shippedAt).toLocaleString()}</p>
            </div>
          )}
          {supply.deliveredAt && (
            <div>
              <p className="text-muted-foreground text-xs">{t('deliveredAt')}</p>
              <p className="text-sm">{new Date(supply.deliveredAt).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {supply.status === 'requested' && (
          <>
            <button
              onClick={() => approveMutation.mutate({ id })}
              disabled={approveMutation.isPending}
              className="flex items-center gap-1.5 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
            >
              <CheckCircle className="h-4 w-4" />
              {t('approve')}
            </button>
            <button
              onClick={() => rejectMutation.mutate({ id })}
              disabled={rejectMutation.isPending}
              className="flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600"
            >
              <XCircle className="h-4 w-4" />
              {t('reject')}
            </button>
          </>
        )}
        {supply.status === 'approved' && (
          <button
            onClick={() => shipMutation.mutate({ id, originLocation: [32.5599, 15.5007] })}
            disabled={shipMutation.isPending}
            className="flex items-center gap-1.5 rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50 dark:bg-yellow-700 dark:hover:bg-yellow-600"
          >
            <Truck className="h-4 w-4" />
            {t('ship')}
          </button>
        )}
        {supply.status === 'in_transit' && (
          <button
            onClick={() => deliverMutation.mutate({ id })}
            disabled={deliverMutation.isPending}
            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
          >
            <Package className="h-4 w-4" />
            {t('markDelivered')}
          </button>
        )}
        {supply.status !== 'delivered' && supply.status !== 'distributed' && (
          <button
            onClick={() => cancelMutation.mutate({ id })}
            disabled={cancelMutation.isPending}
            className="flex items-center gap-1.5 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            <Ban className="h-4 w-4" />
            {t('cancel')}
          </button>
        )}
      </div>
    </div>
  );
}
