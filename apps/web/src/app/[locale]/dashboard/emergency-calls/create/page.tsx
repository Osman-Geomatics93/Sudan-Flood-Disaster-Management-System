'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft } from 'lucide-react';
import { CALL_URGENCIES } from '@sudanflood/shared';
import type { CallUrgency } from '@sudanflood/shared';

export default function CreateEmergencyCallPage() {
  const t = useTranslations('emergencyCall');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [form, setForm] = useState({
    callerName: '',
    callerPhone: '',
    callerAddress: '',
    callNumber: '999' as '999' | '112',
    urgency: 'medium' as CallUrgency,
    description_en: '',
    description_ar: '',
    personsAtRisk: '',
    stateId: '',
    floodZoneId: '',
  });
  const [error, setError] = useState('');

  const statesQuery = trpc.organization.listStates.useQuery();

  const createMutation = trpc.emergencyCall.create.useMutation({
    onSuccess: () => {
      router.push('/dashboard/emergency-calls');
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

    if (!form.callerPhone) {
      setError('Caller phone is required');
      return;
    }

    createMutation.mutate({
      callerName: form.callerName || undefined,
      callerPhone: form.callerPhone,
      callerAddress: form.callerAddress || undefined,
      callNumber: form.callNumber,
      urgency: form.urgency,
      description_en: form.description_en || undefined,
      description_ar: form.description_ar || undefined,
      personsAtRisk: form.personsAtRisk ? Number(form.personsAtRisk) : undefined,
      stateId: form.stateId || undefined,
      floodZoneId: form.floodZoneId || undefined,
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-md p-2 hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">{t('createCall')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t('callerInfo')}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('callerName')}</label>
              <input
                type="text"
                value={form.callerName}
                onChange={(e) => handleChange('callerName', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder={t('callerName')}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('callerPhone')} *</label>
              <input
                type="tel"
                value={form.callerPhone}
                onChange={(e) => handleChange('callerPhone', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
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
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t('callDetails')}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('number')} *</label>
              <select
                value={form.callNumber}
                onChange={(e) => handleChange('callNumber', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
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
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {CALL_URGENCIES.map((u) => (
                  <option key={u} value={u}>{t(`urgency_${u}`)}</option>
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
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('state')}</label>
              <select
                value={form.stateId}
                onChange={(e) => handleChange('stateId', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">{t('selectState')}</option>
                {(statesQuery.data ?? []).map((s) => (
                  <option key={s.id} value={s.id}>{s.name_en}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t('description')}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('descriptionEn')}</label>
              <textarea
                rows={4}
                value={form.description_en}
                onChange={(e) => handleChange('description_en', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('descriptionAr')}</label>
              <textarea
                rows={4}
                dir="rtl"
                value={form.description_ar}
                onChange={(e) => handleChange('description_ar', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {createMutation.isPending ? t('creating') : t('createCall')}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border px-6 py-2 text-sm hover:bg-accent"
          >
            {tCommon('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
