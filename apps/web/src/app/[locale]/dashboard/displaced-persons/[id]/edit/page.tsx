'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft } from 'lucide-react';
import { GENDERS, HEALTH_STATUSES, DISPLACED_PERSON_STATUSES } from '@sudanflood/shared';
import type { Gender, HealthStatus, DisplacedPersonStatus } from '@sudanflood/shared';

export default function EditDisplacedPersonPage() {
  const params = useParams();
  const id = params.id as string;
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
    status: '' as string,
  });
  const [error, setError] = useState('');

  const personQuery = trpc.displacedPerson.getById.useQuery({ id });
  const statesQuery = trpc.organization.listStates.useQuery();
  const localitiesQuery = trpc.organization.listLocalities.useQuery(
    { id: form.originStateId },
    { enabled: !!form.originStateId },
  );
  const sheltersQuery = trpc.shelter.list.useQuery({ page: 1, limit: 100, hasCapacity: true });

  const updateMutation = trpc.displacedPerson.update.useMutation({
    onSuccess: () => {
      router.push(`/dashboard/displaced-persons/${id}`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  // Pre-fill form when data loads
  useEffect(() => {
    if (personQuery.data) {
      const person = personQuery.data;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        firstName_ar: person.firstName_ar ?? '',
        lastName_ar: person.lastName_ar ?? '',
        firstName_en: person.firstName_en ?? '',
        lastName_en: person.lastName_en ?? '',
        dateOfBirth: person.dateOfBirth
          ? new Date(person.dateOfBirth).toISOString().slice(0, 10)
          : '',
        gender: person.gender ?? '',
        nationalId: person.nationalId ?? '',
        phone: person.phone ?? '',
        healthStatus: (person.healthStatus as HealthStatus) ?? 'unknown',
        healthNotes: person.healthNotes ?? '',
        hasDisability: person.hasDisability ?? false,
        disabilityNotes: person.disabilityNotes ?? '',
        isUnaccompaniedMinor: person.isUnaccompaniedMinor ?? false,
        shelterId: person.currentShelterId ?? '',
        originStateId: person.originStateId ?? '',
        originLocalityId: person.originLocalityId ?? '',
        specialNeeds: person.specialNeeds ?? '',
        status: person.status ?? '',
      });
    }
  }, [personQuery.data]);

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

    updateMutation.mutate({
      id,
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
      status: (form.status as DisplacedPersonStatus) || undefined,
    });
  };

  if (personQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (personQuery.error || !personQuery.data) {
    return <div className="text-muted-foreground py-12 text-center">{tCommon('error')}</div>;
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
        {/* Personal Info */}
        <div className="card">
          <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
            {t('personalInfo')}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('firstName_ar')} *</label>
              <input
                type="text"
                dir="rtl"
                value={form.firstName_ar}
                onChange={(e) => handleChange('firstName_ar', e.target.value)}
                className="input-field w-full"
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
                className="input-field w-full"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('firstName_en')}</label>
              <input
                type="text"
                value={form.firstName_en}
                onChange={(e) => handleChange('firstName_en', e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('lastName_en')}</label>
              <input
                type="text"
                value={form.lastName_en}
                onChange={(e) => handleChange('lastName_en', e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('dateOfBirth')}</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('gender')}</label>
              <select
                value={form.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="input-field w-full"
              >
                <option value="">{t('selectGender')}</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {t(`gender_${g}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('nationalId')}</label>
              <input
                type="text"
                value={form.nationalId}
                onChange={(e) => handleChange('nationalId', e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('phone')}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="input-field w-full"
                placeholder="+249..."
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="card">
          <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">{t('status')}</h2>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('status')}</label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="input-field w-full"
            >
              <option value="">{t('allStatuses')}</option>
              {DISPLACED_PERSON_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`status_${s}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Health */}
        <div className="card">
          <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
            {t('healthInfo')}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('healthStatus')}</label>
              <select
                value={form.healthStatus}
                onChange={(e) => handleChange('healthStatus', e.target.value)}
                className="input-field w-full"
              >
                {HEALTH_STATUSES.map((h) => (
                  <option key={h} value={h}>
                    {t(`health_${h}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('healthNotes')}</label>
              <input
                type="text"
                value={form.healthNotes}
                onChange={(e) => handleChange('healthNotes', e.target.value)}
                className="input-field w-full"
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
        <div className="card">
          <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
            {t('shelterAssignment')}
          </h2>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('assignToShelter')}</label>
            <select
              value={form.shelterId}
              onChange={(e) => handleChange('shelterId', e.target.value)}
              className="input-field w-full"
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
        <div className="card">
          <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
            {t('originInfo')}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('originState')}</label>
              <select
                value={form.originStateId}
                onChange={(e) => handleChange('originStateId', e.target.value)}
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
              <label className="mb-1 block text-sm font-medium">{t('originLocality')}</label>
              <select
                value={form.originLocalityId}
                onChange={(e) => handleChange('originLocalityId', e.target.value)}
                className="input-field w-full"
                disabled={!form.originStateId}
              >
                <option value="">{t('selectLocality')}</option>
                {(localitiesQuery.data ?? []).map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name_en}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">{t('specialNeeds')}</label>
              <textarea
                rows={3}
                value={form.specialNeeds}
                onChange={(e) => handleChange('specialNeeds', e.target.value)}
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
            disabled={updateMutation.isPending}
            className="btn-primary disabled:opacity-50"
          >
            {updateMutation.isPending ? tCommon('saving') : tCommon('save')}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            {tCommon('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
