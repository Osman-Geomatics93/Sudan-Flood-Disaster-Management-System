'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft } from 'lucide-react';
import { CITIZEN_REPORT_TYPES, CALL_URGENCIES } from '@sudanflood/shared';
import type { CitizenReportType, CallUrgency } from '@sudanflood/shared';

export default function EditCitizenReportPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('report');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [form, setForm] = useState({
    reportType: '' as string,
    urgency: '' as string,
    description_en: '',
    description_ar: '',
    reporterName: '',
    reporterPhone: '',
    stateId: '',
    localityId: '',
  });
  const [error, setError] = useState('');

  const reportQuery = trpc.report.citizen.getById.useQuery({ id });
  const statesQuery = trpc.organization.listStates.useQuery();

  const updateMutation = trpc.report.citizen.update.useMutation({
    onSuccess: () => {
      router.push(`/dashboard/reports/${id}?type=citizen`);
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
        urgency: r.urgency ?? '',
        description_en: r.description_en ?? '',
        description_ar: r.description_ar ?? '',
        reporterName: r.reporterName ?? '',
        reporterPhone: r.reporterPhone ?? '',
        stateId: r.stateId ?? '',
        localityId: r.localityId ?? '',
      });
    }
  }, [reportQuery.data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    updateMutation.mutate({
      id,
      reportType: form.reportType as CitizenReportType,
      urgency: form.urgency as CallUrgency,
      description_en: form.description_en || undefined,
      description_ar: form.description_ar || undefined,
      reporterName: form.reporterName || undefined,
      reporterPhone: form.reporterPhone || undefined,
      stateId: form.stateId || undefined,
      localityId: form.localityId || undefined,
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
                {CITIZEN_REPORT_TYPES.map((rt) => (
                  <option key={rt} value={rt}>
                    {t(`citizenType_${rt}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('urgency')} *</label>
              <select
                value={form.urgency}
                onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                className="input-field w-full"
              >
                {CALL_URGENCIES.map((u) => (
                  <option key={u} value={u}>
                    {t(`urgency_${u}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('descriptionEn')}</label>
              <textarea
                value={form.description_en}
                onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                rows={4}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('descriptionAr')}</label>
              <textarea
                dir="rtl"
                value={form.description_ar}
                onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                rows={4}
                className="input-field w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('reporterName')}</label>
              <input
                type="text"
                value={form.reporterName}
                onChange={(e) => setForm({ ...form, reporterName: e.target.value })}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('reporterPhone')}</label>
              <input
                type="text"
                value={form.reporterPhone}
                onChange={(e) => setForm({ ...form, reporterPhone: e.target.value })}
                className="input-field w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
