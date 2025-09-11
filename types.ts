
import type { FeatureCollection, Point } from 'geojson';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  center: [number, number];
  zoom: number;
  data: GeoJsonData;
}

export interface ScenarioProperties {
  value: number;
  eai: number; // Expected Annual Impact
}

export type GeoJsonData = FeatureCollection<Point, ScenarioProperties>;

export interface CustomAsset {
  id: number;
  name: string;
  lat: number;
  lon: number;
  value: number;
  riskType: string;
  altitude?: number;
}
