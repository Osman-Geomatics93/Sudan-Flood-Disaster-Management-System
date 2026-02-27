'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft } from 'lucide-react';
import { GENDERS, HEALTH_STATUSES } from '@sudanflood/shared';
import type { Gender, HealthStatus } from '@sudanflood/shared';

export default function RegisterDisplacedPersonPage() {
  const t = useTranslations('displacedPerson');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [form, setForm] = useState({
    firstName_ar: '',
    lastName_ar: '',
    firstName_en: '',
    lastName_en: '',
    dateOfBirth: '',
    gender: '',
    nationalId: '',
    phone: '',
    healthStatus: 'unknown' as HealthStatus,
    healthNotes: '',
    hasDisability: false,
    disabilityNotes: '',
    isUnaccompaniedMinor: false,
    shelterId: '',
    originStateId: '',
    originLocalityId: '',
    specialNeeds: '',
    familyGroupId: '',
  });
  const [error, setError] = useState('');

  const statesQuery = trpc.organization.listStates.useQuery();
  const localitiesQuery = trpc.organization.listLocalities.useQuery(
    { id: form.originStateId },
    { enabled: !!form.originStateId },
  );
  const sheltersQuery = trpc.shelter.list.useQuery({ page: 1, limit: 200, hasCapacity: true });

  const registerMutation = trpc.displacedPerson.register.useMutation({
    onSuccess: (data) => {
      router.push(`/dashboard/displaced-persons/${data.id}`);
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

    if (!form.firstName_ar || !form.lastName_ar) {
      setError(t('arabicNameRequired'));
      return;
    }

    registerMutation.mutate({
      firstName_ar: form.firstName_ar,
      lastName_ar: form.lastName_ar,
      firstName_en: form.firstName_en || undefined,
      lastName_en: form.lastName_en || undefined,
      dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : undefined,
      gender: (form.gender as Gender) || undefined,
      nationalId: form.nationalId || undefined,
      phone: form.phone || undefined,
      healthStatus: form.healthStatus,
      healthNotes: form.healthNotes || undefined,
      hasDisability: form.hasDisability,
      disabilityNotes: form.disabilityNotes || undefined,
      isUnaccompaniedMinor: form.isUnaccompaniedMinor,
      shelterId: form.shelterId || undefined,
      originStateId: form.originStateId || undefined,
      originLocalityId: form.originLocalityId || undefined,
      specialNeeds: form.specialNeeds || undefined,
      familyGroupId: form.familyGroupId || undefined,
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-md p-2 hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">{t('registerTitle')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Arabic Name */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t('personalInfo')}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('firstName_ar')} *</label>
              <input
                type="text"
                dir="rtl"
                value={form.firstName_ar}
                onChange={(e) => handleChange('firstName_ar', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('lastName_ar')} *</label>
              <input
                type="text"
                dir="rtl"
                value={form.lastName_ar}
                onChange={(e) => handleChange('lastName_ar', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('firstName_en')}</label>
              <input
                type="text"
                value={form.firstName_en}
                onChange={(e) => handleChange('firstName_en', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('lastName_en')}</label>
              <input
                type="text"
                value={form.lastName_en}
                onChange={(e) => handleChange('lastName_en', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('dateOfBirth')}</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('gender')}</label>
              <select
                value={form.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">{t('selectGender')}</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{t(`gender_${g}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('nationalId')}</label>
              <input
                type="text"
                value={form.nationalId}
                onChange={(e) => handleChange('nationalId', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('phone')}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="+249..."
              />
            </div>
          </div>
        </div>

        {/* Health */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t('healthInfo')}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('healthStatus')}</label>
              <select
                value={form.healthStatus}
                onChange={(e) => handleChange('healthStatus', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {HEALTH_STATUSES.map((h) => (
                  <option key={h} value={h}>{t(`health_${h}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('healthNotes')}</label>
              <input
                type="text"
                value={form.healthNotes}
                onChange={(e) => handleChange('healthNotes', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.hasDisability}
                  onChange={(e) => handleChange('hasDisability', e.target.checked)}
                  className="rounded"
                />
                {t('hasDisability')}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isUnaccompaniedMinor}
                  onChange={(e) => handleChange('isUnaccompaniedMinor', e.target.checked)}
                  className="rounded"
                />
                {t('isUnaccompaniedMinor')}
              </label>
            </div>
          </div>
        </div>

        {/* Shelter Assignment */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t('shelterAssignment')}</h2>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('assignToShelter')}</label>
            <select
              value={form.shelterId}
              onChange={(e) => handleChange('shelterId', e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">{t('noShelter')}</option>
              {(sheltersQuery.data?.items ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name_en} ({s.currentOccupancy}/{s.capacity})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Origin */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t('originInfo')}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('originState')}</label>
              <select
                value={form.originStateId}
                onChange={(e) => handleChange('originStateId', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">{t('selectState')}</option>
                {(statesQuery.data ?? []).map((s) => (
                  <option key={s.id} value={s.id}>{s.name_en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('originLocality')}</label>
              <select
                value={form.originLocalityId}
                onChange={(e) => handleChange('originLocalityId', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                disabled={!form.originStateId}
              >
                <option value="">{t('selectLocality')}</option>
                {(localitiesQuery.data ?? []).map((l) => (
                  <option key={l.id} value={l.id}>{l.name_en}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">{t('specialNeeds')}</label>
              <textarea
                rows={3}
                value={form.specialNeeds}
                onChange={(e) => handleChange('specialNeeds', e.target.value)}
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
            disabled={registerMutation.isPending}
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {registerMutation.isPending ? t('registering') : t('register')}
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
