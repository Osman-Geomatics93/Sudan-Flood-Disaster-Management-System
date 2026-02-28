'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { TASK_PRIORITIES } from '@sudanflood/shared';

export default function EditTaskPage() {
  const { id } = useParams<{ id: string }>();
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

  const taskQuery = trpc.task.getById.useQuery({ id });
  const orgsQuery = trpc.organization.list.useQuery({ page: 1, limit: 100 });
  const zonesQuery = trpc.floodZone.list.useQuery({ page: 1, limit: 100 });

  const updateMutation = trpc.task.update.useMutation({
    onSuccess: () => {
      router.push(`/dashboard/tasks/${id}`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  // Pre-fill form when data loads
  useEffect(() => {
    if (taskQuery.data) {
      const task = taskQuery.data;
      setForm({
        title_en: task.title_en ?? '',
        title_ar: task.title_ar ?? '',
        description: task.description ?? '',
        priority: task.priority ?? 'medium',
        assignedToOrgId: task.assignedToOrgId ?? '',
        floodZoneId: task.floodZoneId ?? '',
        deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
      });
    }
  }, [taskQuery.data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title_en || !form.assignedToOrgId) {
      setError('Please fill in title and assigned organization');
      return;
    }

    updateMutation.mutate({
      id,
      title_en: form.title_en,
      title_ar: form.title_ar || undefined,
      description: form.description || undefined,
      priority: form.priority as (typeof TASK_PRIORITIES)[number],
      assignedToOrgId: form.assignedToOrgId,
      floodZoneId: form.floodZoneId || undefined,
      deadline: form.deadline ? new Date(form.deadline) : undefined,
    });
  };

  if (taskQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (taskQuery.error || !taskQuery.data) {
    return <div className="text-muted-foreground py-12 text-center">{tCommon('error')}</div>;
  }

  return (
    <div className="animate-in mx-auto max-w-2xl">
      <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight">{t('editTitle')}</h1>

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
                  <option key={p} value={p}>
                    {t(`priority_${p}`)}
                  </option>
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
                <option key={org.id} value={org.id}>
                  {org.name_en}
                </option>
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
                <option key={zone.id} value={zone.id}>
                  {zone.name_en}
                </option>
              ))}
            </select>
          </div>
        </div>

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
