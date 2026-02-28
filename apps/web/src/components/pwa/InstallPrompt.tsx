'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="bg-card animate-in fixed bottom-4 start-4 z-[9998] max-w-sm rounded-lg border p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <Download className="text-primary mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Install SudanFlood</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Install this app for offline access and faster loading
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleInstall}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-xs"
            >
              Install
            </button>
            <button onClick={() => setDismissed(true)} className="btn-ghost px-3 py-1.5 text-xs">
              Not now
            </button>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="shrink-0">
          <X className="text-muted-foreground h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
