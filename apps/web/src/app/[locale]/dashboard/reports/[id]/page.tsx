'use client';

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { useRouter } from '@/i18n/navigation';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { CITIZEN_REPORT_STATUSES } from '@sudanflood/shared';

const STATUS_STYLES: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  reviewed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  actioned: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const URGENCY_STYLES: Record<string, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  life_threatening: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const reportType = searchParams.get('type') ?? 'sitrep';
  const t = useTranslations('report');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const utils = trpc.useUtils();

  const [selectedStatus, setSelectedStatus] = useState('');

  const sitrepQuery = trpc.report.sitrep.getById.useQuery(
    { id },
    { enabled: reportType === 'sitrep' },
  );

  const citizenQuery = trpc.report.citizen.getById.useQuery(
    { id },
    { enabled: reportType === 'citizen' },
  );

  const publishMutation = trpc.report.sitrep.publish.useMutation({
    onSuccess: () => {
      utils.report.sitrep.getById.invalidate({ id });
    },
  });

  const reviewMutation = trpc.report.citizen.review.useMutation({
    onSuccess: () => {
      utils.report.citizen.getById.invalidate({ id });
      setSelectedStatus('');
    },
  });

  const deleteSitrepMutation = trpc.report.sitrep.delete.useMutation({
    onSuccess: () => {
      utils.report.sitrep.list.invalidate();
      router.push('/dashboard/reports');
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const deleteCitizenMutation = trpc.report.citizen.delete.useMutation({
    onSuccess: () => {
      utils.report.citizen.list.invalidate();
      router.push('/dashboard/reports');
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const handleDeleteSitrep = () => {
    if (window.confirm(t('deleteConfirm'))) {
      deleteSitrepMutation.mutate({ id });
    }
  };

  const handleDeleteCitizen = () => {
    if (window.confirm(t('deleteConfirm'))) {
      deleteCitizenMutation.mutate({ id });
    }
  };

  const isLoading = reportType === 'sitrep' ? sitrepQuery.isLoading : citizenQuery.isLoading;
  const hasError = reportType === 'sitrep' ? sitrepQuery.error : citizenQuery.error;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (hasError) {
    return <div className="text-muted-foreground py-12 text-center">{tCommon('error')}</div>;
  }

  // ── Situation Report Detail ───────────────────────────────────
  if (reportType === 'sitrep' && sitrepQuery.data) {
    const report = sitrepQuery.data;
    return (
      <div className="animate-in mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/reports" className="btn-secondary rounded-md p-1">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('details')}</h1>
              <p className="text-muted-foreground font-mono text-sm">{report.reportCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/reports/sitrep/${id}/edit`}
              className="btn-secondary flex items-center gap-1.5"
            >
              <Pencil className="h-4 w-4" />
              {tCommon('edit')}
            </Link>
            <button
              onClick={handleDeleteSitrep}
              disabled={deleteSitrepMutation.isPending}
              className="btn-ghost text-destructive flex items-center gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              {tCommon('delete')}
            </button>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {t(`type_${report.reportType}`)}
          </span>
          <span
            className={`badge ${report.isPublished ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
          >
            {report.isPublished ? t('published') : t('draft')}
          </span>
        </div>

        <div className="card mb-6">
          <h2 className="font-heading text-lg font-semibold tracking-tight">{report.title_en}</h2>
          {report.title_ar && (
            <p className="text-muted-foreground text-sm" dir="rtl">
              {report.title_ar}
            </p>
          )}

          {report.summary_en && (
            <div className="mt-4">
              <p className="text-muted-foreground text-xs">{t('summary')}</p>
              <p className="mt-1 text-sm">{report.summary_en}</p>
            </div>
          )}
          {report.summary_ar && (
            <div className="mt-2">
              <p className="text-muted-foreground text-xs">{t('summaryAr')}</p>
              <p className="mt-1 text-sm" dir="rtl">
                {report.summary_ar}
              </p>
            </div>
          )}

          {report.content != null &&
            typeof report.content === 'object' &&
            Object.keys(report.content as Record<string, unknown>).length > 0 && (
              <div className="mt-4">
                <p className="text-muted-foreground text-xs">{t('content')}</p>
                <pre className="bg-muted mt-1 max-h-64 overflow-auto rounded-md p-3 text-xs">
                  {JSON.stringify(report.content as Record<string, unknown>, null, 2)}
                </pre>
              </div>
            )}

          <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-xs">{t('reportNumber')}</p>
              <p>#{report.reportNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">{t('createdAt')}</p>
              <p>{report.createdAt ? new Date(report.createdAt).toLocaleString() : '-'}</p>
            </div>
            {report.publishedAt && (
              <div>
                <p className="text-muted-foreground text-xs">{t('publishedAt')}</p>
                <p>{new Date(report.publishedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {!report.isPublished && (
          <div className="card mb-6">
            <button
              onClick={() => publishMutation.mutate({ id })}
              disabled={publishMutation.isPending}
              className="btn-primary disabled:opacity-50"
            >
              {publishMutation.isPending ? t('publishing') : t('publish')}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Citizen Report Detail ─────────────────────────────────────
  if (reportType === 'citizen' && citizenQuery.data) {
    const report = citizenQuery.data;

    const handleReview = () => {
      if (!selectedStatus) return;
      reviewMutation.mutate({
        id,
        status: selectedStatus as (typeof CITIZEN_REPORT_STATUSES)[number],
      });
    };

    return (
      <div className="animate-in mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/reports" className="btn-secondary rounded-md p-1">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('details')}</h1>
              <p className="text-muted-foreground font-mono text-sm">{report.reportCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/reports/citizen/${id}/edit`}
              className="btn-secondary flex items-center gap-1.5"
            >
              <Pencil className="h-4 w-4" />
              {tCommon('edit')}
            </Link>
            <button
              onClick={handleDeleteCitizen}
              disabled={deleteCitizenMutation.isPending}
              className="btn-ghost text-destructive flex items-center gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              {tCommon('delete')}
            </button>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {t(`citizenType_${report.reportType}`)}
          </span>
          <span className={`badge ${URGENCY_STYLES[report.urgency] ?? ''}`}>
            {t(`urgency_${report.urgency}`)}
          </span>
          <span className={`badge ${STATUS_STYLES[report.status] ?? ''}`}>
            {t(`status_${report.status}`)}
          </span>
        </div>

        <div className="card mb-6">
          {report.description_en && (
            <div>
              <p className="text-muted-foreground text-xs">{t('descriptionEn')}</p>
              <p className="mt-1 text-sm">{report.description_en}</p>
            </div>
          )}
          {report.description_ar && (
            <div className="mt-3">
              <p className="text-muted-foreground text-xs">{t('descriptionAr')}</p>
              <p className="mt-1 text-sm" dir="rtl">
                {report.description_ar}
              </p>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-xs">{t('reporter')}</p>
              <p>{report.reporterName || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">{t('reporterPhone')}</p>
              <p>{report.reporterPhone || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">{t('createdAt')}</p>
              <p>{report.createdAt ? new Date(report.createdAt).toLocaleString() : '-'}</p>
            </div>
            {report.linkedTaskId && (
              <div>
                <p className="text-muted-foreground text-xs">{t('linkedTask')}</p>
                <Link
                  href={`/dashboard/tasks/${report.linkedTaskId}`}
                  className="text-primary hover:underline"
                >
                  {report.linkedTaskId}
                </Link>
              </div>
            )}
            {report.linkedRescueId && (
              <div>
                <p className="text-muted-foreground text-xs">{t('linkedRescue')}</p>
                <Link
                  href={`/dashboard/rescue-operations/${report.linkedRescueId}`}
                  className="text-primary hover:underline"
                >
                  {report.linkedRescueId}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Review */}
        {report.status === 'submitted' && (
          <div className="card mb-6">
            <h2 className="font-heading mb-3 text-lg font-semibold tracking-tight">
              {t('review')}
            </h2>
            <div className="flex gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-field flex-1"
              >
                <option value="">{t('selectStatus')}</option>
                {CITIZEN_REPORT_STATUSES.filter((s) => s !== 'submitted').map((s) => (
                  <option key={s} value={s}>
                    {t(`status_${s}`)}
                  </option>
                ))}
              </select>
              <button
                onClick={handleReview}
                disabled={!selectedStatus || reviewMutation.isPending}
                className="btn-primary disabled:opacity-50"
              >
                {reviewMutation.isPending ? t('reviewing') : t('review')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <div className="text-muted-foreground py-12 text-center">{tCommon('error')}</div>;
}
