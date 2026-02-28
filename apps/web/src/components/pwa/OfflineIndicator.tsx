'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showSyncing, setShowSyncing] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowSyncing(true);
      setTimeout(() => setShowSyncing(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowSyncing(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showSyncing) return null;

  return (
    <div
      className={`fixed top-0 inset-x-0 z-[9999] flex items-center justify-center gap-2 py-1.5 text-xs font-medium ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-yellow-500 text-yellow-950'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="h-3.5 w-3.5" />
          Back online — syncing...
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          You are offline
        </>
      )}
    </div>
  );
}
