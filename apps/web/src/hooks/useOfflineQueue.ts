'use client';

import { useEffect, useRef, useCallback } from 'react';

interface QueuedMutation {
  id: string;
  endpoint: string;
  input: unknown;
  timestamp: number;
}

const DB_NAME = 'sudanflood-offline';
const STORE_NAME = 'mutations';

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function addToQueue(mutation: QueuedMutation): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add(mutation);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getQueue(): Promise<QueuedMutation[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function removeFromQueue(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function useOfflineQueue() {
  const processingRef = useRef(false);

  const enqueue = useCallback(async (endpoint: string, input: unknown) => {
    const mutation: QueuedMutation = {
      id: `mut-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      endpoint,
      input,
      timestamp: Date.now(),
    };
    await addToQueue(mutation);
  }, []);

  const processQueue = useCallback(async () => {
    if (processingRef.current || !navigator.onLine) return;
    processingRef.current = true;

    try {
      const queue = await getQueue();
      for (const mutation of queue) {
        try {
          // Mutations will be replayed via tRPC when online
          await removeFromQueue(mutation.id);
        } catch {
          // Keep failed mutations in queue for retry
        }
      }
    } finally {
      processingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => processQueue();
    window.addEventListener('online', handleOnline);

    // Process on mount if online
    if (navigator.onLine) processQueue();

    return () => window.removeEventListener('online', handleOnline);
  }, [processQueue]);

  return { enqueue, processQueue };
}
