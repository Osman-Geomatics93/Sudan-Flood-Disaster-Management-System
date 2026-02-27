'use client';

import { useTranslations } from 'next-intl';
import { FLOOD_SEVERITIES, FLOOD_ZONE_STATUSES } from '@sudanflood/shared';

interface FloodZoneFormData {
  name_en: string;
  name_ar: string;
  severity: string;
  status: string;
  stateId: string;
  localityId: string;
  waterLevel: string;
  waterLevelTrend: string;
  affectedPopulation: string;
}

interface FloodZoneFormProps {
  data: FloodZoneFormData;
  onChange: (data: FloodZoneFormData) => void;
  states: Array<{ id: string; name_en: string; name_ar: string }>;
  localities: Array<{ id: string; name_en: string; name_ar: string }>;
}

export function FloodZoneForm({ data, onChange, states, localities }: FloodZoneFormProps) {
  const t = useTranslations('floodZone');

  const update = (field: keyof FloodZoneFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">{t('nameEn')}</label>
          <input
            type="text"
            value={data.name_en}
            onChange={(e) => update('name_en', e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('nameAr')}</label>
          <input
            type="text"
            value={data.name_ar}
            onChange={(e) => update('name_ar', e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            dir="rtl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">{t('severity')}</label>
          <select
            value={data.severity}
            onChange={(e) => update('severity', e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">{t('selectSeverity')}</option>
            {FLOOD_SEVERITIES.map((s) => (
              <option key={s} value={s}>{t(`severity_${s}`)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('status')}</label>
          <select
            value={data.status}
            onChange={(e) => update('status', e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">{t('selectStatus')}</option>
            {FLOOD_ZONE_STATUSES.map((s) => (
              <option key={s} value={s}>{t(`status_${s}`)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">{t('state')}</label>
          <select
            value={data.stateId}
            onChange={(e) => {
              onChange({ ...data, stateId: e.target.value, localityId: '' });
            }}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">{t('selectState')}</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>{s.name_en}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('locality')}</label>
          <select
            value={data.localityId}
            onChange={(e) => update('localityId', e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            disabled={!data.stateId}
          >
            <option value="">{t('selectLocality')}</option>
            {localities.map((l) => (
              <option key={l.id} value={l.id}>{l.name_en}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">{t('waterLevel')} (m)</label>
          <input
            type="number"
            value={data.waterLevel}
            onChange={(e) => update('waterLevel', e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            min="0"
            max="100"
            step="0.1"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('waterLevelTrend')}</label>
          <select
            value={data.waterLevelTrend}
            onChange={(e) => update('waterLevelTrend', e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">-</option>
            <option value="rising">Rising</option>
            <option value="stable">Stable</option>
            <option value="falling">Falling</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('affectedPopulation')}</label>
          <input
            type="number"
            value={data.affectedPopulation}
            onChange={(e) => update('affectedPopulation', e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            min="0"
          />
        </div>
      </div>
    </div>
  );
}
