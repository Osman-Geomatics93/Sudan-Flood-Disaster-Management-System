'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { REPORT_TYPES } from '@sudanflood/shared';
import type { ReportType } from '@sudanflood/shared';

export default function CreateReportPage() {
  const t = useTranslations('report');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [form, setForm] = useState({
    incidentId: '',
    reportType: 'situation_report' as string,
    title_en: '',
    title_ar: '',
    summary_en: '',
    summary_ar: '',
    content: '',
  });
  const [error, setError] = useState('');

  const incidentsQuery = trpc.floodZone.incident.list.useQuery({
    page: 1,
    limit: 100,
  });

  const createMutation = trpc.report.sitrep.create.useMutation({
    onSuccess: () => {
      router.push('/dashboard/reports');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title_en || !form.incidentId) {
      setError('Please fill in the title and select an incident');
      return;
    }

    let contentObj: Record<string, unknown> | undefined;
    if (form.content.trim()) {
      try {
        contentObj = JSON.parse(form.content);
      } catch {
        setError('Content must be valid JSON');
        return;
      }
    }

    createMutation.mutate({
      incidentId: form.incidentId,
      reportType: form.reportType as ReportType,
      title_en: form.title_en,
      title_ar: form.title_ar || undefined,
      summary_en: form.summary_en || undefined,
      summary_ar: form.summary_ar || undefined,
      content: contentObj,
    });
  };

  return (
    <div className="animate-in mx-auto max-w-2xl">
      <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight">
        {t('createReport')}
      </h1>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('incident')} *</label>
              <select
                value={form.incidentId}
                onChange={(e) => setForm({ ...form, incidentId: e.target.value })}
                className="input-field w-full"
                required
              >
                <option value="">{t('selectIncident')}</option>
                {incidentsQuery.data?.items?.map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    {inc.incidentCode} - {inc.title_en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('type')} *</label>
              <select
                value={form.reportType}
                onChange={(e) => setForm({ ...form, reportType: e.target.value })}
                className="input-field w-full"
              >
                {REPORT_TYPES.map((rt) => (
                  <option key={rt} value={rt}>
                    {t(`type_${rt}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('summaryEn')}</label>
              <textarea
                value={form.summary_en}
                onChange={(e) => setForm({ ...form, summary_en: e.target.value })}
                rows={3}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('summaryAr')}</label>
              <textarea
                dir="rtl"
                value={form.summary_ar}
                onChange={(e) => setForm({ ...form, summary_ar: e.target.value })}
                rows={3}
                className="input-field w-full"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('content')} (JSON)</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={6}
              className="input-field w-full font-mono text-xs"
              placeholder='{"sections": []}'
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn-primary disabled:opacity-50"
          >
            {createMutation.isPending ? t('creating') : t('createReport')}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            {tCommon('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
