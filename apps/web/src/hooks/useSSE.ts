'use client';

import { useEffect, useRef, useCallback } from 'react';
import { trpc } from '@/lib/trpc-client';

interface SSEEvent {
  type: string;
  timestamp: number;
  [key: string]: unknown;
}

export function useSSE() {
  const utils = trpc.useUtils();
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleEvent = useCallback((event: SSEEvent) => {
    // Invalidate relevant caches based on event type
    switch (event.type) {
      case 'emergency_call.created':
        utils.emergencyCall.list.invalidate();
        utils.emergencyCall.stats.invalidate();
        break;
      case 'rescue.status_changed':
        utils.rescue.list.invalidate();
        utils.rescue.stats.invalidate();
        break;
      case 'shelter.capacity_changed':
        utils.shelter.list.invalidate();
        utils.shelter.stats.invalidate();
        break;
      case 'weather_alert.created':
        utils.weatherAlert.list.invalidate();
        utils.weatherAlert.active.invalidate();
        utils.weatherAlert.stats.invalidate();
        break;
      case 'notification.created':
        utils.notification.unreadCount.invalidate();
        break;
      default:
        break;
    }
  }, [utils]);

  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        es = new EventSource('/api/sse');
        eventSourceRef.current = es;

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as SSEEvent;
            handleEvent(data);
          } catch {
            // Ignore parse errors (pings, etc.)
          }
        };

        es.onerror = () => {
          es?.close();
          // Reconnect after 5 seconds
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch {
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      es?.close();
      eventSourceRef.current = null;
    };
  }, [handleEvent]);
}
