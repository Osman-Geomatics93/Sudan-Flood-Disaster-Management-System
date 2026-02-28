'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Bell } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success';
}

const toastQueue: Toast[] = [];
let toastListeners: ((toasts: Toast[]) => void)[] = [];

export function showEventToast(message: string, type: Toast['type'] = 'info') {
  const toast: Toast = { id: `toast-${Date.now()}`, message, type };
  toastQueue.push(toast);
  toastListeners.forEach((fn) => fn([...toastQueue]));
  setTimeout(() => {
    const idx = toastQueue.findIndex((t) => t.id === toast.id);
    if (idx >= 0) toastQueue.splice(idx, 1);
    toastListeners.forEach((fn) => fn([...toastQueue]));
  }, 5000);
}

export default function EventToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (t: Toast[]) => setToasts(t);
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    const idx = toastQueue.findIndex((t) => t.id === id);
    if (idx >= 0) toastQueue.splice(idx, 1);
    setToasts([...toastQueue]);
  }, []);

  if (toasts.length === 0) return null;

  const TYPE_STYLES: Record<string, string> = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/50 dark:border-yellow-800 dark:text-yellow-200',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/50 dark:border-green-800 dark:text-green-200',
  };

  return (
    <div className="fixed bottom-4 end-4 z-[9999] space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-lg border p-3 shadow-lg animate-in ${TYPE_STYLES[toast.type] || TYPE_STYLES.info}`}
        >
          <Bell className="h-4 w-4 shrink-0" />
          <p className="flex-1 text-sm">{toast.message}</p>
          <button onClick={() => dismiss(toast.id)} className="shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
