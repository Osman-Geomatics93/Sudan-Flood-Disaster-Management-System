'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import dynamic from 'next/dynamic';
import { trpc } from '@/lib/trpc-client';
import { FloodZoneForm } from '@/components/flood-zones/FloodZoneForm';
import { ArrowLeft } from 'lucide-react';
import type { FloodSeverity, FloodZoneStatus, GeoJsonPolygon } from '@sudanflood/shared';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), { ssr: false });
const DrawControl = dynamic(() => import('@/components/map/DrawControl'), { ssr: false });

export default function CreateFloodZonePage() {
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

  const statesQuery = trpc.organization.listStates.useQuery();
  const localitiesQuery = trpc.organization.listLocalities.useQuery(
    { id: formData.stateId },
    { enabled: !!formData.stateId },
  );

  const createMutation = trpc.floodZone.create.useMutation({
    onSuccess: () => {
      router.push('/dashboard/flood-zones');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handlePolygonCreated = useCallback(
    (geojson: { type: 'Polygon'; coordinates: number[][][] }) => {
      setGeometry(geojson as GeoJsonPolygon);
    },
    [],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!geometry) {
      setError(t('geometryRequired'));
      return;
    }

    if (!formData.name_en || !formData.severity || !formData.stateId) {
      setError('Please fill in all required fields');
      return;
    }

    createMutation.mutate({
      name_en: formData.name_en,
      name_ar: formData.name_ar || undefined,
      severity: formData.severity as FloodSeverity,
      status: (formData.status || 'monitoring') as FloodZoneStatus,
      geometry,
      stateId: formData.stateId,
      localityId: formData.localityId || undefined,
      waterLevel: formData.waterLevel ? Number(formData.waterLevel) : undefined,
      waterLevelTrend: (formData.waterLevelTrend as 'rising' | 'stable' | 'falling') || undefined,
      affectedPopulation: formData.affectedPopulation ? Number(formData.affectedPopulation) : undefined,
    });
  };

  return (
    <div className="animate-in">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-md p-2 hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('create')}</h1>
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
          <p className="mb-4 text-sm text-muted-foreground">{t('drawPolygon')}</p>
          {geometry && (
            <p className="mb-2 text-sm text-green-600 dark:text-green-400">Polygon drawn ({geometry.coordinates[0]?.length ?? 0} points)</p>
          )}
          <LeafletMap className="h-[400px] w-full rounded-md">
            <DrawControl onPolygonCreated={handlePolygonCreated} />
          </LeafletMap>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn-primary disabled:opacity-50"
          >
            {createMutation.isPending ? t('creating') : t('create')}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            {tCommon('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
