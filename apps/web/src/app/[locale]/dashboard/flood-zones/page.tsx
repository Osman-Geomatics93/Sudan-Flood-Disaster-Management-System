'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { trpc } from '@/lib/trpc-client';
import { Link } from '@/i18n/navigation';
import { SeverityBadge } from '@/components/flood-zones/SeverityBadge';
import { StatusBadge } from '@/components/flood-zones/StatusBadge';
import { FloodZoneFilters } from '@/components/flood-zones/FloodZoneFilters';
import { Map, List, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), { ssr: false });
const FloodZoneLayer = dynamic(() => import('@/components/map/FloodZoneLayer'), { ssr: false });
const MapLegend = dynamic(() => import('@/components/map/MapLegend'), { ssr: false });

type ViewMode = 'list' | 'map';

export default function FloodZonesPage() {
  const t = useTranslations('floodZone');
  const tCommon = useTranslations('common');

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const listQuery = trpc.floodZone.list.useQuery({
    page,
    limit: 20,
    ...(severity && { severity: severity as 'low' | 'moderate' | 'high' | 'severe' | 'extreme' }),
    ...(status && {
      status: status as
        | 'monitoring'
        | 'warning'
        | 'active_flood'
        | 'receding'
        | 'post_flood'
        | 'archived',
    }),
  });

  const boundsQuery = trpc.floodZone.getByBounds.useQuery(
    { bbox: bounds! },
    { enabled: viewMode === 'map' && bounds !== null, refetchInterval: 30_000 },
  );

  const handleBoundsChange = useCallback(
    (b: { north: number; south: number; east: number; west: number }) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setBounds([b.west, b.south, b.east, b.north]);
      }, 300);
    },
    [],
  );

  return (
    <div className="animate-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <div className="flex items-center gap-3">
          <div className="flex rounded-md border">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              <List className="h-4 w-4" />
              {t('listView')}
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm ${viewMode === 'map' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              <Map className="h-4 w-4" />
              {t('mapView')}
            </button>
          </div>
          <Link
            href="/dashboard/flood-zones/create"
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {t('create')}
          </Link>
        </div>
      </div>

      <div className="mb-4">
        <FloodZoneFilters
          severity={severity}
          status={status}
          onSeverityChange={(v) => {
            setSeverity(v);
            setPage(1);
          }}
          onStatusChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        />
      </div>

      {viewMode === 'list' ? (
        <div>
          {listQuery.isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
          )}

          {listQuery.data && listQuery.data.items.length === 0 && (
            <div className="text-muted-foreground rounded-lg border py-12 text-center">
              {tCommon('noData')}
            </div>
          )}

          {listQuery.data && listQuery.data.items.length > 0 && (
            <>
              <div className="overflow-x-auto rounded-lg border">
                <table className="table-premium w-full">
                  <thead className="table-premium thead">
                    <tr>
                      <th className="px-4 py-3 text-start font-medium">{t('zoneCode')}</th>
                      <th className="px-4 py-3 text-start font-medium">{t('name')}</th>
                      <th className="px-4 py-3 text-start font-medium">{t('severity')}</th>
                      <th className="px-4 py-3 text-start font-medium">{t('status')}</th>
                      <th className="px-4 py-3 text-start font-medium">{t('waterLevel')}</th>
                      <th className="px-4 py-3 text-start font-medium">
                        {t('affectedPopulation')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="table-premium tbody">
                    {listQuery.data.items.map((zone) => (
                      <tr key={zone.id} className="hover:bg-muted/30 border-b">
                        <td className="px-4 py-3">
                          <Link
                            href={`/dashboard/flood-zones/${zone.id}`}
                            className="text-primary dark:text-primary font-mono hover:underline"
                          >
                            {zone.zoneCode}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{zone.name_en}</td>
                        <td className="px-4 py-3">
                          <SeverityBadge severity={zone.severity} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={zone.status} />
                        </td>
                        <td className="px-4 py-3">
                          {zone.waterLevel_m ? `${zone.waterLevel_m}m` : '-'}
                          {zone.waterLevelTrend && ` (${zone.waterLevelTrend})`}
                        </td>
                        <td className="px-4 py-3">
                          {zone.affectedPopulation?.toLocaleString() ?? '0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {listQuery.data.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    {t('page')} {listQuery.data.page} / {listQuery.data.totalPages} (
                    {listQuery.data.total} {t('total')})
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      disabled={page >= (listQuery.data?.totalPages ?? 1)}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-lg border">
          <LeafletMap onBoundsChange={handleBoundsChange} className="h-[600px] w-full">
            <FloodZoneLayer data={boundsQuery.data ?? null} />
          </LeafletMap>
          <MapLegend />
        </div>
      )}
    </div>
  );
}
