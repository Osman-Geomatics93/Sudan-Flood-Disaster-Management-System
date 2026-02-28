'use client';

import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc-client';
import { Link } from '@/i18n/navigation';
import dynamic from 'next/dynamic';

const WeatherAlertBanner = dynamic(() => import('./WeatherAlertBanner'), { ssr: false });

export default function AgencyDashboard() {
  const t = useTranslations();

  const rescueStatsQuery = trpc.rescue.stats.useQuery(undefined, { refetchInterval: 30_000 });
  const shelterStatsQuery = trpc.shelter.stats.useQuery(undefined, { refetchInterval: 30_000 });
  const supplyQuery = trpc.supply.list.useQuery({ page: 1, limit: 5 });
  const taskQuery = trpc.task.list.useQuery({ page: 1, limit: 5 });

  return (
    <div className="animate-in">
      <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight">
        {t('dashboard.title')}
      </h1>

      <WeatherAlertBanner />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('dashboard.activeRescues')}
          value={rescueStatsQuery.data?.activeRescues ?? 0}
          color="text-primary"
        />
        <StatCard
          label={t('dashboard.totalSheltered')}
          value={shelterStatsQuery.data?.totalOccupancy ?? 0}
          color="text-green-600 dark:text-green-400"
        />
        <StatCard
          label={t('supply.title')}
          value={supplyQuery.data?.total ?? 0}
          color="text-muted-foreground"
        />
        <StatCard
          label={t('task.title')}
          value={taskQuery.data?.total ?? 0}
          color="text-muted-foreground"
        />
      </div>

      {/* Recent Tasks */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">{t('task.title')}</h2>
          <Link href="/dashboard/tasks" className="text-primary text-sm hover:underline">
            View all
          </Link>
        </div>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="px-4 py-3 text-start font-medium">{t('task.titleLabel')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('task.status')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('task.priority')}</th>
                </tr>
              </thead>
              <tbody>
                {taskQuery.data?.items.slice(0, 5).map((task) => (
                  <tr key={task.id} className="hover:bg-accent/50 border-b">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/tasks/${task.id}`} className="hover:text-primary">
                        {task.title_en || task.title_ar}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-muted inline-flex rounded-full px-2.5 py-0.5 text-xs">
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs capitalize">{task.priority}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card p-5">
      <div className={`text-3xl font-semibold tracking-tight ${color}`}>
        {value.toLocaleString()}
      </div>
      <div className="text-muted-foreground mt-1.5 text-sm">{label}</div>
    </div>
  );
}
