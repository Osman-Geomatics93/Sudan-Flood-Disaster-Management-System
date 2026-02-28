'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft } from 'lucide-react';
import { CALL_URGENCIES } from '@sudanflood/shared';
import type { CallUrgency } from '@sudanflood/shared';

export default function EditEmergencyCallPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('emergencyCall');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [form, setForm] = useState({
    callerName: '',
    callerPhone: '',
    callerAddress: '',
    callNumber: '999' as string,
    urgency: 'medium' as string,
    description_en: '',
    description_ar: '',
    personsAtRisk: '',
    stateId: '',
    floodZoneId: '',
    notes: '',
  });
  const [error, setError] = useState('');

  const callQuery = trpc.emergencyCall.getById.useQuery({ id });
  const statesQuery = trpc.organization.listStates.useQuery();

  const updateMutation = trpc.emergencyCall.update.useMutation({
    onSuccess: () => {
      router.push(`/dashboard/emergency-calls/${id}`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  // Pre-fill form when data loads
  useEffect(() => {
    if (callQuery.data) {
      const call = callQuery.data;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        callerName: call.callerName ?? '',
        callerPhone: call.callerPhone ?? '',
        callerAddress: call.callerAddress ?? '',
        callNumber: call.callNumber ?? '999',
        urgency: call.urgency ?? 'medium',
        description_en: call.description_en ?? '',
        description_ar: call.description_ar ?? '',
        personsAtRisk: call.personsAtRisk != null ? String(call.personsAtRisk) : '',
        stateId: call.stateId ?? '',
        floodZoneId: call.floodZoneId ?? '',
        notes: call.notes ?? '',
      });
    }
  }, [callQuery.data]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.callerPhone) {
      setError('Caller phone is required');
      return;
    }

    updateMutation.mutate({
      id,
      callerName: form.callerName || undefined,
      callerPhone: form.callerPhone,
      callerAddress: form.callerAddress || undefined,
      callNumber: form.callNumber as '999' | '112',
      urgency: form.urgency as CallUrgency,
      description_en: form.description_en || undefined,
      description_ar: form.description_ar || undefined,
      personsAtRisk: form.personsAtRisk ? Number(form.personsAtRisk) : undefined,
      stateId: form.stateId || undefined,
      floodZoneId: form.floodZoneId || undefined,
      notes: form.notes || undefined,
    });
  };

  if (callQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (callQuery.error || !callQuery.data) {
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
            {t('callerInfo')}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('callerName')}</label>
              <input
                type="text"
                value={form.callerName}
                onChange={(e) => handleChange('callerName', e.target.value)}
                className="input-field w-full"
                placeholder={t('callerName')}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('callerPhone')} *</label>
              <input
                type="tel"
                value={form.callerPhone}
                onChange={(e) => handleChange('callerPhone', e.target.value)}
                className="input-field w-full"
                placeholder="+249..."
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">{t('callerAddress')}</label>
              <input
                type="text"
                value={form.callerAddress}
                onChange={(e) => handleChange('callerAddress', e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
            {t('callDetails')}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('number')} *</label>
              <select
                value={form.callNumber}
                onChange={(e) => handleChange('callNumber', e.target.value)}
                className="input-field w-full"
              >
                <option value="999">999</option>
                <option value="112">112</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('urgency')} *</label>
              <select
                value={form.urgency}
                onChange={(e) => handleChange('urgency', e.target.value)}
                className="input-field w-full"
              >
                {CALL_URGENCIES.map((u) => (
                  <option key={u} value={u}>
                    {t(`urgency_${u}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('personsAtRisk')}</label>
              <input
                type="number"
                min="0"
                value={form.personsAtRisk}
                onChange={(e) => handleChange('personsAtRisk', e.target.value)}
                className="input-field w-full"
              />
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

        <div className="card">
          <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">{t('notes')}</h2>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="input-field w-full"
          />
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
