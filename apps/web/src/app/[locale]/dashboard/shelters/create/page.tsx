'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import dynamic from 'next/dynamic';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft } from 'lucide-react';
import { Marker, useMapEvents } from 'react-leaflet';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), { ssr: false });

function ClickMarker({
  position,
  onPositionChange,
}: {
  position: [number, number] | null;
  onPositionChange: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    },
  });

  if (!position) return null;
  return <Marker position={position} />;
}

export default function CreateShelterPage() {
  const t = useTranslations('shelter');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [form, setForm] = useState({
    name_en: '',
    name_ar: '',
    address_en: '',
    address_ar: '',
    stateId: '',
    localityId: '',
    managingOrgId: '',
    capacity: '',
    facilityNotes: '',
    hasWater: false,
    hasElectricity: false,
    hasMedical: false,
    hasSanitation: false,
    hasKitchen: false,
    hasSecurity: false,
  });
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);
  const [error, setError] = useState('');

  const statesQuery = trpc.organization.listStates.useQuery();
  const localitiesQuery = trpc.organization.listLocalities.useQuery(
    { id: form.stateId },
    { enabled: !!form.stateId },
  );
  const orgsQuery = trpc.organization.list.useQuery({ page: 1, limit: 100 });

  const createMutation = trpc.shelter.create.useMutation({
    onSuccess: () => {
      router.push('/dashboard/shelters');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name_en || !form.stateId || !form.managingOrgId || !form.capacity) {
      setError('Please fill in all required fields');
      return;
    }
    if (!markerPos) {
      setError(t('clickMapLocation'));
      return;
    }

    createMutation.mutate({
      name_en: form.name_en,
      name_ar: form.name_ar || undefined,
      location: [markerPos[1], markerPos[0]], // [lng, lat]
      address_en: form.address_en || undefined,
      address_ar: form.address_ar || undefined,
      stateId: form.stateId,
      localityId: form.localityId || undefined,
      managingOrgId: form.managingOrgId,
      capacity: Number(form.capacity),
      hasWater: form.hasWater,
      hasElectricity: form.hasElectricity,
      hasMedical: form.hasMedical,
      hasSanitation: form.hasSanitation,
      hasKitchen: form.hasKitchen,
      hasSecurity: form.hasSecurity,
      facilityNotes: form.facilityNotes || undefined,
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="btn-ghost p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('createShelter')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">{t('basicInfo')}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('nameEn')} *</label>
              <input
                type="text"
                value={form.name_en}
                onChange={(e) => handleChange('name_en', e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('nameAr')}</label>
              <input
                type="text"
                dir="rtl"
                value={form.name_ar}
                onChange={(e) => handleChange('name_ar', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('addressEn')}</label>
              <input
                type="text"
                value={form.address_en}
                onChange={(e) => handleChange('address_en', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('addressAr')}</label>
              <input
                type="text"
                dir="rtl"
                value={form.address_ar}
                onChange={(e) => handleChange('address_ar', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('state')} *</label>
              <select
                value={form.stateId}
                onChange={(e) => handleChange('stateId', e.target.value)}
                className="input-field"
                required
              >
                <option value="">{t('selectState')}</option>
                {(statesQuery.data ?? []).map((s) => (
                  <option key={s.id} value={s.id}>{s.name_en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('locality')}</label>
              <select
                value={form.localityId}
                onChange={(e) => handleChange('localityId', e.target.value)}
                className="input-field"
                disabled={!form.stateId}
              >
                <option value="">{t('selectLocality')}</option>
                {(localitiesQuery.data ?? []).map((l) => (
                  <option key={l.id} value={l.id}>{l.name_en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('managingOrg')} *</label>
              <select
                value={form.managingOrgId}
                onChange={(e) => handleChange('managingOrgId', e.target.value)}
                className="input-field"
                required
              >
                <option value="">{t('selectOrg')}</option>
                {(orgsQuery.data?.items ?? []).map((o) => (
                  <option key={o.id} value={o.id}>{o.name_en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('capacity')} *</label>
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) => handleChange('capacity', e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">{t('facilities')}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(['hasWater', 'hasElectricity', 'hasMedical', 'hasSanitation', 'hasKitchen', 'hasSecurity'] as const).map(
              (key) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => handleChange(key, e.target.checked)}
                    className="rounded"
                  />
                  {t(key)}
                </label>
              ),
            )}
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium">{t('facilityNotes')}</label>
            <textarea
              rows={3}
              value={form.facilityNotes}
              onChange={(e) => handleChange('facilityNotes', e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="card">
          <h2 className="mb-2 text-lg font-semibold">{t('location')}</h2>
          <p className="mb-4 text-sm text-muted-foreground">{t('clickMapLocation')}</p>
          {markerPos && (
            <p className="mb-2 text-sm text-green-600">
              {t('locationSet')}: {markerPos[0].toFixed(4)}, {markerPos[1].toFixed(4)}
            </p>
          )}
          <LeafletMap className="h-[400px] w-full rounded-md">
            <ClickMarker position={markerPos} onPositionChange={setMarkerPos} />
          </LeafletMap>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn-primary"
          >
            {createMutation.isPending ? t('creating') : t('createShelter')}
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
