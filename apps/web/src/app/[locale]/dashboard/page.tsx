'use client';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { trpc } from '@/lib/trpc-client';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), { ssr: false });
const MapLegend = dynamic(() => import('@/components/map/MapLegend'), { ssr: false });

export default function DashboardPage() {
  const t = useTranslations();

  const statsQuery = trpc.floodZone.stats.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  const stats = statsQuery.data;
  const totalZones = stats?.totalZones ?? 0;
  const totalAffected = stats?.totalAffectedPopulation ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('dashboard.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('dashboard.activeZones')}
          value={totalZones}
          color="text-red-600"
        />
        <StatCard
          label={t('dashboard.activeRescues')}
          value={0}
          color="text-blue-600"
        />
        <StatCard
          label={t('dashboard.totalSheltered')}
          value={totalAffected}
          color="text-green-600"
        />
        <StatCard
          label={t('dashboard.pendingCalls')}
          value={0}
          color="text-yellow-600"
        />
      </div>

      {stats?.bySeverity && stats.bySeverity.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          {stats.bySeverity.map((s) => (
            <div key={s.severity} className="rounded-lg border bg-card p-4">
              <div className="text-lg font-bold">{s.count}</div>
              <div className="text-xs text-muted-foreground capitalize">{s.severity}</div>
              <div className="text-xs text-muted-foreground">
                {s.affectedPopulation.toLocaleString()} affected
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 relative rounded-lg border overflow-hidden">
        <LeafletMap className="h-[400px] w-full" />
        <MapLegend />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className={`text-3xl font-bold ${color}`}>{value.toLocaleString()}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
