'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc-client';
import { Link } from '@/i18n/navigation';
import dynamic from 'next/dynamic';

const WeatherAlertBanner = dynamic(() => import('./WeatherAlertBanner'), { ssr: false });
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), { ssr: false });
const FloodZoneLayer = dynamic(() => import('@/components/map/FloodZoneLayer'), { ssr: false });
const ShelterMarkerLayer = dynamic(() => import('@/components/map/ShelterMarkerLayer'), {
  ssr: false,
});
const MapLegend = dynamic(() => import('@/components/map/MapLegend'), { ssr: false });

export default function AdminDashboard() {
  const t = useTranslations();
  const [bbox, setBbox] = useState<[number, number, number, number] | null>(null);

  const handleBoundsChange = (b: { north: number; south: number; east: number; west: number }) => {
    setBbox([b.west, b.south, b.east, b.north]);
  };

  const floodZoneQuery = trpc.floodZone.getByBounds.useQuery(
    { bbox: bbox! },
    { enabled: bbox !== null },
  );

  const shelterQuery = trpc.shelter.list.useQuery({ page: 1, limit: 200 });

  const shelterData = (shelterQuery.data?.items ?? []) as {
    id: string;
    shelterCode: string;
    name_en: string;
    name_ar?: string | null;
    status: string;
    capacity: number;
    currentOccupancy: number;
    location: { type: 'Point'; coordinates: [number, number] } | null;
  }[];

  const statsQuery = trpc.floodZone.stats.useQuery(undefined, { refetchInterval: 30_000 });
  const rescueStatsQuery = trpc.rescue.stats.useQuery(undefined, { refetchInterval: 30_000 });
  const callStatsQuery = trpc.emergencyCall.stats.useQuery(undefined, { refetchInterval: 30_000 });
  const shelterStatsQuery = trpc.shelter.stats.useQuery(undefined, { refetchInterval: 30_000 });
  const dpStatsQuery = trpc.displacedPerson.stats.useQuery(undefined, { refetchInterval: 30_000 });
  const weatherStatsQuery = trpc.weatherAlert.stats.useQuery(undefined, {
    refetchInterval: 60_000,
  });

  const stats = statsQuery.data;
  const rescueStats = rescueStatsQuery.data;
  const callStats = callStatsQuery.data;
  const shelterStats = shelterStatsQuery.data;
  const dpStats = dpStatsQuery.data;
  const weatherStats = weatherStatsQuery.data;

  return (
    <div className="animate-in">
      <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight">
        {t('dashboard.title')}
      </h1>

      <WeatherAlertBanner />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard
          label={t('dashboard.activeZones')}
          value={stats?.totalZones ?? 0}
          color="text-severity-severe"
        />
        <StatCard
          label={t('dashboard.activeRescues')}
          value={rescueStats?.activeRescues ?? 0}
          color="text-primary"
        />
        <StatCard
          label={t('dashboard.totalSheltered')}
          value={shelterStats?.totalOccupancy ?? 0}
          color="text-green-600 dark:text-green-400"
        />
        <StatCard
          label={t('dashboard.pendingCalls')}
          value={callStats?.pendingCalls ?? 0}
          color="text-yellow-600 dark:text-yellow-400"
        />
        <StatCard
          label={t('dashboard.totalDisplaced')}
          value={dpStats?.total ?? 0}
          color="text-muted-foreground"
        />
        <StatCard
          label={t('weatherAlert.activeAlerts')}
          value={weatherStats?.activeAlerts ?? 0}
          color="text-orange-600 dark:text-orange-400"
        />
      </div>

      {stats?.bySeverity && stats.bySeverity.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {stats.bySeverity.map((s) => (
            <div key={s.severity} className="card p-4">
              <div className="text-lg font-semibold">{s.count}</div>
              <div className="text-muted-foreground text-xs capitalize">{s.severity}</div>
              <div className="text-muted-foreground text-xs">
                {s.affectedPopulation.toLocaleString()} affected
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Link
          href="/dashboard/analytics"
          className="card hover:bg-accent p-4 text-center transition-colors"
        >
          <div className="text-sm font-medium">{t('nav.analytics')}</div>
        </Link>
        <Link
          href="/dashboard/map"
          className="card hover:bg-accent p-4 text-center transition-colors"
        >
          <div className="text-sm font-medium">{t('nav.commandCenter')}</div>
        </Link>
        <Link
          href="/dashboard/resource-planner"
          className="card hover:bg-accent p-4 text-center transition-colors"
        >
          <div className="text-sm font-medium">{t('nav.resourcePlanner')}</div>
        </Link>
        <Link
          href="/dashboard/audit-logs"
          className="card hover:bg-accent p-4 text-center transition-colors"
        >
          <div className="text-sm font-medium">{t('nav.auditLogs')}</div>
        </Link>
      </div>

      <div className="relative mt-8 overflow-hidden rounded-lg border">
        <LeafletMap className="h-[400px] w-full" onBoundsChange={handleBoundsChange}>
          <FloodZoneLayer data={floodZoneQuery.data ?? null} />
          <ShelterMarkerLayer shelters={shelterData} />
        </LeafletMap>
        <MapLegend />
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
