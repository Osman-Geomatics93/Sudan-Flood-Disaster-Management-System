'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { Plus, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';
import type { TaskStatus, TaskPriority } from '@sudanflood/shared';
import { TASK_STATUSES, TASK_PRIORITIES } from '@sudanflood/shared';

type ViewMode = 'kanban' | 'list';

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

const KANBAN_COLUMNS = [
  { key: 'pending', statuses: ['draft', 'assigned', 'accepted'] },
  { key: 'inProgress', statuses: ['in_progress', 'blocked'] },
  { key: 'completed', statuses: ['completed', 'cancelled'] },
] as const;

export default function TasksPage() {
  const t = useTranslations('task');
  const tCommon = useTranslations('common');

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const listQuery = trpc.task.list.useQuery({
    page,
    limit: 100,
    ...(statusFilter && { status: statusFilter as TaskStatus }),
    ...(priorityFilter && { priority: priorityFilter as TaskPriority }),
  });

  const tasks = listQuery.data?.items ?? [];

  return (
    <div className="animate-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/tasks/create"
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {t('createTask')}
          </Link>
          <div className="flex rounded-md border">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm ${viewMode === 'kanban' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              <LayoutGrid className="h-4 w-4" />
              {t('kanbanView')}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              <List className="h-4 w-4" />
              {t('listView')}
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' && (
        <div className="mb-4 flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field"
          >
            <option value="">{t('allStatuses')}</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>{t(`status_${s}`)}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="input-field"
          >
            <option value="">{t('allPriorities')}</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>{t(`priority_${p}`)}</option>
            ))}
          </select>
        </div>
      )}

      {listQuery.isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {viewMode === 'kanban' && !listQuery.isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {KANBAN_COLUMNS.map((col) => {
            const columnTasks = tasks.filter((task) =>
              (col.statuses as readonly string[]).includes(task.status),
            );
            return (
              <div key={col.key} className="rounded-lg border bg-muted/30 p-3">
                <h2 className="font-heading mb-3 flex items-center justify-between text-sm font-semibold tracking-tight">
                  {t(col.key)}
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {columnTasks.length}
                  </span>
                </h2>
                <div className="space-y-2">
                  {columnTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/dashboard/tasks/${task.id}`}
                      className="block rounded-md border bg-card p-3 hover:shadow-sm transition-shadow"
                    >
                      <p className="text-xs font-mono text-muted-foreground">{task.taskCode}</p>
                      <p className="mt-1 text-sm font-medium">{task.title_en}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`badge ${PRIORITY_STYLES[task.priority] ?? ''}`}>
                          {t(`priority_${task.priority}`)}
                        </span>
                        <span className={`badge ${STATUS_STYLES[task.status] ?? ''}`}>
                          {t(`status_${task.status}`)}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {columnTasks.length === 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground">{tCommon('noData')}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'list' && listQuery.data && (
        <>
          {listQuery.data.items.length === 0 && (
            <div className="rounded-lg border py-12 text-center text-muted-foreground">
              {tCommon('noData')}
            </div>
          )}

          {listQuery.data.items.length > 0 && (
            <>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-start font-medium">{t('taskCode')}</th>
                      <th className="px-4 py-3 text-start font-medium">{t('titleLabel')}</th>
                      <th className="px-4 py-3 text-start font-medium">{t('status')}</th>
                      <th className="px-4 py-3 text-start font-medium">{t('priority')}</th>
                      <th className="px-4 py-3 text-start font-medium">{t('progress')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listQuery.data.items.map((task) => (
                      <tr key={task.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3 font-mono">
                          <Link href={`/dashboard/tasks/${task.id}`} className="text-primary dark:text-primary hover:underline">
                            {task.taskCode}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{task.title_en}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${STATUS_STYLES[task.status] ?? ''}`}>
                            {t(`status_${task.status}`)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${PRIORITY_STYLES[task.priority] ?? ''}`}>
                            {t(`priority_${task.priority}`)}
                          </span>
                        </td>
                        <td className="px-4 py-3">{task.progressPct ?? 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {listQuery.data.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t('page')} {listQuery.data.page} / {listQuery.data.totalPages} ({listQuery.data.total} {t('total')})
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="btn-secondary disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      disabled={page >= (listQuery.data?.totalPages ?? 1)}
                      onClick={() => setPage((p) => p + 1)}
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
    </div>
  );
}
