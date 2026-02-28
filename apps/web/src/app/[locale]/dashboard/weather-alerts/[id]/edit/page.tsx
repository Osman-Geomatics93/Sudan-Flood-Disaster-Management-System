'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft } from 'lucide-react';
import { WEATHER_ALERT_TYPES, WEATHER_ALERT_SEVERITIES } from '@sudanflood/shared';
import type { WeatherAlertType, WeatherAlertSeverity } from '@sudanflood/shared';

export default function EditWeatherAlertPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('weatherAlert');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [form, setForm] = useState({
    alertType: '' as string,
    severity: '' as string,
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    stateId: '',
    expiresAt: '',
    source: '',
  });
  const [error, setError] = useState('');

  const alertQuery = trpc.weatherAlert.getById.useQuery({ id });
  const statesQuery = trpc.organization.listStates.useQuery();

  const updateMutation = trpc.weatherAlert.update.useMutation({
    onSuccess: () => {
      router.push(`/dashboard/weather-alerts/${id}`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  useEffect(() => {
    if (alertQuery.data) {
      const a = alertQuery.data;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        alertType: a.alertType ?? '',
        severity: a.severity ?? '',
        title_en: a.title_en ?? '',
        title_ar: a.title_ar ?? '',
        description_en: a.description_en ?? '',
        description_ar: a.description_ar ?? '',
        stateId: a.stateId ?? '',
        expiresAt: a.expiresAt ? new Date(a.expiresAt).toISOString().slice(0, 16) : '',
        source: a.source ?? '',
      });
    }
  }, [alertQuery.data]);

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

    updateMutation.mutate({
      id,
      alertType: form.alertType as WeatherAlertType,
      severity: form.severity as WeatherAlertSeverity,
      title_en: form.title_en,
      title_ar: form.title_ar || undefined,
      description_en: form.description_en || undefined,
      description_ar: form.description_ar || undefined,
      stateId: form.stateId || undefined,
      expiresAt: form.expiresAt ? new Date(form.expiresAt) : undefined,
      source: form.source || undefined,
    });
  };

  if (alertQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (alertQuery.error || !alertQuery.data) {
    return <div className="text-muted-foreground py-12 text-center">{tCommon('error')}</div>;
  }

  return (
    <div className="animate-in mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="hover:bg-accent rounded-md p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('editTitle')}</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

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
