
import type { Scenario, GeoJsonData } from './types';

const generateMockGeoJson = (
  count: number,
  center: [number, number],
  bboxSize: number,
  highExposure: boolean = false
): GeoJsonData => {
  const features = [];
  for (let i = 0; i < count; i++) {
    const lat = center[0] + (Math.random() - 0.5) * bboxSize;
    const lng = center[1] + (Math.random() - 0.5) * bboxSize;
    const value = Math.floor(Math.random() * (10000000 - 500000)) + 500000;
    
    // eai can be 0 for some points, make high exposure scenarios have more impact
    const hasImpact = highExposure ? Math.random() > 0.1 : Math.random() > 0.4;
    const eai = hasImpact ? Math.floor(Math.random() * (value * 0.08)) : 0;

    features.push({
      type: 'Feature' as const,
      properties: { value, eai },
      geometry: {
        type: 'Point' as const,
        coordinates: [lng, lat],
      },
    });
  }
  return {
    type: 'FeatureCollection' as const,
    features,
  };
};

export const scenarios: Scenario[] = [
  {
    id: 'scenario1_irma',
    name: 'Furacão Irma (2017)',
    description: 'Caribe Oriental - 5 pontos de exposição',
    center: [20, -65],
    zoom: 5,
    data: generateMockGeoJson(5, [20, -65], 6)
  },
  {
    id: 'scenario2_matthew',
    name: 'Furacão Matthew (2016)',
    description: 'Haiti/Cuba - 10 pontos de exposição',
    center: [19, -74],
    zoom: 6,
    data: generateMockGeoJson(10, [19, -74], 5)
  },
  {
    id: 'scenario3_maria',
    name: 'Furacão Maria (2017)',
    description: 'Porto Rico - 8 pontos de alta exposição',
    center: [18.2, -66.5],
    zoom: 8,
    data: generateMockGeoJson(8, [18.2, -66.5], 2, true)
  }
];
