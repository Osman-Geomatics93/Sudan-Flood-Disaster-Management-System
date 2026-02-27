'use client';

import { GeoJSON } from 'react-leaflet';
import type { GeoJsonObject, Feature } from 'geojson';
import type { PathOptions, Layer } from 'leaflet';

const SEVERITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  moderate: '#eab308',
  high: '#f97316',
  severe: '#ef4444',
  extreme: '#7f1d1d',
};

interface FloodZoneLayerProps {
  data: {
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      id?: string;
      properties: {
        id: string;
        zoneCode: string;
        name_en: string;
        name_ar?: string | null;
        severity: string;
        status: string;
        affectedPopulation?: number | null;
        waterLevel_m?: string | null;
        waterLevelTrend?: string | null;
      };
      geometry: unknown;
    }>;
  } | null;
  onZoneClick?: (id: string) => void;
}

export default function FloodZoneLayer({ data, onZoneClick }: FloodZoneLayerProps) {
  if (!data || !data.features || data.features.length === 0) return null;

  const style = (feature: Feature | undefined): PathOptions => {
    const severity = feature?.properties?.severity ?? 'moderate';
    return {
      fillColor: SEVERITY_COLORS[severity] ?? '#eab308',
      weight: 2,
      opacity: 0.8,
      color: SEVERITY_COLORS[severity] ?? '#eab308',
      fillOpacity: 0.35,
    };
  };

  const onEachFeature = (feature: Feature, layer: Layer) => {
    const props = feature.properties;
    if (!props) return;

    const popupContent = `
      <div style="min-width:180px">
        <strong>${props.name_en || props.zoneCode}</strong>
        <br/><span style="text-transform:capitalize">Severity: ${props.severity}</span>
        <br/>Status: ${props.status?.replace('_', ' ')}
        ${props.affectedPopulation ? `<br/>Affected: ${props.affectedPopulation.toLocaleString()}` : ''}
        ${props.waterLevel_m ? `<br/>Water Level: ${props.waterLevel_m}m (${props.waterLevelTrend ?? ''})` : ''}
      </div>
    `;
    layer.bindPopup(popupContent);

    if (onZoneClick) {
      layer.on('click', () => onZoneClick(props.id));
    }
  };

  return (
    <GeoJSON
      key={JSON.stringify(data.features.map((f) => f.id ?? f.properties?.id))}
      data={data as unknown as GeoJsonObject}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}
