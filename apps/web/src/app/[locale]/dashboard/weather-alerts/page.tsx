'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc-client';
import { Link } from '@/i18n/navigation';
import { CloudLightning, AlertTriangle, ShieldAlert, ShieldCheck, Plus } from 'lucide-react';

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

export default function WeatherAlertsPage() {
  const t = useTranslations('weatherAlert');
  const [page, setPage] = useState(1);
  const [activeOnly, setActiveOnly] = useState(true);
  const utils = trpc.useUtils();

  const alertsQuery = trpc.weatherAlert.list.useQuery({
    page,
    limit: 20,
    activeOnly: activeOnly || undefined,
  });

  const deactivateMutation = trpc.weatherAlert.deactivate.useMutation({
    onSuccess: () => {
      utils.weatherAlert.list.invalidate();
      utils.weatherAlert.active.invalidate();
    },
  });

  const alerts = alertsQuery.data;

  return (
    <div className="animate-in">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <Link
          href="/dashboard/weather-alerts/create"
          className="btn-primary flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          {t('createAlert')}
        </Link>
      </div>

      {/* Tab Toggle */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => {
            setActiveOnly(true);
            setPage(1);
          }}
          className={`rounded-md px-4 py-2 text-sm transition-colors ${
            activeOnly ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent'
          }`}
        >
          {t('activeAlerts')}
        </button>
        <button
          onClick={() => {
            setActiveOnly(false);
            setPage(1);
          }}
          className={`rounded-md px-4 py-2 text-sm transition-colors ${
            !activeOnly ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent'
          }`}
        >
          {t('allAlerts')}
        </button>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {alerts?.items.map((alert) => {
          const SeverityIcon = SEVERITY_ICONS[alert.severity] || CloudLightning;
          return (
            <div
              key={alert.id}
              className={`card border-s-4 p-4 ${
                alert.severity === 'emergency'
                  ? 'border-s-red-500'
                  : alert.severity === 'warning'
                    ? 'border-s-orange-500'
                    : alert.severity === 'watch'
                      ? 'border-s-yellow-500'
                      : 'border-s-blue-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <SeverityIcon className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <Link
                      href={`/dashboard/weather-alerts/${alert.id}`}
                      className="font-medium hover:underline"
                    >
                      {alert.title_en}
                    </Link>
                    {alert.title_ar && (
                      <p className="text-muted-foreground font-arabic text-sm">{alert.title_ar}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${SEVERITY_COLORS[alert.severity] || ''}`}
                      >
                        {t(`severity_${alert.severity}` as Parameters<typeof t>[0])}
                      </span>
                      <span className="bg-muted inline-flex rounded-full px-2.5 py-0.5 text-xs">
                        {t(`type_${alert.alertType}` as Parameters<typeof t>[0])}
                      </span>
                      {alert.stateName && (
                        <span className="text-muted-foreground text-xs">{alert.stateName}</span>
                      )}
                    </div>
                    {alert.description_en && (
                      <p className="text-muted-foreground mt-2 text-sm">{alert.description_en}</p>
                    )}
                    <div className="text-muted-foreground mt-2 text-xs">
                      {t('issuedAt')}: {new Date(alert.issuedAt).toLocaleString()}
                      {alert.expiresAt && (
                        <>
                          {' '}
                          · {t('expiresAt')}: {new Date(alert.expiresAt).toLocaleString()}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.isActive && (
                    <span className="flex h-2 w-2 rounded-full bg-green-500" title="Active" />
                  )}
                  {alert.isActive && (
                    <button
                      onClick={() => deactivateMutation.mutate({ id: alert.id })}
                      disabled={deactivateMutation.isPending}
                      className="btn-ghost text-destructive px-3 py-1.5 text-xs"
                    >
                      {deactivateMutation.isPending ? t('deactivating') : t('deactivate')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {alertsQuery.isLoading && (
        <div className="flex justify-center py-12">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      )}

      {alerts?.items.length === 0 && !alertsQuery.isLoading && (
        <div className="text-muted-foreground py-12 text-center">{t('noActiveAlerts')}</div>
      )}

      {alerts && alerts.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            {t('page')} {alerts.page} / {alerts.totalPages} ({alerts.total} {t('total')})
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-50"
            >
              ←
            </button>
            <button
              onClick={() => setPage((p) => Math.min(alerts.totalPages, p + 1))}
              disabled={page === alerts.totalPages}
              className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-50"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
