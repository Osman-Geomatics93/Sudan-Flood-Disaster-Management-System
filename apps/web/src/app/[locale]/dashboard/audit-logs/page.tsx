'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc-client';

const AUDIT_ACTIONS = ['INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'DISPATCH', 'STATUS_CHANGE'] as const;

export default function AuditLogsPage() {
  const t = useTranslations('auditLog');
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<string>('');
  const [tableName, setTableName] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const logsQuery = trpc.auditLog.list.useQuery({
    page,
    limit: 20,
    action: action ? (action as typeof AUDIT_ACTIONS[number]) : undefined,
    tableName: tableName || undefined,
  });

  const logs = logsQuery.data;

  return (
    <div className="animate-in">
      <h1 className="font-heading text-2xl font-semibold tracking-tight mb-6">{t('title')}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={action}
          onChange={(e) => { setAction(e.target.value); setPage(1); }}
          className="rounded-md border bg-card px-3 py-2 text-sm"
        >
          <option value="">{t('allActions')}</option>
          {AUDIT_ACTIONS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder={t('filterByTable')}
          value={tableName}
          onChange={(e) => { setTableName(e.target.value); setPage(1); }}
          className="rounded-md border bg-card px-3 py-2 text-sm"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
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
                    className="border-b hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{log.userEmail || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{log.tableName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {log.recordId?.slice(0, 8) || '—'}
                    </td>
                  </tr>
                  {expandedId === log.id && (
                    <tr key={`${log.id}-expanded`} className="border-b bg-muted/20">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-2">{t('oldValues')}</h4>
                            <pre className="text-xs bg-card rounded-md p-3 overflow-auto max-h-48">
                              {log.oldValues ? JSON.stringify(log.oldValues, null, 2) : t('noChanges')}
                            </pre>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-2">{t('newValues')}</h4>
                            <pre className="text-xs bg-card rounded-md p-3 overflow-auto max-h-48">
                              {log.newValues ? JSON.stringify(log.newValues, null, 2) : t('noChanges')}
                            </pre>
                          </div>
                        </div>
                        {log.ipAddress && (
                          <p className="mt-2 text-xs text-muted-foreground">
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
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-muted-foreground">
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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {logs?.items.length === 0 && !logsQuery.isLoading && (
        <div className="text-center py-12 text-muted-foreground">{t('noChanges')}</div>
      )}
    </div>
  );
}
