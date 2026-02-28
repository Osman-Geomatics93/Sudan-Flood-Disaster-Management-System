'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft } from 'lucide-react';
import { WEATHER_ALERT_TYPES, WEATHER_ALERT_SEVERITIES } from '@sudanflood/shared';
import type { WeatherAlertType, WeatherAlertSeverity } from '@sudanflood/shared';

export default function CreateWeatherAlertPage() {
  const t = useTranslations('weatherAlert');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [form, setForm] = useState({
    alertType: 'flood_warning' as WeatherAlertType,
    severity: 'advisory' as WeatherAlertSeverity,
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    stateId: '',
    expiresAt: '',
    source: '',
  });
  const [error, setError] = useState('');

  const statesQuery = trpc.organization.listStates.useQuery();

  const createMutation = trpc.weatherAlert.create.useMutation({
    onSuccess: () => {
      router.push('/dashboard/weather-alerts');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title_en) {
      setError('Title (English) is required');
      return;
    }

    createMutation.mutate({
      alertType: form.alertType,
      severity: form.severity,
      title_en: form.title_en,
      title_ar: form.title_ar || undefined,
      description_en: form.description_en || undefined,
      description_ar: form.description_ar || undefined,
      stateId: form.stateId || undefined,
      expiresAt: form.expiresAt ? new Date(form.expiresAt) : undefined,
      source: form.source || undefined,
    });
  };

  return (
    <div className="animate-in">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="hover:bg-accent rounded-md p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('createAlert')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
            {t('alertType')}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('alertType')} *</label>
              <select
                value={form.alertType}
                onChange={(e) => handleChange('alertType', e.target.value)}
                className="input-field w-full"
              >
                {WEATHER_ALERT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`type_${type}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('severity')} *</label>
              <select
                value={form.severity}
                onChange={(e) => handleChange('severity', e.target.value)}
                className="input-field w-full"
              >
                {WEATHER_ALERT_SEVERITIES.map((sev) => (
                  <option key={sev} value={sev}>
                    {t(`severity_${sev}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('state')}</label>
              <select
                value={form.stateId}
                onChange={(e) => handleChange('stateId', e.target.value)}
                className="input-field w-full"
              >
                <option value="">{t('selectState')}</option>
                {(statesQuery.data ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('expiresAt')}</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => handleChange('expiresAt', e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">{t('source')}</label>
              <input
                type="text"
                value={form.source}
                onChange={(e) => handleChange('source', e.target.value)}
                className="input-field w-full"
                placeholder={t('source')}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">{t('titleEn')}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('titleEn')} *</label>
              <input
                type="text"
                value={form.title_en}
                onChange={(e) => handleChange('title_en', e.target.value)}
                className="input-field w-full"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('titleAr')}</label>
              <input
                type="text"
                dir="rtl"
                value={form.title_ar}
                onChange={(e) => handleChange('title_ar', e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
            {t('description')}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('descriptionEn')}</label>
              <textarea
                rows={4}
                value={form.description_en}
                onChange={(e) => handleChange('description_en', e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('descriptionAr')}</label>
              <textarea
                rows={4}
                dir="rtl"
                value={form.description_ar}
                onChange={(e) => handleChange('description_ar', e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{error}</div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn-primary disabled:opacity-50"
          >
            {createMutation.isPending ? t('creating') : t('createAlert')}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            {tCommon('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
