'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { SUPPLY_TYPES } from '@sudanflood/shared';

export default function RequestSupplyPage() {
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

  const orgsQuery = trpc.organization.list.useQuery({ page: 1, limit: 100 });
  const sheltersQuery = trpc.shelter.list.useQuery({ page: 1, limit: 100 });

  const requestMutation = trpc.supply.request.useMutation({
    onSuccess: () => {
      router.push('/dashboard/supplies');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.supplyType || !form.itemName_en || !form.quantity || !form.unit || !form.sourceOrgId) {
      setError('Please fill in all required fields');
      return;
    }

    requestMutation.mutate({
      supplyType: form.supplyType as typeof SUPPLY_TYPES[number],
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

  return (
    <div className="animate-in mx-auto max-w-2xl">
      <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight">{t('requestSupply')}</h1>

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
              onChange={(e) => setForm({ ...form, supplyType: e.target.value })}
              className="input-field w-full"
              required
            >
              <option value="">{t('selectType')}</option>
              {SUPPLY_TYPES.map((type) => (
                <option key={type} value={type}>{t(`type_${type}`)}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('itemNameEn')} *</label>
              <input
                type="text"
                value={form.itemName_en}
                onChange={(e) => setForm({ ...form, itemName_en: e.target.value })}
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
                onChange={(e) => setForm({ ...form, itemName_ar: e.target.value })}
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
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="input-field w-full"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('unit')} *</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
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
              onChange={(e) => setForm({ ...form, sourceOrgId: e.target.value })}
              className="input-field w-full"
              required
            >
              <option value="">{t('selectOrg')}</option>
              {orgsQuery.data?.items.map((org) => (
                <option key={org.id} value={org.id}>{org.name_en}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('selectShelter')}</label>
            <select
              value={form.destinationShelterId}
              onChange={(e) => setForm({ ...form, destinationShelterId: e.target.value })}
              className="input-field w-full"
            >
              <option value="">{t('selectShelter')}</option>
              {sheltersQuery.data?.items.map((shelter) => (
                <option key={shelter.id} value={shelter.id}>{shelter.name_en}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('expiryDate')}</label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('notes')}</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="input-field w-full"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={requestMutation.isPending}
            className="btn-primary disabled:opacity-50"
          >
            {requestMutation.isPending ? t('requesting') : t('requestSupply')}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            {tCommon('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
