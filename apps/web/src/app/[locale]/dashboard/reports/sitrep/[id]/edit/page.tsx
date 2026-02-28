'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft } from 'lucide-react';
import { REPORT_TYPES } from '@sudanflood/shared';
import type { ReportType } from '@sudanflood/shared';

export default function EditSituationReportPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('report');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [form, setForm] = useState({
    reportType: '' as string,
    title_en: '',
    title_ar: '',
    summary_en: '',
    summary_ar: '',
    content: '',
    stateId: '',
  });
  const [error, setError] = useState('');

  const reportQuery = trpc.report.sitrep.getById.useQuery({ id });
  const statesQuery = trpc.organization.listStates.useQuery();

  const updateMutation = trpc.report.sitrep.update.useMutation({
    onSuccess: () => {
      router.push(`/dashboard/reports/${id}?type=sitrep`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  useEffect(() => {
    if (reportQuery.data) {
      const r = reportQuery.data;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        reportType: r.reportType ?? '',
        title_en: r.title_en ?? '',
        title_ar: r.title_ar ?? '',
        summary_en: r.summary_en ?? '',
        summary_ar: r.summary_ar ?? '',
        content:
          r.content != null &&
          typeof r.content === 'object' &&
          Object.keys(r.content as Record<string, unknown>).length > 0
            ? JSON.stringify(r.content as Record<string, unknown>, null, 2)
            : '',
        stateId: r.stateId ?? '',
      });
    }
  }, [reportQuery.data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title_en) {
      setError('Title (English) is required');
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

    updateMutation.mutate({
      id,
      reportType: form.reportType as ReportType,
      title_en: form.title_en,
      title_ar: form.title_ar || undefined,
      summary_en: form.summary_en || undefined,
      summary_ar: form.summary_ar || undefined,
      content: contentObj,
      stateId: form.stateId || undefined,
    });
  };

  if (reportQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (reportQuery.error || !reportQuery.data) {
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <div>
              <label className="mb-1 block text-sm font-medium">{t('state')}</label>
              <select
                value={form.stateId}
                onChange={(e) => setForm({ ...form, stateId: e.target.value })}
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
