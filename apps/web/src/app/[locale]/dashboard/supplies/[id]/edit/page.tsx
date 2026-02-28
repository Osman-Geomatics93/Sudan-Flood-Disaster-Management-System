'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft } from 'lucide-react';
import { SUPPLY_TYPES } from '@sudanflood/shared';
import type { SupplyType } from '@sudanflood/shared';

export default function EditSupplyPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('supply');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [form, setForm] = useState({
    supplyType: '' as string,
    itemName_en: '',
    itemName_ar: '',
    quantity: '',
    unit: '',
    sourceOrgId: '',
    destinationShelterId: '',
    expiryDate: '',
    notes: '',
  });
  const [error, setError] = useState('');

  const supplyQuery = trpc.supply.getById.useQuery({ id });
  const orgsQuery = trpc.organization.list.useQuery({ page: 1, limit: 100 });
  const sheltersQuery = trpc.shelter.list.useQuery({ page: 1, limit: 100 });

  const updateMutation = trpc.supply.update.useMutation({
    onSuccess: () => {
      router.push(`/dashboard/supplies/${id}`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  // Pre-fill form when data loads
  useEffect(() => {
    if (supplyQuery.data) {
      const supply = supplyQuery.data;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        supplyType: supply.supplyType ?? '',
        itemName_en: supply.itemName_en ?? '',
        itemName_ar: supply.itemName_ar ?? '',
        quantity: supply.quantity ?? '',
        unit: supply.unit ?? '',
        sourceOrgId: supply.sourceOrgId ?? '',
        destinationShelterId: supply.destinationShelterId ?? '',
        expiryDate: supply.expiryDate ?? '',
        notes: supply.notes ?? '',
      });
    }
  }, [supplyQuery.data]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (
      !form.supplyType ||
      !form.itemName_en ||
      !form.quantity ||
      !form.unit ||
      !form.sourceOrgId
    ) {
      setError('Please fill in all required fields');
      return;
    }

    updateMutation.mutate({
      id,
      supplyType: form.supplyType as SupplyType,
      itemName_en: form.itemName_en,
      itemName_ar: form.itemName_ar || undefined,
      quantity: Number(form.quantity),
      unit: form.unit,
      sourceOrgId: form.sourceOrgId,
      destinationShelterId: form.destinationShelterId || undefined,
      expiryDate: form.expiryDate ? new Date(form.expiryDate) : undefined,
      notes: form.notes || undefined,
    });
  };

  if (supplyQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (supplyQuery.error || !supplyQuery.data) {
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
        <div className="card space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('selectType')} *</label>
            <select
              value={form.supplyType}
              onChange={(e) => handleChange('supplyType', e.target.value)}
              className="input-field w-full"
              required
            >
              <option value="">{t('selectType')}</option>
              {SUPPLY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`type_${type}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('itemNameEn')} *</label>
              <input
                type="text"
                value={form.itemName_en}
                onChange={(e) => handleChange('itemName_en', e.target.value)}
                className="input-field w-full"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('itemNameAr')}</label>
              <input
                type="text"
                dir="rtl"
                value={form.itemName_ar}
                onChange={(e) => handleChange('itemName_ar', e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('quantity')} *</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                className="input-field w-full"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('unit')} *</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                placeholder="kg, liters, units, boxes"
                className="input-field w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('selectOrg')} *</label>
            <select
              value={form.sourceOrgId}
              onChange={(e) => handleChange('sourceOrgId', e.target.value)}
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
            <label className="mb-1 block text-sm font-medium">{t('selectShelter')}</label>
            <select
              value={form.destinationShelterId}
              onChange={(e) => handleChange('destinationShelterId', e.target.value)}
              className="input-field w-full"
            >
              <option value="">{t('selectShelter')}</option>
              {sheltersQuery.data?.items.map((shelter) => (
                <option key={shelter.id} value={shelter.id}>
                  {shelter.name_en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('expiryDate')}</label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) => handleChange('expiryDate', e.target.value)}
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('notes')}</label>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="input-field w-full"
            />
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
