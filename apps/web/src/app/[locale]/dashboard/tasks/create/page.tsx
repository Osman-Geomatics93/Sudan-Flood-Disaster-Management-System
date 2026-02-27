'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { TASK_PRIORITIES } from '@sudanflood/shared';

export default function CreateTaskPage() {
  const t = useTranslations('task');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [form, setForm] = useState({
    title_en: '',
    title_ar: '',
    description: '',
    priority: 'medium' as string,
    assignedToOrgId: '',
    floodZoneId: '',
    deadline: '',
  });
  const [error, setError] = useState('');

  const orgsQuery = trpc.organization.list.useQuery({ page: 1, limit: 100 });
  const zonesQuery = trpc.floodZone.list.useQuery({ page: 1, limit: 100 });

  const createMutation = trpc.task.create.useMutation({
    onSuccess: () => {
      router.push('/dashboard/tasks');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title_en || !form.assignedToOrgId) {
      setError('Please fill in title and assigned organization');
      return;
    }

    createMutation.mutate({
      title_en: form.title_en,
      title_ar: form.title_ar || undefined,
      description: form.description || undefined,
      priority: form.priority as typeof TASK_PRIORITIES[number],
      assignedToOrgId: form.assignedToOrgId,
      floodZoneId: form.floodZoneId || undefined,
      deadline: form.deadline ? new Date(form.deadline) : undefined,
    });
  };

  return (
    <div className="animate-in mx-auto max-w-2xl">
      <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight">{t('createTask')}</h1>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('titleEn')} *</label>
              <input
                type="text"
                value={form.title_en}
                onChange={(e) => setForm({ ...form, title_en: e.target.value })}
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
                onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
                className="input-field w-full"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('description')}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="input-field w-full"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('selectPriority')}</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="input-field w-full"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>{t(`priority_${p}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('deadline')}</label>
              <input
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="input-field w-full"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('assignedOrg')} *</label>
            <select
              value={form.assignedToOrgId}
              onChange={(e) => setForm({ ...form, assignedToOrgId: e.target.value })}
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
            <label className="mb-1 block text-sm font-medium">{t('floodZone')}</label>
            <select
              value={form.floodZoneId}
              onChange={(e) => setForm({ ...form, floodZoneId: e.target.value })}
              className="input-field w-full"
            >
              <option value="">{t('selectFloodZone')}</option>
              {zonesQuery.data?.items.map((zone) => (
                <option key={zone.id} value={zone.id}>{zone.name_en}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn-primary disabled:opacity-50"
          >
            {createMutation.isPending ? t('creating') : t('createTask')}
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
