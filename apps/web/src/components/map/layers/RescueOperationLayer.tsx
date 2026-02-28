'use client';

import { Marker, Popup } from 'react-leaflet';
import { trpc } from '@/lib/trpc-client';
import L from 'leaflet';

const STATUS_COLORS: Record<string, string> = {
  pending: '#eab308',
  dispatched: '#3b82f6',
  en_route: '#8b5cf6',
  on_site: '#f97316',
  in_progress: '#ef4444',
  completed: '#22c55e',
};

function createIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

export default function RescueOperationLayer() {
  const rescueQuery = trpc.rescue.list.useQuery({ page: 1, limit: 100 });
  const operations = rescueQuery.data?.items ?? [];

  return (
    <>
      {operations.map((op) => {
        const loc = op.targetLocation as { type: string; coordinates: [number, number] } | null;
        if (!loc || !loc.coordinates) return null;
        const [lng, lat] = loc.coordinates;
        const color = STATUS_COLORS[op.status] || '#888';
        return (
          <Marker
            key={op.id}
            position={[lat, lng]}
            icon={createIcon(color)}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-medium">{op.operationCode}</p>
                <p className="capitalize">{op.status} · {op.operationType}</p>
                <p>{op.estimatedPersonsAtRisk} at risk</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
