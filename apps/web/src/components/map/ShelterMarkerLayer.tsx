'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const shelterIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface ShelterData {
  id: string;
  shelterCode: string;
  name_en: string;
  name_ar?: string | null;
  status: string;
  capacity: number;
  currentOccupancy: number;
  location: { type: 'Point'; coordinates: [number, number] } | null;
}

interface ShelterMarkerLayerProps {
  shelters: ShelterData[];
  onShelterClick?: (id: string) => void;
}

export default function ShelterMarkerLayer({ shelters, onShelterClick }: ShelterMarkerLayerProps) {
  return (
    <>
      {shelters.map((shelter) => {
        if (!shelter.location) return null;
        const [lng, lat] = shelter.location.coordinates;
        return (
          <Marker
            key={shelter.id}
            position={[lat, lng]}
            icon={shelterIcon}
            eventHandlers={{
              click: () => onShelterClick?.(shelter.id),
            }}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <strong>{shelter.name_en}</strong>
                <br />
                Status: {shelter.status.replace('_', ' ')}
                <br />
                Capacity: {shelter.currentOccupancy}/{shelter.capacity}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
