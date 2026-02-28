'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import dynamic from 'next/dynamic';
import { trpc } from '@/lib/trpc-client';
import { SeverityBadge } from '@/components/flood-zones/SeverityBadge';
import { StatusBadge } from '@/components/flood-zones/StatusBadge';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), { ssr: false });
const FloodZoneLayer = dynamic(() => import('@/components/map/FloodZoneLayer'), { ssr: false });

export default function FloodZoneDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('floodZone');
  const router = useRouter();

  const tCommon = useTranslations('common');
  const utils = trpc.useUtils();
  const zoneQuery = trpc.floodZone.getById.useQuery({ id });

  const archiveMutation = trpc.floodZone.archive.useMutation({
    onSuccess: () => {
      utils.floodZone.list.invalidate();
      router.push('/dashboard/flood-zones');
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const handleDelete = () => {
    if (window.confirm(t('deleteConfirm'))) {
      archiveMutation.mutate({ id });
    }
  };

  if (zoneQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (zoneQuery.error) {
    return (
      <div className="bg-destructive/10 text-destructive rounded-md p-4">
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
    <div className="animate-in">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="hover:bg-accent rounded-md p-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">{zone.name_en}</h1>
            <p className="text-muted-foreground font-mono text-sm">{zone.zoneCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/flood-zones/${id}/edit`}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            {tCommon('edit')}
          </Link>
          <button
            onClick={handleDelete}
            disabled={archiveMutation.isPending}
            className="border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {archiveMutation.isPending ? tCommon('loading') : tCommon('delete')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {featureCollection && (
            <div className="overflow-hidden rounded-lg border">
              <LeafletMap className="h-[400px] w-full">
                <FloodZoneLayer data={featureCollection} />
              </LeafletMap>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
              {t('details')}
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-muted-foreground text-sm">{t('severity')}</dt>
                <dd className="mt-1">
                  <SeverityBadge severity={zone.severity} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">{t('status')}</dt>
                <dd className="mt-1">
                  <StatusBadge status={zone.status} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">{t('waterLevel')}</dt>
                <dd className="mt-1 text-sm">
                  {zone.waterLevel_m ? `${zone.waterLevel_m}m` : '-'}
                  {zone.waterLevelTrend && ` (${zone.waterLevelTrend})`}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">{t('affectedPopulation')}</dt>
                <dd className="mt-1 text-sm">{zone.affectedPopulation?.toLocaleString() ?? '0'}</dd>
              </div>
              {zone.area_km2 && (
                <div>
                  <dt className="text-muted-foreground text-sm">Area</dt>
                  <dd className="mt-1 text-sm">{Number(zone.area_km2).toFixed(2)} km2</dd>
                </div>
              )}
              {zone.lastAssessedAt && (
                <div>
                  <dt className="text-muted-foreground text-sm">Last Assessed</dt>
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
