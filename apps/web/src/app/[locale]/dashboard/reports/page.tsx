'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { REPORT_TYPES, CITIZEN_REPORT_STATUSES, CALL_URGENCIES } from '@sudanflood/shared';
import type { ReportType, CitizenReportStatus, CallUrgency } from '@sudanflood/shared';

type Tab = 'situation' | 'citizen';

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

export default function ReportsPage() {
  const t = useTranslations('report');
  const tCommon = useTranslations('common');

  const [tab, setTab] = useState<Tab>('situation');
  const [sitrepPage, setSitrepPage] = useState(1);
  const [citizenPage, setCitizenPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');

  const sitrepQuery = trpc.report.sitrep.list.useQuery({
    page: sitrepPage,
    limit: 20,
    ...(typeFilter && { reportType: typeFilter as ReportType }),
  });

  const citizenQuery = trpc.report.citizen.list.useQuery({
    page: citizenPage,
    limit: 20,
    ...(statusFilter && { status: statusFilter as CitizenReportStatus }),
    ...(urgencyFilter && { urgency: urgencyFilter as CallUrgency }),
  });

  return (
    <div className="animate-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('title')}</h1>
        {tab === 'situation' && (
          <Link href="/dashboard/reports/create" className="btn-primary flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            {t('createReport')}
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-4 flex rounded-md border">
        <button
          onClick={() => setTab('situation')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${tab === 'situation' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
        >
          {t('situationReports')}
        </button>
        <button
          onClick={() => setTab('citizen')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${tab === 'citizen' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
        >
          {t('citizenReports')}
        </button>
      </div>

      {/* Situation Reports Tab */}
      {tab === 'situation' && (
        <>
          <div className="mb-4 flex gap-3">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setSitrepPage(1);
              }}
              className="input-field"
            >
              <option value="">{t('allTypes')}</option>
              {REPORT_TYPES.map((rt) => (
                <option key={rt} value={rt}>
                  {t(`type_${rt}`)}
                </option>
              ))}
            </select>
          </div>

          {sitrepQuery.isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
          )}

          {sitrepQuery.data && (
            <>
              {sitrepQuery.data.items.length === 0 && (
                <div className="text-muted-foreground rounded-lg border py-12 text-center">
                  {tCommon('noData')}
                </div>
              )}

              {sitrepQuery.data.items.length > 0 && (
                <>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-start font-medium">{t('reportCode')}</th>
                          <th className="px-4 py-3 text-start font-medium">{t('titleEn')}</th>
                          <th className="px-4 py-3 text-start font-medium">{t('type')}</th>
                          <th className="px-4 py-3 text-start font-medium">{t('reportNumber')}</th>
                          <th className="px-4 py-3 text-start font-medium">{t('status')}</th>
                          <th className="px-4 py-3 text-start font-medium">{t('createdAt')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sitrepQuery.data.items.map((report) => (
                          <tr key={report.id} className="hover:bg-muted/30 border-b">
                            <td className="px-4 py-3 font-mono">
                              <Link
                                href={`/dashboard/reports/${report.id}?type=sitrep`}
                                className="text-primary hover:underline"
                              >
                                {report.reportCode}
                              </Link>
                            </td>
                            <td className="px-4 py-3">{report.title_en}</td>
                            <td className="px-4 py-3">
                              <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {t(`type_${report.reportType}`)}
                              </span>
                            </td>
                            <td className="px-4 py-3">#{report.reportNumber}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`badge ${report.isPublished ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
                              >
                                {report.isPublished ? t('published') : t('draft')}
                              </span>
                            </td>
                            <td className="text-muted-foreground px-4 py-3">
                              {report.createdAt
                                ? new Date(report.createdAt).toLocaleDateString()
                                : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {sitrepQuery.data.totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        {t('page')} {sitrepQuery.data.page} / {sitrepQuery.data.totalPages} (
                        {sitrepQuery.data.total} {t('total')})
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={sitrepPage <= 1}
                          onClick={() => setSitrepPage((p) => p - 1)}
                          className="btn-secondary disabled:opacity-50"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          disabled={sitrepPage >= (sitrepQuery.data?.totalPages ?? 1)}
                          onClick={() => setSitrepPage((p) => p + 1)}
                          className="btn-secondary disabled:opacity-50"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Citizen Reports Tab */}
      {tab === 'citizen' && (
        <>
          <div className="mb-4 flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCitizenPage(1);
              }}
              className="input-field"
            >
              <option value="">{t('allStatuses')}</option>
              {CITIZEN_REPORT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`status_${s}`)}
                </option>
              ))}
            </select>
            <select
              value={urgencyFilter}
              onChange={(e) => {
                setUrgencyFilter(e.target.value);
                setCitizenPage(1);
              }}
              className="input-field"
            >
              <option value="">{t('allUrgencies')}</option>
              {CALL_URGENCIES.map((u) => (
                <option key={u} value={u}>
                  {t(`urgency_${u}`)}
                </option>
              ))}
            </select>
          </div>

          {citizenQuery.isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
          )}

          {citizenQuery.data && (
            <>
              {citizenQuery.data.items.length === 0 && (
                <div className="text-muted-foreground rounded-lg border py-12 text-center">
                  {tCommon('noData')}
                </div>
              )}

              {citizenQuery.data.items.length > 0 && (
                <>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-start font-medium">{t('reportCode')}</th>
                          <th className="px-4 py-3 text-start font-medium">{t('type')}</th>
                          <th className="px-4 py-3 text-start font-medium">{t('urgency')}</th>
                          <th className="px-4 py-3 text-start font-medium">{t('status')}</th>
                          <th className="px-4 py-3 text-start font-medium">{t('reporter')}</th>
                          <th className="px-4 py-3 text-start font-medium">{t('createdAt')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {citizenQuery.data.items.map((report) => (
                          <tr key={report.id} className="hover:bg-muted/30 border-b">
                            <td className="px-4 py-3 font-mono">
                              <Link
                                href={`/dashboard/reports/${report.id}?type=citizen`}
                                className="text-primary hover:underline"
                              >
                                {report.reportCode}
                              </Link>
                            </td>
                            <td className="px-4 py-3">
                              <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {t(`citizenType_${report.reportType}`)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`badge ${URGENCY_STYLES[report.urgency] ?? ''}`}>
                                {t(`urgency_${report.urgency}`)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`badge ${STATUS_STYLES[report.status] ?? ''}`}>
                                {t(`status_${report.status}`)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {report.reporterName || report.reporterPhone || '-'}
                            </td>
                            <td className="text-muted-foreground px-4 py-3">
                              {report.createdAt
                                ? new Date(report.createdAt).toLocaleDateString()
                                : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {citizenQuery.data.totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        {t('page')} {citizenQuery.data.page} / {citizenQuery.data.totalPages} (
                        {citizenQuery.data.total} {t('total')})
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={citizenPage <= 1}
                          onClick={() => setCitizenPage((p) => p - 1)}
                          className="btn-secondary disabled:opacity-50"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          disabled={citizenPage >= (citizenQuery.data?.totalPages ?? 1)}
                          onClick={() => setCitizenPage((p) => p + 1)}
                          className="btn-secondary disabled:opacity-50"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
