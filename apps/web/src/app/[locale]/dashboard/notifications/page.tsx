'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ChevronLeft, ChevronRight, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const t = useTranslations('notification');
  const router = useRouter();
  const utils = trpc.useUtils();

  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const listQuery = trpc.notification.list.useQuery({
    page,
    limit: 20,
    unreadOnly: unreadOnly || undefined,
  });

  const markReadMutation = trpc.notification.markRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
    },
  });

  const markAllReadMutation = trpc.notification.markAllRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
    },
  });

  const handleNotificationClick = (notification: {
    id: string;
    isRead: boolean;
    referenceType: string | null;
    referenceId: string | null;
  }) => {
    if (!notification.isRead) {
      markReadMutation.mutate({ id: notification.id });
    }
    if (notification.referenceType && notification.referenceId) {
      const typeRouteMap: Record<string, string> = {
        task: '/dashboard/tasks',
        relief_supply: '/dashboard/supplies',
      };
      const basePath = typeRouteMap[notification.referenceType];
      if (basePath) {
        router.push(`${basePath}/${notification.referenceId}`);
      }
    }
  };

  return (
    <div className="animate-in mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <div className="flex items-center gap-3">
          <div className="flex rounded-md border">
            <button
              onClick={() => { setUnreadOnly(false); setPage(1); }}
              className={`px-3 py-1.5 text-sm ${!unreadOnly ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              {t('all')}
            </button>
            <button
              onClick={() => { setUnreadOnly(true); setPage(1); }}
              className={`px-3 py-1.5 text-sm ${unreadOnly ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              {t('unread')}
            </button>
          </div>
          <button
            onClick={() => markAllReadMutation.mutate({})}
            disabled={markAllReadMutation.isPending}
            className="btn-secondary flex items-center gap-1.5"
          >
            <CheckCheck className="h-4 w-4" />
            {t('markAllRead')}
          </button>
        </div>
      </div>

      {listQuery.isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {listQuery.data && listQuery.data.items.length === 0 && (
        <div className="rounded-lg border py-12 text-center text-muted-foreground">
          {t('noNotifications')}
        </div>
      )}

      {listQuery.data && listQuery.data.items.length > 0 && (
        <>
          <div className="space-y-2">
            {listQuery.data.items.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full rounded-lg border p-4 text-start transition-colors hover:bg-accent ${
                  notification.isRead ? 'opacity-60' : 'border-primary/30 bg-primary/5'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className={`text-sm ${notification.isRead ? '' : 'font-medium'}`}>
                      {notification.title_en}
                    </p>
                    {notification.body_en && (
                      <p className="mt-1 text-xs text-muted-foreground">{notification.body_en}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
              </button>
            ))}
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
                  className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={page >= (listQuery.data?.totalPages ?? 1)}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
