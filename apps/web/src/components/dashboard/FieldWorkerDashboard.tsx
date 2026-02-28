'use client';

import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc-client';
import { Link } from '@/i18n/navigation';
import dynamic from 'next/dynamic';

const WeatherAlertBanner = dynamic(() => import('./WeatherAlertBanner'), { ssr: false });

export default function FieldWorkerDashboard() {
  const t = useTranslations();

  const taskQuery = trpc.task.list.useQuery({ page: 1, limit: 10 });
  const callStatsQuery = trpc.emergencyCall.stats.useQuery(undefined, { refetchInterval: 30_000 });

  return (
    <div className="animate-in">
      <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight">
        {t('dashboard.title')}
      </h1>

      <WeatherAlertBanner />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={t('task.title')} value={taskQuery.data?.total ?? 0} color="text-primary" />
        <StatCard
          label={t('dashboard.pendingCalls')}
          value={callStatsQuery.data?.pendingCalls ?? 0}
          color="text-yellow-600 dark:text-yellow-400"
        />
        <StatCard
          label={t('task.completed')}
          value={taskQuery.data?.items.filter((item) => item.status === 'completed').length ?? 0}
          color="text-green-600 dark:text-green-400"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Link
          href="/dashboard/displaced-persons/register"
          className="card hover:bg-accent p-4 text-center transition-colors"
        >
          <div className="text-sm font-medium">{t('displacedPerson.register')}</div>
        </Link>
        <Link
          href="/dashboard/emergency-calls/create"
          className="card hover:bg-accent p-4 text-center transition-colors"
        >
          <div className="text-sm font-medium">{t('emergencyCall.create')}</div>
        </Link>
        <Link
          href="/dashboard/displaced-persons/search"
          className="card hover:bg-accent p-4 text-center transition-colors"
        >
          <div className="text-sm font-medium">{t('displacedPerson.search')}</div>
        </Link>
      </div>

      {/* Assigned Tasks */}
      <div className="mt-6">
        <h2 className="mb-3 text-lg font-medium">{t('task.title')}</h2>
        <div className="space-y-2">
          {taskQuery.data?.items.slice(0, 5).map((task) => (
            <Link
              key={task.id}
              href={`/dashboard/tasks/${task.id}`}
              className="card hover:bg-accent flex items-center justify-between p-4 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{task.title_en || task.title_ar}</p>
                <p className="text-muted-foreground text-xs capitalize">
                  {task.priority} · {task.status}
                </p>
              </div>
              <span className="text-muted-foreground text-xs">{task.taskCode}</span>
            </Link>
          ))}
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
