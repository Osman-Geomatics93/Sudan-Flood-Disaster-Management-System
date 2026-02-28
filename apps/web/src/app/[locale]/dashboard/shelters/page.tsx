'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import dynamic from 'next/dynamic';
import { trpc } from '@/lib/trpc-client';
import { Map, List, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { ShelterStatus } from '@sudanflood/shared';
import { SHELTER_STATUSES } from '@sudanflood/shared';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), { ssr: false });
const ShelterMarkerLayer = dynamic(() => import('@/components/map/ShelterMarkerLayer'), {
  ssr: false,
});

type ViewMode = 'list' | 'map';

const STATUS_STYLES: Record<string, string> = {
  preparing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  open: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  at_capacity: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  overcrowded: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  closing: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export default function SheltersPage() {
  const t = useTranslations('shelter');
  const tCommon = useTranslations('common');

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const listQuery = trpc.shelter.list.useQuery({
    page,
    limit: 20,
    ...(statusFilter && { status: statusFilter as ShelterStatus }),
  });

  const boundsQuery = trpc.shelter.getByBounds.useQuery(
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
          <Link href="/dashboard/shelters/create" className="btn-primary flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            {t('createShelter')}
          </Link>
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
        </div>
      </div>

      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input-field"
        >
          <option value="">{t('allStatuses')}</option>
          {SHELTER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`status_${s}`)}
            </option>
          ))}
        </select>
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
                      <th className="px-4 py-3 text-start font-medium">{t('shelterCode')}</th>
                      <th className="px-4 py-3 text-start font-medium">{t('name')}</th>
                      <th className="px-4 py-3 text-start font-medium">{t('status')}</th>
                      <th className="px-4 py-3 text-start font-medium">{t('capacity')}</th>
                      <th className="px-4 py-3 text-start font-medium">{t('occupancy')}</th>
                    </tr>
                  </thead>
                  <tbody className="table-premium tbody">
                    {listQuery.data.items.map((shelter) => (
                      <tr key={shelter.id} className="hover:bg-muted/30 border-b">
                        <td className="px-4 py-3 font-mono">
                          <Link
                            href={`/dashboard/shelters/${shelter.id}`}
                            className="text-primary dark:text-primary hover:underline"
                          >
                            {shelter.shelterCode}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/dashboard/shelters/${shelter.id}`}
                            className="hover:underline"
                          >
                            {shelter.name_en}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${STATUS_STYLES[shelter.status] ?? ''}`}>
                            {shelter.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">{shelter.capacity}</td>
                        <td className="px-4 py-3">
                          {shelter.currentOccupancy}/{shelter.capacity}
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
        <div className="overflow-hidden rounded-lg border">
          <LeafletMap onBoundsChange={handleBoundsChange} className="h-[600px] w-full">
            <ShelterMarkerLayer
              shelters={
                (boundsQuery.data ?? []) as {
                  id: string;
                  shelterCode: string;
                  name_en: string;
                  name_ar?: string | null;
                  status: string;
                  capacity: number;
                  currentOccupancy: number;
                  location: { type: 'Point'; coordinates: [number, number] } | null;
                }[]
              }
            />
          </LeafletMap>
        </div>
      )}
    </div>
  );
}
