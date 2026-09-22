import { SampleWorld, BuildingData } from '../types';

export const SAMPLE_WORLDS: SampleWorld[] = [
  {
    id: 'bengal_estuary',
    name: 'Cartosat-3 Coastal Estuary',
    subtitle: 'Bay of Bengal Lowland Zone',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    type: 'satellite_rgb',
    description: 'High-resolution 0.28m GSD single-RGB remote sensing capture of low-lying coastal village with adjacent hill fortress.',
    estimatedStructuresCount: 14,
    maxElevationMeters: 22.4,
    highShelterHeight: 28.5
  },
  {
    id: 'river_delta',
    name: 'Brahmaputra Flood Basin',
    subtitle: 'Riverine Plain with High Ridge',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    type: 'geotiff',
    description: 'Georeferenced multi-band imagery showing river confluence vulnerable to flash flood surge and elevated refuge hill.',
    estimatedStructuresCount: 18,
    maxElevationMeters: 26.0,
    highShelterHeight: 31.2
  },
  {
    id: 'konkan_cove',
    name: 'Konkan Coast Harbor Town',
    subtitle: 'Rocky Headland & Shore Settlement',
    thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    type: 'satellite_rgb',
    description: 'Coastal hamlet flanked by tidal inlet and steep basalt plateau shelter location.',
    estimatedStructuresCount: 12,
    maxElevationMeters: 24.8,
    highShelterHeight: 29.0
  }
];

export const INITIAL_BUILDINGS: BuildingData[] = [
  // Low elevation coastal cottages (HIGH RISK during flood)
  {
    id: 'BLD-01',
    name: 'Fisherman Cottage #01',
    estimatedHeight: 6.2,
    groundElevation: 1.8,
    position: [-22, 1.8, -12],
    dimensions: [5, 4.2, 5],
    type: 'cottage',
    roofColor: '#b91c1c',
    damageLevel: 0,
    isSubmerged: false,
    currentRisk: 'HIGH'
  },
  {
    id: 'BLD-02',
    name: 'Harbor Storehouse #02',
    estimatedHeight: 7.8,
    groundElevation: 2.2,
    position: [-14, 2.2, -18],
    dimensions: [6.5, 5, 6],
    type: 'townhouse',
    roofColor: '#c2410c',
    damageLevel: 0,
    isSubmerged: false,
    currentRisk: 'HIGH'
  },
  {
    id: 'BLD-03',
    name: 'Canal House #03',
    estimatedHeight: 5.8,
    groundElevation: 1.5,
    position: [-26, 1.5, -4],
    dimensions: [4.5, 3.8, 5],
    type: 'cottage',
    roofColor: '#b91c1c',
    damageLevel: 0,
    isSubmerged: false,
    currentRisk: 'HIGH'
  },
  {
    id: 'BLD-04',
    name: 'Coast Tavern #04',
    estimatedHeight: 8.5,
    groundElevation: 2.8,
    position: [-10, 2.8, -6],
    dimensions: [7, 6, 6.5],
    type: 'market',
    roofColor: '#991b1b',
    damageLevel: 0,
    isSubmerged: false,
    currentRisk: 'HIGH'
  },
  {
    id: 'BLD-05',
    name: 'Lowland Workshop #05',
    estimatedHeight: 6.9,
    groundElevation: 3.1,
    position: [-18, 3.1, 4],
    dimensions: [5.5, 4.5, 5],
    type: 'cottage',
    roofColor: '#b45309',
    damageLevel: 0,
    isSubmerged: false,
    currentRisk: 'HIGH'
  },
  {
    id: 'BLD-06',
    name: 'Wharf Outpost #06',
    estimatedHeight: 9.4,
    groundElevation: 2.5,
    position: [-30, 2.5, -20],
    dimensions: [6, 7, 6],
    type: 'watchtower',
    roofColor: '#4338ca',
    damageLevel: 0,
    isSubmerged: false,
    currentRisk: 'HIGH'
  },

  // Mid-Elevation village center (MODERATE RISK)
  {
    id: 'BLD-07',
    name: 'Town Square Guild #07',
    estimatedHeight: 12.4,
    groundElevation: 6.5,
    position: [-2, 6.5, 2],
    dimensions: [8, 8, 8],
    type: 'townhouse',
    roofColor: '#1d4ed8',
    damageLevel: 0,
    isSubmerged: false,
    currentRisk: 'MODERATE'
  },
  {
    id: 'BLD-08',
    name: 'Bakery & Residence #08',
    estimatedHeight: 9.8,
    groundElevation: 7.2,
    position: [6, 7.2, -8],
    dimensions: [6, 6.5, 6],
    type: 'townhouse',
    roofColor: '#1e40af',
    damageLevel: 0,
    isSubmerged: false,
    currentRisk: 'MODERATE'
  },
  {
    id: 'BLD-09',
    name: 'Market Bell Tower #09',
    estimatedHeight: 16.5,
    groundElevation: 8.0,
    position: [2, 8.0, 10],
    dimensions: [5, 12, 5],
    type: 'tower',
    roofColor: '#3730a3',
    damageLevel: 0,
    isSubmerged: false,
    currentRisk: 'MODERATE'
  },
  {
    id: 'BLD-10',
    name: 'Merchant Manor #10',
    estimatedHeight: 11.2,
    groundElevation: 8.8,
    position: [12, 8.8, 4],
    dimensions: [8, 7.5, 7],
    type: 'townhouse',
    roofColor: '#1e3a8a',
    damageLevel: 0,
    isSubmerged: false,
    currentRisk: 'MODERATE'
  },

  // HIGH GROUND PLATEAU - SAFE CITADEL & EMERGENCY SHELTER
  {
    id: 'BLD-CITADEL',
    name: 'High Citadel (Emergency Shelter)',
    estimatedHeight: 28.0,
    groundElevation: 18.2,
    position: [24, 18.2, -4],
    dimensions: [14, 18, 14],
    type: 'citadel',
    roofColor: '#047857',
    isShelter: true,
    damageLevel: 0,
    isSubmerged: false,
    currentRisk: 'SAFE'
  },
  {
    id: 'BLD-SANCTUARY',
    name: 'Fortress Watchtower #12',
    estimatedHeight: 22.0,
    groundElevation: 17.5,
    position: [32, 17.5, -16],
    dimensions: [6, 15, 6],
    type: 'tower',
    roofColor: '#065f46',
    isShelter: true,
    damageLevel: 0,
    isSubmerged: false,
    currentRisk: 'SAFE'
  },
  {
    id: 'BLD-STORAGE',
    name: 'High Relief Depot #13',
    estimatedHeight: 10.5,
    groundElevation: 18.0,
    position: [18, 18.0, 12],
    dimensions: [7, 7, 7],
    type: 'townhouse',
    roofColor: '#059669',
    isShelter: true,
    damageLevel: 0,
    isSubmerged: false,
    currentRisk: 'SAFE'
  }
];

// Evacuation Waypoints (from coastal village up the switchback road to the High Citadel)
export const EVACUATION_PATH_POINTS: [number, number, number][] = [
  [-22, 2.0, -10],
  [-16, 2.8, -5],
  [-10, 3.5, 0],
  [-2, 6.8, 2],
  [6, 8.5, 4],
  [12, 11.5, 2],
  [16, 14.5, -2],
  [20, 17.5, -4],
  [24, 18.5, -4] // Reaches High Citadel
];
