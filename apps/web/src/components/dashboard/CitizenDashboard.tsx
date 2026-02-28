'use client';

import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc-client';
import { Link } from '@/i18n/navigation';
import dynamic from 'next/dynamic';

const WeatherAlertBanner = dynamic(() => import('./WeatherAlertBanner'), { ssr: false });

export default function CitizenDashboard() {
  const t = useTranslations();

  const shelterStatsQuery = trpc.shelter.stats.useQuery(undefined, { refetchInterval: 30_000 });
  const shelterQuery = trpc.shelter.list.useQuery({ page: 1, limit: 5 });

  return (
    <div className="animate-in">
      <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight">
        {t('dashboard.title')}
      </h1>

      <WeatherAlertBanner />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <div className="text-3xl font-semibold tracking-tight text-green-600 dark:text-green-400">
            {shelterStatsQuery.data?.byStatus?.find(
              (s: { status: string; count: number }) => s.status === 'open',
            )?.count ?? 0}
          </div>
          <div className="text-muted-foreground mt-1.5 text-sm">{t('shelter.title')}</div>
        </div>
        <div className="card p-5">
          <div className="text-muted-foreground text-3xl font-semibold tracking-tight">
            {shelterStatsQuery.data?.totalOccupancy ?? 0}
          </div>
          <div className="text-muted-foreground mt-1.5 text-sm">
            {t('dashboard.totalSheltered')}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/dashboard/reports/create"
          className="card hover:bg-accent p-4 text-center transition-colors"
        >
          <div className="text-sm font-medium">{t('report.createReport')}</div>
          <p className="text-muted-foreground mt-1 text-xs">Submit a citizen report</p>
        </Link>
        <Link
          href="/dashboard/shelters"
          className="card hover:bg-accent p-4 text-center transition-colors"
        >
          <div className="text-sm font-medium">{t('shelter.title')}</div>
          <p className="text-muted-foreground mt-1 text-xs">Find nearby shelters</p>
        </Link>
      </div>

      {/* Nearby Shelters */}
      <div className="mt-6">
        <h2 className="mb-3 text-lg font-medium">{t('shelter.title')}</h2>
        <div className="space-y-2">
          {shelterQuery.data?.items.map((shelter) => (
            <Link
              key={shelter.id}
              href={`/dashboard/shelters/${shelter.id}`}
              className="card hover:bg-accent flex items-center justify-between p-4 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{shelter.name_en || shelter.name_ar}</p>
                <p className="text-muted-foreground text-xs capitalize">
                  {t(`shelter.status_${shelter.status}` as Parameters<typeof t>[0])} ·{' '}
                  {shelter.currentOccupancy}/{shelter.capacity}
                </p>
              </div>
              <span className="text-muted-foreground text-xs">{shelter.shelterCode}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
