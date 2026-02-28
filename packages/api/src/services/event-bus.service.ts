/**
 * Simple in-memory event bus for SSE.
 * Events are stored in a circular buffer and clients poll for new events.
 */

export interface AppEvent {
  id: string;
  channel: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

const MAX_EVENTS = 1000;
const events: AppEvent[] = [];
let eventCounter = 0;

export function publishEvent(channel: string, type: string, payload: Record<string, unknown> = {}) {
  const event: AppEvent = {
    id: `evt-${++eventCounter}`,
    channel,
    type,
    payload,
    timestamp: Date.now(),
  };
  events.push(event);
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }
  return event;
}

export function getEventsSince(sinceTimestamp: number): AppEvent[] {
  return events.filter((e) => e.timestamp > sinceTimestamp);
}

export function getLatestEvents(count = 10): AppEvent[] {
  return events.slice(-count);
}
