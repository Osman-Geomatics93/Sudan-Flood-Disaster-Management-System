import { z } from 'zod';

/**
 * GeoJSON Point: [longitude, latitude]
 * Longitude: -180 to 180
 * Latitude: -90 to 90
 */
export const coordinateSchema = z.tuple([
  z.number().min(-180).max(180), // longitude
  z.number().min(-90).max(90), // latitude
]);

export type Coordinate = z.infer<typeof coordinateSchema>;

/**
 * Bounding box: [west, south, east, north]
 */
export const bboxSchema = z.tuple([
  z.number().min(-180).max(180), // west
  z.number().min(-90).max(90), // south
  z.number().min(-180).max(180), // east
  z.number().min(-90).max(90), // north
]);

export type BBox = z.infer<typeof bboxSchema>;

/**
 * GeoJSON Polygon geometry schema
 */
export const geoJsonPolygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(coordinateSchema)).min(1),
});

export type GeoJsonPolygon = z.infer<typeof geoJsonPolygonSchema>;

/**
 * GeoJSON Point geometry schema
 */
export const geoJsonPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: coordinateSchema,
});

export type GeoJsonPoint = z.infer<typeof geoJsonPointSchema>;

/**
 * Sudan approximate bounding box (for validation)
 */
export const SUDAN_BBOX: BBox = [21.8, 8.7, 38.6, 23.15];

/**
 * Check if a coordinate is roughly within Sudan's borders
 */
export function isWithinSudan(coord: Coordinate): boolean {
  const [lng, lat] = coord;
  return lng >= SUDAN_BBOX[0] && lng <= SUDAN_BBOX[2] && lat >= SUDAN_BBOX[1] && lat <= SUDAN_BBOX[3];
}
