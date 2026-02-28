'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc-client';

const AUDIT_ACTIONS = [
  'INSERT',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'EXPORT',
  'DISPATCH',
  'STATUS_CHANGE',
] as const;

export default function AuditLogsPage() {
  const t = useTranslations('auditLog');
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<string>('');
  const [tableName, setTableName] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const logsQuery = trpc.auditLog.list.useQuery({
    page,
    limit: 20,
    action: action ? (action as (typeof AUDIT_ACTIONS)[number]) : undefined,
    tableName: tableName || undefined,
  });

  const logs = logsQuery.data;

  return (
    <div className="animate-in">
      <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight">{t('title')}</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className="bg-card rounded-md border px-3 py-2 text-sm"
        >
          <option value="">{t('allActions')}</option>
          {AUDIT_ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder={t('filterByTable')}
          value={tableName}
          onChange={(e) => {
            setTableName(e.target.value);
            setPage(1);
          }}
          className="bg-card rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="px-4 py-3 text-start font-medium">{t('timestamp')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('user')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('action')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('tableName')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('recordId')}</th>
              </tr>
            </thead>
            <tbody>
              {logs?.items.map((log) => (
                <>
                  <tr
                    key={log.id}
                    className="hover:bg-accent/50 cursor-pointer border-b transition-colors"
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    <td className="text-muted-foreground px-4 py-3">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{log.userEmail || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="bg-primary/10 text-primary inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{log.tableName}</td>
                    <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                      {log.recordId?.slice(0, 8) || '—'}
                    </td>
                  </tr>
                  {expandedId === log.id && (
                    <tr key={`${log.id}-expanded`} className="bg-muted/20 border-b">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="text-muted-foreground mb-2 text-xs font-medium">
                              {t('oldValues')}
                            </h4>
                            <pre className="bg-card max-h-48 overflow-auto rounded-md p-3 text-xs">
                              {log.oldValues
                                ? JSON.stringify(log.oldValues, null, 2)
                                : t('noChanges')}
                            </pre>
                          </div>
                          <div>
                            <h4 className="text-muted-foreground mb-2 text-xs font-medium">
                              {t('newValues')}
                            </h4>
                            <pre className="bg-card max-h-48 overflow-auto rounded-md p-3 text-xs">
                              {log.newValues
                                ? JSON.stringify(log.newValues, null, 2)
                                : t('noChanges')}
                            </pre>
                          </div>
                        </div>
                        {log.ipAddress && (
                          <p className="text-muted-foreground mt-2 text-xs">
                            {t('ipAddress')}: {log.ipAddress}
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {logs && logs.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <span className="text-muted-foreground text-sm">
              {t('page')} {logs.page} / {logs.totalPages} ({logs.total} {t('total')})
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-50"
              >
                ←
              </button>
              <button
                onClick={() => setPage((p) => Math.min(logs.totalPages, p + 1))}
                disabled={page === logs.totalPages}
                className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-50"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {logsQuery.isLoading && (
        <div className="flex justify-center py-12">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      )}

      {logs?.items.length === 0 && !logsQuery.isLoading && (
        <div className="text-muted-foreground py-12 text-center">{t('noChanges')}</div>
      )}
    </div>
  );
}
