'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import LeafletMap from './LeafletMap';
import LayerToggle from './LayerToggle';
import RescueOperationLayer from './layers/RescueOperationLayer';
import EmergencyCallLayer from './layers/EmergencyCallLayer';
import FloodZoneLayer from './FloodZoneLayer';
import ShelterMarkerLayer from './ShelterMarkerLayer';

export default function CommandCenterMap() {
  const [layers, setLayers] = useState({
    floodZones: true,
    shelters: true,
    rescueOps: true,
    emergencyCalls: true,
  });
  const [bbox, setBbox] = useState<[number, number, number, number] | null>(null);

  const toggleLayer = (id: string, checked: boolean) => {
    setLayers((prev) => ({ ...prev, [id]: checked }));
  };

  const handleBoundsChange = (b: { north: number; south: number; east: number; west: number }) => {
    setBbox([b.west, b.south, b.east, b.north]);
  };

  const floodZoneQuery = trpc.floodZone.getByBounds.useQuery(
    { bbox: bbox! },
    { enabled: layers.floodZones && bbox !== null },
  );

  const shelterQuery = trpc.shelter.list.useQuery(
    { page: 1, limit: 200 },
    { enabled: layers.shelters },
  );

  const shelterData = (shelterQuery.data?.items ?? []) as {
    id: string;
    shelterCode: string;
    name_en: string;
    name_ar?: string | null;
    status: string;
    capacity: number;
    currentOccupancy: number;
    location: { type: 'Point'; coordinates: [number, number] } | null;
  }[];

  const layerConfig = [
    { id: 'floodZones', label: 'Flood Zones', checked: layers.floodZones },
    { id: 'shelters', label: 'Shelters', checked: layers.shelters },
    { id: 'rescueOps', label: 'Rescue Operations', checked: layers.rescueOps },
    { id: 'emergencyCalls', label: 'Emergency Calls', checked: layers.emergencyCalls },
  ];

  return (
    <div className="relative h-full w-full">
      <LeafletMap className="h-full w-full" onBoundsChange={handleBoundsChange}>
        {layers.floodZones && <FloodZoneLayer data={floodZoneQuery.data ?? null} />}
        {layers.shelters && <ShelterMarkerLayer shelters={shelterData} />}
        {layers.rescueOps && <RescueOperationLayer />}
        {layers.emergencyCalls && <EmergencyCallLayer />}
      </LeafletMap>
      <LayerToggle layers={layerConfig} onChange={toggleLayer} />
    </div>
  );
}
