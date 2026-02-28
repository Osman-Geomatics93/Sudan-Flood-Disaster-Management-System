'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import dynamic from 'next/dynamic';
import { trpc } from '@/lib/trpc-client';
import { FloodZoneForm } from '@/components/flood-zones/FloodZoneForm';
import { ArrowLeft } from 'lucide-react';
import type { FloodSeverity, FloodZoneStatus, GeoJsonPolygon } from '@sudanflood/shared';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), { ssr: false });
const DrawControl = dynamic(() => import('@/components/map/DrawControl'), { ssr: false });

export default function EditFloodZonePage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('floodZone');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    severity: '',
    status: 'monitoring',
    stateId: '',
    localityId: '',
    waterLevel: '',
    waterLevelTrend: '',
    affectedPopulation: '',
  });

  const [geometry, setGeometry] = useState<GeoJsonPolygon | null>(null);
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);

  const zoneQuery = trpc.floodZone.getById.useQuery({ id });

  const statesQuery = trpc.organization.listStates.useQuery();
  const localitiesQuery = trpc.organization.listLocalities.useQuery(
    { id: formData.stateId },
    { enabled: !!formData.stateId },
  );

  const updateMutation = trpc.floodZone.update.useMutation({
    onSuccess: () => {
      router.push(`/dashboard/flood-zones/${id}`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  useEffect(() => {
    if (zoneQuery.data && !initialized) {
      const zone = zoneQuery.data;
      /* eslint-disable react-hooks/set-state-in-effect */
      setFormData({
        name_en: zone.name_en ?? '',
        name_ar: zone.name_ar ?? '',
        severity: zone.severity ?? '',
        status: zone.status ?? 'monitoring',
        stateId: zone.stateId ?? '',
        localityId: zone.localityId ?? '',
        waterLevel: zone.waterLevel_m != null ? String(zone.waterLevel_m) : '',
        waterLevelTrend: zone.waterLevelTrend ?? '',
        affectedPopulation: zone.affectedPopulation != null ? String(zone.affectedPopulation) : '',
      });
      if (zone.geometry) {
        setGeometry(zone.geometry as GeoJsonPolygon);
      }
      setInitialized(true);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [zoneQuery.data, initialized]);

  const handlePolygonCreated = useCallback(
    (geojson: { type: 'Polygon'; coordinates: number[][][] }) => {
      setGeometry(geojson as GeoJsonPolygon);
    },
    [],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name_en || !formData.severity || !formData.stateId) {
      setError('Please fill in all required fields');
      return;
    }

    updateMutation.mutate({
      id,
      name_en: formData.name_en,
      name_ar: formData.name_ar || undefined,
      severity: formData.severity as FloodSeverity,
      status: (formData.status || 'monitoring') as FloodZoneStatus,
      geometry: geometry ?? undefined,
      stateId: formData.stateId,
      localityId: formData.localityId || undefined,
      waterLevel: formData.waterLevel ? Number(formData.waterLevel) : undefined,
      waterLevelTrend: (formData.waterLevelTrend as 'rising' | 'stable' | 'falling') || undefined,
      affectedPopulation: formData.affectedPopulation
        ? Number(formData.affectedPopulation)
        : undefined,
    });
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

  return (
    <div className="animate-in">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="hover:bg-accent rounded-md p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('editTitle')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <FloodZoneForm
            data={formData}
            onChange={setFormData}
            states={statesQuery.data ?? []}
            localities={localitiesQuery.data ?? []}
          />
        </div>

        <div className="card">
          <h2 className="font-heading mb-2 text-lg font-semibold tracking-tight">{t('mapView')}</h2>
          <p className="text-muted-foreground mb-4 text-sm">{t('drawPolygon')}</p>
          {geometry && (
            <p className="mb-2 text-sm text-green-600 dark:text-green-400">
              Polygon drawn ({geometry.coordinates[0]?.length ?? 0} points)
            </p>
          )}
          <LeafletMap className="h-[400px] w-full rounded-md">
            <DrawControl onPolygonCreated={handlePolygonCreated} />
          </LeafletMap>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{error}</div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary disabled:opacity-50"
          >
            {updateMutation.isPending ? t('saving') : t('saveChanges')}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            {tCommon('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
