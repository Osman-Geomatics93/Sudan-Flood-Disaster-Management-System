'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft } from 'lucide-react';
import { RESCUE_OPERATION_TYPES, TASK_PRIORITIES } from '@sudanflood/shared';
import type { RescueOperationType, TaskPriority } from '@sudanflood/shared';

export default function CreateRescueOperationPage() {
  const t = useTranslations('rescue');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [form, setForm] = useState({
    operationType: 'boat' as RescueOperationType,
    priority: 'high' as TaskPriority,
    title_en: '',
    title_ar: '',
    description: '',
    floodZoneId: '',
    assignedOrgId: '',
    longitude: '',
    latitude: '',
    estimatedPersonsAtRisk: '',
    teamLeaderId: '',
  });
  const [error, setError] = useState('');

  const zonesQuery = trpc.floodZone.list.useQuery({ page: 1, limit: 100 });
  const orgsQuery = trpc.organization.list.useQuery({ page: 1, limit: 100 });

  const createMutation = trpc.rescue.create.useMutation({
    onSuccess: (data) => {
      router.push(`/dashboard/rescue-operations/${data.id}`);
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

    if (!form.floodZoneId) {
      setError('Flood zone is required');
      return;
    }

    if (!form.assignedOrgId) {
      setError('Assigned organization is required');
      return;
    }

    if (!form.longitude || !form.latitude) {
      setError('Target location (latitude and longitude) is required');
      return;
    }

    const lng = parseFloat(form.longitude);
    const lat = parseFloat(form.latitude);

    if (isNaN(lng) || isNaN(lat)) {
      setError('Invalid coordinates');
      return;
    }

    createMutation.mutate({
      operationType: form.operationType,
      priority: form.priority,
      title_en: form.title_en,
      title_ar: form.title_ar || undefined,
      description: form.description || undefined,
      floodZoneId: form.floodZoneId,
      assignedOrgId: form.assignedOrgId,
      targetLocation: [lng, lat],
      estimatedPersonsAtRisk: form.estimatedPersonsAtRisk
        ? Number(form.estimatedPersonsAtRisk)
        : undefined,
      teamLeaderId: form.teamLeaderId || undefined,
    });
  };

  return (
    <div className="animate-in">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="hover:bg-accent rounded-md p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t('createOperation')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
            {t('operationDetails')}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('titleLabel')} (EN) *</label>
              <input
                type="text"
                value={form.title_en}
                onChange={(e) => handleChange('title_en', e.target.value)}
                className="input-field w-full"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('titleLabel')} (AR)</label>
              <input
                type="text"
                dir="rtl"
                value={form.title_ar}
                onChange={(e) => handleChange('title_ar', e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('operationType')} *</label>
              <select
                value={form.operationType}
                onChange={(e) => handleChange('operationType', e.target.value)}
                className="input-field w-full"
              >
                {RESCUE_OPERATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('priority')} *</label>
              <select
                value={form.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="input-field w-full"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {t(`priority_${p}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('floodZone')} *</label>
              <select
                value={form.floodZoneId}
                onChange={(e) => handleChange('floodZoneId', e.target.value)}
                className="input-field w-full"
                required
              >
                <option value="">{t('selectFloodZone')}</option>
                {zonesQuery.data?.items.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name_en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('assignedOrg')} *</label>
              <select
                value={form.assignedOrgId}
                onChange={(e) => handleChange('assignedOrgId', e.target.value)}
                className="input-field w-full"
                required
              >
                <option value="">{t('selectOrg')}</option>
                {orgsQuery.data?.items.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name_en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('estimatedPersons')}</label>
              <input
                type="number"
                min="0"
                value={form.estimatedPersonsAtRisk}
                onChange={(e) => handleChange('estimatedPersonsAtRisk', e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
            {t('targetLocation')}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('latitude')} *</label>
              <input
                type="number"
                step="any"
                min="-90"
                max="90"
                value={form.latitude}
                onChange={(e) => handleChange('latitude', e.target.value)}
                className="input-field w-full"
                placeholder="e.g. 15.5007"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('longitude')} *</label>
              <input
                type="number"
                step="any"
                min="-180"
                max="180"
                value={form.longitude}
                onChange={(e) => handleChange('longitude', e.target.value)}
                className="input-field w-full"
                placeholder="e.g. 32.5599"
                required
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
            {t('description')}
          </h2>
          <div>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="input-field w-full"
              placeholder={t('description')}
            />
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
            {createMutation.isPending ? tCommon('loading') : t('createOperation')}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            {tCommon('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
