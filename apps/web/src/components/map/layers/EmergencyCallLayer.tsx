'use client';

import { Marker, Popup } from 'react-leaflet';
import { trpc } from '@/lib/trpc-client';
import L from 'leaflet';

const URGENCY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  life_threatening: '#ef4444',
};

function createCallIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:10px;height:10px;border-radius:2px;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);transform:rotate(45deg)"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

export default function EmergencyCallLayer() {
  const callsQuery = trpc.emergencyCall.list.useQuery({ page: 1, limit: 100 });
  const calls = callsQuery.data?.items ?? [];

  return (
    <>
      {calls.map((call) => {
        const loc = call.callerLocation as { type: string; coordinates: [number, number] } | null;
        if (!loc || !loc.coordinates) return null;
        const [lng, lat] = loc.coordinates;
        const color = URGENCY_COLORS[call.urgency] || '#888';
        return (
          <Marker
            key={call.id}
            position={[lat, lng]}
            icon={createCallIcon(color)}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-medium">{call.callCode}</p>
                <p className="capitalize">{call.urgency} · {call.status}</p>
                <p>{call.callerName}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
