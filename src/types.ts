export type AppScreen = 'landing' | 'upload' | 'processing' | 'world';

export type CameraMode = 'avatar' | 'fly' | 'orbit';

export type RiskLevel = 'SAFE' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface BuildingData {
  id: string;
  name: string;
  estimatedHeight: number; // in meters
  groundElevation: number; // in meters
  position: [number, number, number]; // [x, y, z] in Three.js coordinates
  dimensions: [number, number, number]; // [width, height, depth]
  type: 'cottage' | 'townhouse' | 'market' | 'citadel' | 'tower' | 'watchtower' | 'bridge';
  roofColor: string;
  isShelter?: boolean;
  damageLevel: number; // 0 to 1 (visual breakage/displacement)
  isSubmerged: boolean;
  currentRisk: RiskLevel;
}

export interface SimulationState {
  waterLevel: number; // 0m to 20m
  isFloodActive: boolean;
  wavePhase: 'idle' | 'approaching' | 'cresting' | 'receding';
  waveProgress: number; // 0 to 1
  waveZ: number;
  soundEnabled: boolean;
  evacuationMode: boolean;
  heightMapMode: boolean;
  showHeights: boolean;
  compareMode: boolean;
  cameraMode: CameraMode;
  selectedBuilding: BuildingData | null;
  showResults: boolean;
}

export interface SampleWorld {
  id: string;
  name: string;
  subtitle: string;
  thumbnail: string;
  type: 'satellite_rgb' | 'geotiff';
  description: string;
  estimatedStructuresCount: number;
  maxElevationMeters: number;
  highShelterHeight: number;
}
