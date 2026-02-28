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
      <h1 className="font-heading text-2xl font-semibold tracking-tight mb-6">{t('dashboard.title')}</h1>

      <WeatherAlertBanner />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-3xl font-semibold tracking-tight text-green-600 dark:text-green-400">
            {shelterStatsQuery.data?.byStatus?.find((s: { status: string; count: number }) => s.status === 'open')?.count ?? 0}
          </div>
          <div className="mt-1.5 text-sm text-muted-foreground">{t('shelter.title')}</div>
        </div>
        <div className="card p-5">
          <div className="text-3xl font-semibold tracking-tight text-muted-foreground">
            {shelterStatsQuery.data?.totalOccupancy ?? 0}
          </div>
          <div className="mt-1.5 text-sm text-muted-foreground">{t('dashboard.totalSheltered')}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/dashboard/reports/create" className="card p-4 hover:bg-accent transition-colors text-center">
          <div className="text-sm font-medium">{t('report.createReport')}</div>
          <p className="text-xs text-muted-foreground mt-1">Submit a citizen report</p>
        </Link>
        <Link href="/dashboard/shelters" className="card p-4 hover:bg-accent transition-colors text-center">
          <div className="text-sm font-medium">{t('shelter.title')}</div>
          <p className="text-xs text-muted-foreground mt-1">Find nearby shelters</p>
        </Link>
      </div>

      {/* Nearby Shelters */}
      <div className="mt-6">
        <h2 className="text-lg font-medium mb-3">{t('shelter.title')}</h2>
        <div className="space-y-2">
          {shelterQuery.data?.items.map((shelter) => (
            <Link
              key={shelter.id}
              href={`/dashboard/shelters/${shelter.id}`}
              className="card p-4 flex items-center justify-between hover:bg-accent transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{shelter.name_en || shelter.name_ar}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {t(`shelter.status_${shelter.status}` as any)} · {shelter.currentOccupancy}/{shelter.capacity}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">{shelter.shelterCode}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
