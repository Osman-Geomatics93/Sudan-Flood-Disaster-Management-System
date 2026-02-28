'use client';

import { trpc } from '@/lib/trpc-client';
import { useTranslations } from 'next-intl';
import { CloudLightning } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const SEVERITY_BG: Record<string, string> = {
  emergency: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
  warning: 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800',
  watch: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800',
  advisory: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
};

export default function WeatherAlertBanner() {
  const t = useTranslations('weatherAlert');
  const alertsQuery = trpc.weatherAlert.active.useQuery(undefined, {
    refetchInterval: 60_000,
  });

  const alerts = alertsQuery.data;
  if (!alerts || alerts.length === 0) return null;

  // Show most severe alert
  const severityOrder = ['emergency', 'warning', 'watch', 'advisory'];
  const sorted = [...alerts].sort(
    (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity),
  );
  const topAlert = sorted[0];
  if (!topAlert) return null;

  return (
    <Link href="/dashboard/weather-alerts" className="mb-4 block">
      <div
        className={`flex items-center gap-3 rounded-lg border p-3 ${SEVERITY_BG[topAlert.severity] || SEVERITY_BG.advisory}`}
      >
        <CloudLightning className="h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{topAlert.title_en}</p>
          {alerts.length > 1 && (
            <p className="text-muted-foreground text-xs">+{alerts.length - 1} more active alerts</p>
          )}
        </div>
        <span className="shrink-0 text-xs font-medium">
          {t(`severity_${topAlert.severity}` as any)}
        </span>
      </div>
    </Link>
  );
}
