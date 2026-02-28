'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  CloudLightning,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

const SEVERITY_COLORS: Record<string, string> = {
  advisory: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  watch: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  warning: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  emergency: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const SEVERITY_ICONS: Record<string, typeof ShieldCheck> = {
  advisory: ShieldCheck,
  watch: ShieldAlert,
  warning: AlertTriangle,
  emergency: CloudLightning,
};

export default function WeatherAlertDetailPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations('weatherAlert');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const utils = trpc.useUtils();

  const alertQuery = trpc.weatherAlert.getById.useQuery({ id });

  const deactivateMutation = trpc.weatherAlert.deactivate.useMutation({
    onSuccess: () => {
      utils.weatherAlert.getById.invalidate({ id });
      utils.weatherAlert.list.invalidate();
    },
  });

  const deleteMutation = trpc.weatherAlert.delete.useMutation({
    onSuccess: () => {
      utils.weatherAlert.list.invalidate();
      router.push('/dashboard/weather-alerts');
    },
    onError: (err) => {
      window.alert(err.message);
    },
  });

  const handleDelete = () => {
    if (window.confirm(t('deleteConfirm'))) {
      deleteMutation.mutate({ id });
    }
  };

  if (alertQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (alertQuery.error || !alertQuery.data) {
    return <div className="text-muted-foreground py-12 text-center">{tCommon('error')}</div>;
  }

  const alertData = alertQuery.data;
  const SeverityIcon = SEVERITY_ICONS[alertData.severity] || CloudLightning;

  return (
    <div className="animate-in mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/weather-alerts" className="btn-secondary rounded-md p-1">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('details')}</h1>
            <p className="text-muted-foreground font-mono text-sm">{alertData.alertCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/weather-alerts/${id}/edit`}
            className="btn-secondary flex items-center gap-1.5"
          >
            <Pencil className="h-4 w-4" />
            {tCommon('edit')}
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="btn-ghost text-destructive flex items-center gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            {tCommon('delete')}
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="mb-6 flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${SEVERITY_COLORS[alertData.severity] || ''}`}
        >
          <SeverityIcon className="h-4 w-4" />
          {t(`severity_${alertData.severity}` as Parameters<typeof t>[0])}
        </span>
        <span className="bg-muted inline-flex rounded-full px-3 py-1 text-sm">
          {t(`type_${alertData.alertType}` as Parameters<typeof t>[0])}
        </span>
        {alertData.isActive ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            {t('isActive')}
          </span>
        ) : (
          <span className="badge bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            Inactive
          </span>
        )}
      </div>

      {/* Main info */}
      <div className="card mb-6">
        <h2 className="font-heading text-lg font-semibold tracking-tight">{alertData.title_en}</h2>
        {alertData.title_ar && (
          <p className="text-muted-foreground text-sm" dir="rtl">
            {alertData.title_ar}
          </p>
        )}

        {alertData.description_en && (
          <div className="mt-4">
            <p className="text-muted-foreground text-xs">{t('descriptionEn')}</p>
            <p className="mt-1 text-sm">{alertData.description_en}</p>
          </div>
        )}
        {alertData.description_ar && (
          <div className="mt-2">
            <p className="text-muted-foreground text-xs">{t('descriptionAr')}</p>
            <p className="mt-1 text-sm" dir="rtl">
              {alertData.description_ar}
            </p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          {alertData.stateName && (
            <div>
              <p className="text-muted-foreground text-xs">{t('state')}</p>
              <p>{alertData.stateName}</p>
            </div>
          )}
          {alertData.source && (
            <div>
              <p className="text-muted-foreground text-xs">{t('source')}</p>
              <p>{alertData.source}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground text-xs">{t('issuedAt')}</p>
            <p>{new Date(alertData.issuedAt).toLocaleString()}</p>
          </div>
          {alertData.expiresAt && (
            <div>
              <p className="text-muted-foreground text-xs">{t('expiresAt')}</p>
              <p>{new Date(alertData.expiresAt).toLocaleString()}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground text-xs">{t('alertCode')}</p>
            <p className="font-mono">{alertData.alertCode}</p>
          </div>
        </div>
      </div>

      {/* Deactivate */}
      {alertData.isActive && (
        <div className="card">
          <button
            onClick={() => deactivateMutation.mutate({ id })}
            disabled={deactivateMutation.isPending}
            className="btn-ghost text-destructive disabled:opacity-50"
          >
            {deactivateMutation.isPending ? t('deactivating') : t('deactivate')}
          </button>
        </div>
      )}
    </div>
  );
}
