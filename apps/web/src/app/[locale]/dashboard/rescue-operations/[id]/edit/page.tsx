'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft } from 'lucide-react';
import { RESCUE_OPERATION_TYPES, TASK_PRIORITIES } from '@sudanflood/shared';
import type { RescueOperationType, TaskPriority } from '@sudanflood/shared';

export default function EditRescueOperationPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('rescue');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [form, setForm] = useState({
    operationType: '' as string,
    priority: '' as string,
    title_en: '',
    title_ar: '',
    description: '',
    floodZoneId: '',
    assignedOrgId: '',
    longitude: '',
    latitude: '',
    estimatedPersonsAtRisk: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);

  const opQuery = trpc.rescue.getById.useQuery({ id });
  const zonesQuery = trpc.floodZone.list.useQuery({ page: 1, limit: 100 });
  const orgsQuery = trpc.organization.list.useQuery({ page: 1, limit: 100 });

  const updateMutation = trpc.rescue.update.useMutation({
    onSuccess: () => {
      router.push(`/dashboard/rescue-operations/${id}`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  useEffect(() => {
    if (opQuery.data && !initialized) {
      const op = opQuery.data;
      const targetCoords = op.targetLocation
        ? (op.targetLocation as { coordinates: [number, number] }).coordinates
        : null;

      setForm({
        operationType: op.operationType ?? '',
        priority: op.priority ?? '',
        title_en: op.title_en ?? '',
        title_ar: op.title_ar ?? '',
        description: op.description ?? '',
        floodZoneId: op.floodZoneId ?? '',
        assignedOrgId: op.assignedOrgId ?? '',
        longitude: targetCoords ? String(targetCoords[0]) : '',
        latitude: targetCoords ? String(targetCoords[1]) : '',
        estimatedPersonsAtRisk:
          op.estimatedPersonsAtRisk != null ? String(op.estimatedPersonsAtRisk) : '',
        notes: op.notes ?? '',
      });
      setInitialized(true);
    }
  }, [opQuery.data, initialized]);

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

    const lng = form.longitude ? parseFloat(form.longitude) : undefined;
    const lat = form.latitude ? parseFloat(form.latitude) : undefined;

    if ((lng !== undefined || lat !== undefined) && (isNaN(lng!) || isNaN(lat!))) {
      setError('Invalid coordinates');
      return;
    }

    updateMutation.mutate({
      id,
      operationType: (form.operationType as RescueOperationType) || undefined,
      priority: (form.priority as TaskPriority) || undefined,
      title_en: form.title_en,
      title_ar: form.title_ar || undefined,
      description: form.description || undefined,
      floodZoneId: form.floodZoneId || undefined,
      assignedOrgId: form.assignedOrgId || undefined,
      targetLocation: lng !== undefined && lat !== undefined ? [lng, lat] : undefined,
      estimatedPersonsAtRisk: form.estimatedPersonsAtRisk
        ? Number(form.estimatedPersonsAtRisk)
        : undefined,
      notes: form.notes || undefined,
    });
  };

  if (opQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (opQuery.error) {
    return (
      <div className="bg-destructive/10 text-destructive rounded-md p-4">
        {opQuery.error.message}
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="hover:bg-accent rounded-md p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t('editOperation')}
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
              <label className="mb-1 block text-sm font-medium">{t('operationType')}</label>
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
              <label className="mb-1 block text-sm font-medium">{t('priority')}</label>
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
              <label className="mb-1 block text-sm font-medium">{t('floodZone')}</label>
              <select
                value={form.floodZoneId}
                onChange={(e) => handleChange('floodZoneId', e.target.value)}
                className="input-field w-full"
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
              <label className="mb-1 block text-sm font-medium">{t('assignedOrg')}</label>
              <select
                value={form.assignedOrgId}
                onChange={(e) => handleChange('assignedOrgId', e.target.value)}
                className="input-field w-full"
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
              <label className="mb-1 block text-sm font-medium">{t('latitude')}</label>
              <input
                type="number"
                step="any"
                min="-90"
                max="90"
                value={form.latitude}
                onChange={(e) => handleChange('latitude', e.target.value)}
                className="input-field w-full"
                placeholder="e.g. 15.5007"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('longitude')}</label>
              <input
                type="number"
                step="any"
                min="-180"
                max="180"
                value={form.longitude}
                onChange={(e) => handleChange('longitude', e.target.value)}
                className="input-field w-full"
                placeholder="e.g. 32.5599"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
            {t('description')}
          </h2>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="input-field w-full"
            placeholder={t('description')}
          />
        </div>

        <div className="card">
          <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
            {t('notes')}
          </h2>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="input-field w-full"
            placeholder={t('notes')}
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
