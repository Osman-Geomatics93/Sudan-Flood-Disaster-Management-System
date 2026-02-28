'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import dynamic from 'next/dynamic';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft, Clock, Users, AlertTriangle, MapPin, Pencil, Trash2 } from 'lucide-react';
import { OPERATION_STATUSES } from '@sudanflood/shared';
import type { OperationStatus } from '@sudanflood/shared';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), { ssr: false });
const ShelterMarkerLayer = dynamic(() => import('@/components/map/ShelterMarkerLayer'), {
  ssr: false,
});

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  dispatched: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
  en_route: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  on_site: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  aborted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const STATUS_ORDER: OperationStatus[] = [
  'pending',
  'dispatched',
  'en_route',
  'on_site',
  'in_progress',
  'completed',
];

export default function RescueOperationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('rescue');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const opQuery = trpc.rescue.getById.useQuery({ id });
  const utils = trpc.useUtils();

  const [newStatus, setNewStatus] = useState('');
  const [personsRescued, setPersonsRescued] = useState('');
  const [notes, setNotes] = useState('');

  const updateStatusMutation = trpc.rescue.updateStatus.useMutation({
    onSuccess: () => {
      utils.rescue.getById.invalidate({ id });
      setNewStatus('');
      setNotes('');
    },
  });

  const dispatchMutation = trpc.rescue.dispatch.useMutation({
    onSuccess: () => {
      utils.rescue.getById.invalidate({ id });
    },
  });

  const completeMutation = trpc.rescue.complete.useMutation({
    onSuccess: () => {
      utils.rescue.getById.invalidate({ id });
    },
  });

  const deleteMutation = trpc.rescue.delete.useMutation({
    onSuccess: () => {
      router.push('/dashboard/rescue-operations');
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  if (opQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (opQuery.error) {
    return (
      <div className="bg-destructive/10 text-destructive rounded-md p-4">
        {opQuery.error.message}
      </div>
    );
  }

  const op = opQuery.data;
  if (!op) return null;

  const targetCoords = op.targetLocation
    ? (op.targetLocation as { coordinates: [number, number] }).coordinates
    : null;

  const isDeletable = ['pending', 'aborted', 'failed'].includes(op.status);

  const handleDelete = () => {
    if (window.confirm(t('deleteConfirm'))) {
      deleteMutation.mutate({ id: op.id });
    }
  };

  const handleDispatch = () => {
    dispatchMutation.mutate({ id: op.id });
  };

  const handleUpdateStatus = () => {
    if (!newStatus) return;
    updateStatusMutation.mutate({
      id: op.id,
      status: newStatus as OperationStatus,
      personsRescued: personsRescued ? Number(personsRescued) : undefined,
      notes: notes || undefined,
    });
  };

  const handleComplete = () => {
    completeMutation.mutate({
      id: op.id,
      personsRescued: Number(personsRescued) || 0,
      notes: notes || undefined,
    });
  };

  // Build map markers from target location
  const mapMarkers = targetCoords
    ? [
        {
          id: op.id,
          shelterCode: op.operationCode,
          name_en: op.title_en ?? 'Target',
          status: 'open' as const,
          currentOccupancy: 0,
          capacity: 0,
          location: { type: 'Point' as const, coordinates: targetCoords },
        },
      ]
    : [];

  // Determine current step in status timeline
  const currentIndex = STATUS_ORDER.indexOf(op.status as OperationStatus);

  return (
    <div className="animate-in">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn-ghost p-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">{op.title_en}</h1>
            <p className="text-muted-foreground font-mono text-sm">{op.operationCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/rescue-operations/${id}/edit`}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            {tCommon('edit')}
          </Link>
          {isDeletable && (
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {deleteMutation.isPending ? tCommon('loading') : tCommon('delete')}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Status timeline */}
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold">{t('statusTimeline')}</h2>
            <div className="flex items-center gap-1">
              {STATUS_ORDER.map((s, i) => (
                <div key={s} className="flex flex-1 items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                      i <= currentIndex
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < STATUS_ORDER.length - 1 && (
                    <div
                      className={`mx-1 h-0.5 flex-1 ${
                        i < currentIndex ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-1">
              {STATUS_ORDER.map((s) => (
                <div key={s} className="text-muted-foreground flex-1 text-center text-[10px]">
                  {s.replace('_', ' ')}
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          {targetCoords && (
            <div className="overflow-hidden rounded-lg border">
              <LeafletMap
                className="h-[350px] w-full"
                center={[targetCoords[1], targetCoords[0]]}
                zoom={12}
              >
                <ShelterMarkerLayer shelters={mapMarkers} />
              </LeafletMap>
            </div>
          )}

          {/* Description */}
          {op.description && (
            <div className="card">
              <h2 className="mb-2 text-lg font-semibold">{t('description')}</h2>
              <p className="whitespace-pre-wrap text-sm">{op.description}</p>
            </div>
          )}

          {/* Notes */}
          {op.notes && (
            <div className="card">
              <h2 className="mb-2 text-lg font-semibold">{t('notes')}</h2>
              <p className="whitespace-pre-wrap text-sm">{op.notes}</p>
            </div>
          )}

          {/* Team members */}
          {op.team && op.team.length > 0 && (
            <div className="card">
              <h2 className="mb-4 text-lg font-semibold">{t('teamMembers')}</h2>
              <div className="space-y-2">
                {op.team.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <span className="text-sm">{member.userId}</span>
                    <span className="text-muted-foreground text-xs">{member.roleInTeam}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {op.status === 'pending' && (
            <div className="card border-primary/30 bg-primary/5 dark:bg-primary/10">
              <h2 className="mb-4 text-lg font-semibold">{t('dispatchOperation')}</h2>
              <button
                onClick={handleDispatch}
                disabled={dispatchMutation.isPending}
                className="btn-primary"
              >
                {dispatchMutation.isPending ? tCommon('loading') : t('dispatch')}
              </button>
            </div>
          )}

          {op.status !== 'completed' &&
            op.status !== 'aborted' &&
            op.status !== 'failed' &&
            op.status !== 'pending' && (
              <div className="card">
                <h2 className="mb-4 text-lg font-semibold">{t('updateStatus')}</h2>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">{t('newStatus')}</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="input-field"
                    >
                      <option value="">{t('selectStatus')}</option>
                      {OPERATION_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {t(`status_${s}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">{t('personsRescued')}</label>
                    <input
                      type="number"
                      min="0"
                      value={personsRescued}
                      onChange={(e) => setPersonsRescued(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">{t('notes')}</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateStatus}
                      disabled={updateStatusMutation.isPending || !newStatus}
                      className="btn-primary"
                    >
                      {updateStatusMutation.isPending ? tCommon('loading') : t('updateStatus')}
                    </button>
                    <button
                      onClick={handleComplete}
                      disabled={completeMutation.isPending}
                      className="btn-secondary border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950"
                    >
                      {completeMutation.isPending ? tCommon('loading') : t('markComplete')}
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold">{t('operationDetails')}</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-muted-foreground text-sm">{t('status')}</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[op.status] ?? ''}`}
                  >
                    {op.status.replace('_', ' ')}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">{t('priority')}</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[op.priority] ?? ''}`}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {op.priority}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">{t('type')}</dt>
                <dd className="mt-1 text-sm">{op.operationType.replace('_', ' ')}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">{t('personsAtRisk')}</dt>
                <dd className="mt-1 flex items-center gap-1 text-sm">
                  <Users className="h-3 w-3" /> {op.estimatedPersonsAtRisk ?? 0}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">{t('rescued')}</dt>
                <dd className="mt-1 text-sm">{op.personsRescued ?? 0}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">{t('teamSize')}</dt>
                <dd className="mt-1 flex items-center gap-1 text-sm">
                  <Users className="h-3 w-3" /> {op.teamSize ?? 0}
                </dd>
              </div>
              {targetCoords && (
                <div>
                  <dt className="text-muted-foreground text-sm">{t('targetLocation')}</dt>
                  <dd className="mt-1 flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3" />
                    {targetCoords[1].toFixed(4)}, {targetCoords[0].toFixed(4)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold">{t('timeline')}</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Clock className="h-3 w-3" /> {t('createdAt')}
                </dt>
                <dd className="mt-1 text-sm">{new Date(op.createdAt).toLocaleString()}</dd>
              </div>
              {op.dispatchedAt && (
                <div>
                  <dt className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3" /> {t('dispatchedAt')}
                  </dt>
                  <dd className="mt-1 text-sm">{new Date(op.dispatchedAt).toLocaleString()}</dd>
                </div>
              )}
              {op.arrivedAt && (
                <div>
                  <dt className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3" /> {t('arrivedAt')}
                  </dt>
                  <dd className="mt-1 text-sm">{new Date(op.arrivedAt).toLocaleString()}</dd>
                </div>
              )}
              {op.completedAt && (
                <div>
                  <dt className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3" /> {t('completedAt')}
                  </dt>
                  <dd className="mt-1 text-sm">{new Date(op.completedAt).toLocaleString()}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
