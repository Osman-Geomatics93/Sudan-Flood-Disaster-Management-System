'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { trpc } from '@/lib/trpc-client';
import ChartCard from '@/components/charts/ChartCard';

const SeverityPieChart = dynamic(() => import('@/components/charts/SeverityPieChart'), {
  ssr: false,
});
const ShelterOccupancyBarChart = dynamic(
  () => import('@/components/charts/ShelterOccupancyBarChart'),
  { ssr: false },
);
const SupplyByTypeChart = dynamic(() => import('@/components/charts/SupplyByTypeChart'), {
  ssr: false,
});
const DisplacementTrendChart = dynamic(() => import('@/components/charts/DisplacementTrendChart'), {
  ssr: false,
});
const EmergencyCallsChart = dynamic(() => import('@/components/charts/EmergencyCallsChart'), {
  ssr: false,
});

export default function AnalyticsPage() {
  const t = useTranslations('analytics');
  const [trendDays, setTrendDays] = useState(30);

  const severityQuery = trpc.floodZone.stats.useQuery();
  const displacementQuery = trpc.analytics.displacementTrend.useQuery({ days: trendDays });
  const supplyQuery = trpc.analytics.supplyByType.useQuery();
  const shelterQuery = trpc.analytics.shelterRanking.useQuery({ limit: 10 });
  const responseQuery = trpc.analytics.responseTime.useQuery();
  const callsQuery = trpc.analytics.emergencyCallsByUrgency.useQuery();

  return (
    <div className="animate-in">
      <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight">{t('title')}</h1>

      {/* Response Time stat card */}
      {responseQuery.data && (
        <div className="card mb-6 p-5">
          <div className="text-primary text-3xl font-semibold tracking-tight">
            {Number(responseQuery.data.avgResponseMinutes).toFixed(1)} min
          </div>
          <div className="text-muted-foreground mt-1.5 text-sm">{t('avgResponseMinutes')}</div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Displacement Trend */}
        <ChartCard title={t('displacementTrend')} loading={displacementQuery.isLoading}>
          <div className="mb-3 flex gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setTrendDays(d)}
                className={`rounded-md px-3 py-1 text-xs transition-colors ${
                  trendDays === d
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-accent'
                }`}
              >
                {t(`last${d}Days` as any)}
              </button>
            ))}
          </div>
          {displacementQuery.data && <DisplacementTrendChart data={displacementQuery.data} />}
        </ChartCard>

        {/* Severity Distribution */}
        <ChartCard title={t('severityDistribution')} loading={severityQuery.isLoading}>
          {severityQuery.data?.bySeverity && (
            <SeverityPieChart data={severityQuery.data.bySeverity} />
          )}
        </ChartCard>

        {/* Shelter Occupancy */}
        <ChartCard title={t('shelterOccupancy')} loading={shelterQuery.isLoading}>
          {shelterQuery.data && <ShelterOccupancyBarChart data={shelterQuery.data} />}
        </ChartCard>

        {/* Supply by Type */}
        <ChartCard title={t('supplyByType')} loading={supplyQuery.isLoading}>
          {supplyQuery.data && <SupplyByTypeChart data={supplyQuery.data} />}
        </ChartCard>

        {/* Emergency Calls by Urgency */}
        <ChartCard title={t('emergencyCallsByUrgency')} loading={callsQuery.isLoading}>
          {callsQuery.data && <EmergencyCallsChart data={callsQuery.data} />}
        </ChartCard>
      </div>
    </div>
  );
}
