'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const SUDAN_CENTER: [number, number] = [15.5, 32.5];
const DEFAULT_ZOOM = 6;

interface BoundsChangeEvent {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface LeafletMapInnerProps {
  center?: [number, number];
  zoom?: number;
  onBoundsChange?: (bounds: BoundsChangeEvent) => void;
  children?: React.ReactNode;
  className?: string;
  mapRef?: React.MutableRefObject<LeafletMap | null>;
}

function BoundsTracker({
  onBoundsChange,
}: {
  onBoundsChange: (bounds: BoundsChangeEvent) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },
  });

  // Fire initial bounds on mount so queries that depend on bbox are enabled immediately
  useEffect(() => {
    const bounds = map.getBounds();
    onBoundsChange({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    });
  }, []);

  return null;
}

function MapRefSetter({ mapRef }: { mapRef: React.MutableRefObject<LeafletMap | null> }) {
  const map = useMapEvents({
    load: () => {
      /* noop */
    },
  });
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}

export default function LeafletMapComponent({
  center = SUDAN_CENTER,
  zoom = DEFAULT_ZOOM,
  onBoundsChange,
  children,
  className = 'h-[500px] w-full',
  mapRef,
}: LeafletMapInnerProps) {
  const uniqueId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // Wait until the container DOM node is mounted before rendering MapContainer.
  // This prevents the "appendChild" error caused by React 18 Strict Mode
  // double-invoking effects on a not-yet-attached DOM node.
  useEffect(() => {
    if (containerRef.current) {
      setReady(true);
    }
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {ready && (
        <MapContainer
          key={uniqueId}
          center={center}
          zoom={zoom}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {onBoundsChange && <BoundsTracker onBoundsChange={onBoundsChange} />}
          {mapRef && <MapRefSetter mapRef={mapRef} />}
          {children}
        </MapContainer>
      )}
    </div>
  );
}
