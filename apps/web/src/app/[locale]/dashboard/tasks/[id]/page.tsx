'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft, Pencil, Send } from 'lucide-react';
import { TASK_STATUSES } from '@sudanflood/shared';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  accepted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  blocked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations('task');
  const tCommon = useTranslations('common');
  const utils = trpc.useUtils();

  const [newComment, setNewComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const taskQuery = trpc.task.getById.useQuery({ id });
  const commentsQuery = trpc.task.getComments.useQuery({ id });

  const updateStatusMutation = trpc.task.updateStatus.useMutation({
    onSuccess: () => {
      utils.task.getById.invalidate({ id });
      setSelectedStatus('');
    },
  });

  const addCommentMutation = trpc.task.addComment.useMutation({
    onSuccess: () => {
      utils.task.getComments.invalidate({ id });
      setNewComment('');
    },
  });

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

  const task = taskQuery.data;

  const handleStatusUpdate = () => {
    if (!selectedStatus) return;
    updateStatusMutation.mutate({
      id,
      status: selectedStatus as (typeof TASK_STATUSES)[number],
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addCommentMutation.mutate({ taskId: id, body: newComment.trim() });
  };

  return (
    <div className="animate-in mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/tasks" className="btn-secondary rounded-md p-1">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('details')}</h1>
            <p className="text-muted-foreground font-mono text-sm">{task.taskCode}</p>
          </div>
        </div>
        <Link
          href={`/dashboard/tasks/${id}/edit`}
          className="btn-secondary flex items-center gap-1.5"
        >
          <Pencil className="h-4 w-4" />
          {tCommon('edit')}
        </Link>
      </div>

      {/* Status & Priority */}
      <div className="mb-6 flex gap-2">
        <span className={`badge ${STATUS_STYLES[task.status] ?? ''}`}>
          {t(`status_${task.status}`)}
        </span>
        <span className={`badge ${PRIORITY_STYLES[task.priority] ?? ''}`}>
          {t(`priority_${task.priority}`)}
        </span>
      </div>

      {/* Task Info */}
      <div className="card mb-6">
        <h2 className="font-heading text-lg font-semibold tracking-tight">{task.title_en}</h2>
        {task.title_ar && (
          <p className="text-muted-foreground text-sm" dir="rtl">
            {task.title_ar}
          </p>
        )}
        {task.description && <p className="mt-3 text-sm">{task.description}</p>}

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-xs">{t('progress')}</p>
            <div className="mt-1 flex items-center gap-2">
              <div className="bg-muted h-2 flex-1 rounded-full">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${task.progressPct ?? 0}%` }}
                />
              </div>
              <span className="text-sm font-medium">{task.progressPct ?? 0}%</span>
            </div>
          </div>
          {task.deadline && (
            <div>
              <p className="text-muted-foreground text-xs">{t('deadline')}</p>
              <p className="text-sm">{new Date(task.deadline).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="card mb-6">
        <h2 className="font-heading mb-3 text-lg font-semibold tracking-tight">{t('timeline')}</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('createdAt')}</span>
            <span>{task.createdAt ? new Date(task.createdAt).toLocaleString() : '-'}</span>
          </div>
          {task.startedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('startedAt')}</span>
              <span>{new Date(task.startedAt).toLocaleString()}</span>
            </div>
          )}
          {task.completedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('completedAt')}</span>
              <span>{new Date(task.completedAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Dependencies */}
      {task.dependencies && task.dependencies.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-heading mb-3 text-lg font-semibold tracking-tight">
            {t('dependencies')}
          </h2>
          <ul className="space-y-1">
            {task.dependencies.map((dep) => (
              <li key={dep.id} className="text-sm">
                <Link
                  href={`/dashboard/tasks/${dep.dependsOnTaskId}`}
                  className="text-primary dark:text-primary hover:underline"
                >
                  {dep.dependsOnTaskId}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Status Update */}
      {task.status !== 'completed' && task.status !== 'cancelled' && (
        <div className="card mb-6">
          <h2 className="font-heading mb-3 text-lg font-semibold tracking-tight">
            {t('updateStatus')}
          </h2>
          <div className="flex gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field flex-1"
            >
              <option value="">{t('allStatuses')}</option>
              {TASK_STATUSES.filter((s) => s !== task.status).map((s) => (
                <option key={s} value={s}>
                  {t(`status_${s}`)}
                </option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={!selectedStatus || updateStatusMutation.isPending}
              className="btn-primary disabled:opacity-50"
            >
              {t('updateStatus')}
            </button>
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="card">
        <h2 className="font-heading mb-3 text-lg font-semibold tracking-tight">{t('comments')}</h2>

        <div className="mb-4 space-y-3">
          {commentsQuery.data?.map((comment) => (
            <div key={comment.id} className="rounded-md border p-3">
              <p className="text-sm">{comment.body}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
              </p>
            </div>
          ))}
          {commentsQuery.data?.length === 0 && (
            <p className="text-muted-foreground py-2 text-sm">{tCommon('noData')}</p>
          )}
        </div>

        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('commentPlaceholder')}
            className="input-field flex-1"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || addCommentMutation.isPending}
            className="btn-primary flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {addCommentMutation.isPending ? t('posting') : t('addComment')}
          </button>
        </form>
      </div>
    </div>
  );
}
