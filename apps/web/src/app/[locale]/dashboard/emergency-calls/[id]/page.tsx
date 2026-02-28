'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft, Phone, Clock, AlertTriangle, Users } from 'lucide-react';
import { CALL_URGENCIES } from '@sudanflood/shared';

const URGENCY_STYLES: Record<string, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  life_threatening: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const STATUS_STYLES: Record<string, string> = {
  received: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  triaged: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  dispatched: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  duplicate: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  false_alarm: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export default function EmergencyCallDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('emergencyCall');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const callQuery = trpc.emergencyCall.getById.useQuery({ id });
  const utils = trpc.useUtils();

  // Triage state
  const [triageUrgency, setTriageUrgency] = useState('');
  const [triageNotes, setTriageNotes] = useState('');
  const [triageError, setTriageError] = useState('');

  // Resolve state
  const [resolveNotes, setResolveNotes] = useState('');

  const triageMutation = trpc.emergencyCall.triage.useMutation({
    onSuccess: () => {
      utils.emergencyCall.getById.invalidate({ id });
      setTriageError('');
    },
    onError: (err) => setTriageError(err.message),
  });

  const resolveMutation = trpc.emergencyCall.resolve.useMutation({
    onSuccess: () => {
      utils.emergencyCall.getById.invalidate({ id });
    },
  });

  if (callQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (callQuery.error) {
    return (
      <div className="bg-destructive/10 text-destructive rounded-md p-4">
        {callQuery.error.message}
      </div>
    );
  }

  const call = callQuery.data;
  if (!call) return null;

  const handleTriage = () => {
    if (!triageUrgency) {
      setTriageError('Please select urgency');
      return;
    }
    triageMutation.mutate({
      id: call.id,
      urgency: triageUrgency as (typeof CALL_URGENCIES)[number],
      notes: triageNotes || undefined,
    });
  };

  const handleResolve = () => {
    resolveMutation.mutate({
      id: call.id,
      notes: resolveNotes || undefined,
    });
  };

  return (
    <div className="animate-in">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="hover:bg-accent rounded-md p-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {t('callDetail')}
            </h1>
            <p className="text-muted-foreground font-mono text-sm">{call.callCode}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Caller info card */}
          <div className="card">
            <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
              {t('callerInfo')}
            </h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground text-sm">{t('callerName')}</dt>
                <dd className="mt-1 text-sm">{call.callerName ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">{t('callerPhone')}</dt>
                <dd className="mt-1 flex items-center gap-1 text-sm">
                  <Phone className="h-3 w-3" /> {call.callerPhone}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground text-sm">{t('callerAddress')}</dt>
                <dd className="mt-1 text-sm">{call.callerAddress ?? '-'}</dd>
              </div>
            </dl>
          </div>

          {/* Description card */}
          {(call.description_en || call.description_ar) && (
            <div className="card">
              <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
                {t('description')}
              </h2>
              {call.description_en && <p className="mb-2 text-sm">{call.description_en}</p>}
              {call.description_ar && (
                <p className="text-sm" dir="rtl">
                  {call.description_ar}
                </p>
              )}
            </div>
          )}

          {/* Notes card */}
          {call.notes && (
            <div className="card">
              <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
                {t('notes')}
              </h2>
              <p className="whitespace-pre-wrap text-sm">{call.notes}</p>
            </div>
          )}

          {/* Triage action */}
          {call.status === 'received' && (
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-950">
              <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
                {t('triageCall')}
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('urgency')}</label>
                  <select
                    value={triageUrgency}
                    onChange={(e) => setTriageUrgency(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">{t('selectUrgency')}</option>
                    {CALL_URGENCIES.map((u) => (
                      <option key={u} value={u}>
                        {t(`urgency_${u}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('notes')}</label>
                  <textarea
                    rows={3}
                    value={triageNotes}
                    onChange={(e) => setTriageNotes(e.target.value)}
                    className="input-field w-full"
                  />
                </div>
                {triageError && <p className="text-destructive text-sm">{triageError}</p>}
                <button
                  onClick={handleTriage}
                  disabled={triageMutation.isPending}
                  className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50"
                >
                  {triageMutation.isPending ? tCommon('loading') : t('triageCall')}
                </button>
              </div>
            </div>
          )}

          {/* Resolve action */}
          {(call.status === 'dispatched' || call.status === 'triaged') && (
            <div className="rounded-lg border border-green-300 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950">
              <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
                {t('resolveCall')}
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('notes')}</label>
                  <textarea
                    rows={3}
                    value={resolveNotes}
                    onChange={(e) => setResolveNotes(e.target.value)}
                    className="input-field w-full"
                  />
                </div>
                <button
                  onClick={handleResolve}
                  disabled={resolveMutation.isPending}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {resolveMutation.isPending ? tCommon('loading') : t('resolveCall')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
              {t('callDetails')}
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-muted-foreground text-sm">{t('status')}</dt>
                <dd className="mt-1">
                  <span className={`badge ${STATUS_STYLES[call.status] ?? ''}`}>
                    {call.status.replace('_', ' ')}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">{t('urgency')}</dt>
                <dd className="mt-1">
                  <span className={`badge ${URGENCY_STYLES[call.urgency] ?? ''}`}>
                    <AlertTriangle className="h-3 w-3" />
                    {call.urgency.replace('_', ' ')}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">{t('number')}</dt>
                <dd className="mt-1 flex items-center gap-1 text-sm">
                  <Phone className="h-3 w-3" /> {call.callNumber}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">{t('personsAtRisk')}</dt>
                <dd className="mt-1 flex items-center gap-1 text-sm">
                  <Users className="h-3 w-3" /> {call.personsAtRisk ?? 0}
                </dd>
              </div>
            </dl>
          </div>

          <div className="card">
            <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
              {t('timeline')}
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Clock className="h-3 w-3" /> {t('receivedAt')}
                </dt>
                <dd className="mt-1 text-sm">{new Date(call.receivedAt).toLocaleString()}</dd>
              </div>
              {call.triagedAt && (
                <div>
                  <dt className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3" /> {t('triagedAt')}
                  </dt>
                  <dd className="mt-1 text-sm">{new Date(call.triagedAt).toLocaleString()}</dd>
                </div>
              )}
              {call.dispatchedAt && (
                <div>
                  <dt className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3" /> {t('dispatchedAt')}
                  </dt>
                  <dd className="mt-1 text-sm">{new Date(call.dispatchedAt).toLocaleString()}</dd>
                </div>
              )}
              {call.resolvedAt && (
                <div>
                  <dt className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3" /> {t('resolvedAt')}
                  </dt>
                  <dd className="mt-1 text-sm">{new Date(call.resolvedAt).toLocaleString()}</dd>
                </div>
              )}
            </dl>
          </div>

          {call.rescueOperationId && (
            <div className="card">
              <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">
                {t('linkedRescue')}
              </h2>
              <a
                href={`/dashboard/rescue-operations/${call.rescueOperationId}`}
                className="text-primary dark:text-primary text-sm hover:underline"
              >
                {t('viewRescueOp')}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
