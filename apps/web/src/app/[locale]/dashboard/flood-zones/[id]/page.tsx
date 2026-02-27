'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import dynamic from 'next/dynamic';
import { trpc } from '@/lib/trpc-client';
import { SeverityBadge } from '@/components/flood-zones/SeverityBadge';
import { StatusBadge } from '@/components/flood-zones/StatusBadge';
import { ArrowLeft } from 'lucide-react';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), { ssr: false });
const FloodZoneLayer = dynamic(() => import('@/components/map/FloodZoneLayer'), { ssr: false });

export default function FloodZoneDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('floodZone');
  const router = useRouter();

  const zoneQuery = trpc.floodZone.getById.useQuery({ id });

  if (zoneQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (zoneQuery.error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        {zoneQuery.error.message}
      </div>
    );
  }

  const zone = zoneQuery.data;
  if (!zone) return null;

  const featureCollection = zone.geometry
    ? {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            id: zone.id,
            properties: {
              id: zone.id,
              zoneCode: zone.zoneCode,
              name_en: zone.name_en,
              name_ar: zone.name_ar,
              severity: zone.severity,
              status: zone.status,
              affectedPopulation: zone.affectedPopulation,
              waterLevel_m: zone.waterLevel_m,
              waterLevelTrend: zone.waterLevelTrend,
            },
            geometry: zone.geometry as Record<string, unknown>,
          },
        ],
      }
    : null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="rounded-md p-2 hover:bg-accent">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{zone.name_en}</h1>
            <p className="text-sm text-muted-foreground font-mono">{zone.zoneCode}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {featureCollection && (
            <div className="rounded-lg border overflow-hidden">
              <LeafletMap className="h-[400px] w-full">
                <FloodZoneLayer data={featureCollection} />
              </LeafletMap>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">{t('details')}</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-muted-foreground">{t('severity')}</dt>
                <dd className="mt-1"><SeverityBadge severity={zone.severity} /></dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t('status')}</dt>
                <dd className="mt-1"><StatusBadge status={zone.status} /></dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t('waterLevel')}</dt>
                <dd className="mt-1 text-sm">
                  {zone.waterLevel_m ? `${zone.waterLevel_m}m` : '-'}
                  {zone.waterLevelTrend && ` (${zone.waterLevelTrend})`}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t('affectedPopulation')}</dt>
                <dd className="mt-1 text-sm">{zone.affectedPopulation?.toLocaleString() ?? '0'}</dd>
              </div>
              {zone.area_km2 && (
                <div>
                  <dt className="text-sm text-muted-foreground">Area</dt>
                  <dd className="mt-1 text-sm">{Number(zone.area_km2).toFixed(2)} km2</dd>
                </div>
              )}
              {zone.lastAssessedAt && (
                <div>
                  <dt className="text-sm text-muted-foreground">Last Assessed</dt>
                  <dd className="mt-1 text-sm">
                    {new Date(zone.lastAssessedAt).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
