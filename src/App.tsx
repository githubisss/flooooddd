import React, { useState } from 'react';
import { AppScreen, BuildingData, CameraMode, SampleWorld, SimulationState } from './types';
import { INITIAL_BUILDINGS } from './data/worldData';
import { SAMPLE_WORLDS } from './data/sampleImages';
import { LandingPage } from './components/LandingPage';
import { UploadModal } from './components/UploadModal';
import { ProcessingScreen } from './components/ProcessingScreen';
import { ThreeCanvas } from './components/ThreeCanvas';
import { DisasterHUD } from './components/DisasterHUD';
import { BuildingCard } from './components/BuildingCard';
import { ResultsPanel } from './components/ResultsPanel';
import { HowItWorksModal } from './components/HowItWorksModal';
import { CompareView } from './components/CompareView';
import { soundEngine } from './audio/soundEngine';
import { Shield, AlertTriangle, MapPin, CheckCircle } from 'lucide-react';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('landing');
  const [activeWorld, setActiveWorld] = useState<SampleWorld>(SAMPLE_WORLDS[0]);
  const [buildings, setBuildings] = useState<BuildingData[]>(INITIAL_BUILDINGS);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  const [simulationState, setSimulationState] = useState<SimulationState>({
    waterLevel: 15,
    isFloodActive: true,
    wavePhase: 'cresting',
    waveProgress: 0.5,
    waveZ: -30,
    soundEnabled: true,
    evacuationMode: false,
    heightMapMode: false,
    showHeights: false,
    compareMode: false,
    cameraMode: 'orbit',
    selectedBuilding: null,
    showResults: false,
  });

  // --- Handlers ---
  const handleStartExploration = () => {
    setScreen('upload');
  };

  const handleConfirmUpload = (world: SampleWorld) => {
    setActiveWorld(world);
    setScreen('processing');
  };

  const handleProcessingComplete = () => {
    setScreen('world');
    // Set to 15m Tsunami Simulation view matching reference image 2
    setSimulationState((prev) => ({
      ...prev,
      waterLevel: 15.0,
      isFloodActive: true,
      cameraMode: 'orbit',
    }));
  };

  const handleUpdateWaterLevel = (level: number) => {
    setSimulationState((prev) => ({
      ...prev,
      waterLevel: level,
      isFloodActive: level > 4 ? true : prev.isFloodActive,
    }));
    soundEngine.setWaterSimulationLevel(level, simulationState.isFloodActive);
  };

  const handleToggleFlood = () => {
    soundEngine.init();
    if (!simulationState.isFloodActive) {
      soundEngine.playWaveCrash();
      setSimulationState((prev) => ({
        ...prev,
        isFloodActive: true,
        waterLevel: Math.max(prev.waterLevel, 14.5), // Tsunami surge height
      }));
    } else {
      setSimulationState((prev) => ({
        ...prev,
        isFloodActive: false,
        waterLevel: 2.0,
      }));
    }
  };

  const handleToggleSound = () => {
    const isNowMuted = !soundEngine.toggleMute();
    setSimulationState((prev) => ({ ...prev, soundEnabled: !isNowMuted }));
  };

  const handleToggleHeights = () => {
    soundEngine.playMagicChime();
    setSimulationState((prev) => ({ ...prev, showHeights: !prev.showHeights }));
  };

  const handleToggleHeightMap = () => {
    soundEngine.playMagicChime();
    setSimulationState((prev) => ({ ...prev, heightMapMode: !prev.heightMapMode }));
  };

  const handleToggleEvacuation = () => {
    soundEngine.playMagicChime();
    setSimulationState((prev) => ({ ...prev, evacuationMode: !prev.evacuationMode }));
  };

  const handleToggleCompare = () => {
    soundEngine.playMagicChime();
    setSimulationState((prev) => ({ ...prev, compareMode: !prev.compareMode }));
  };

  const handleChangeCameraMode = (mode: CameraMode) => {
    soundEngine.playMagicChime();
    setSimulationState((prev) => ({ ...prev, cameraMode: mode }));
  };

  const handleReset = () => {
    soundEngine.playMagicChime();
    setSimulationState((prev) => ({
      ...prev,
      waterLevel: 0,
      isFloodActive: false,
      evacuationMode: false,
      heightMapMode: false,
      selectedBuilding: null,
      cameraMode: 'orbit',
    }));
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* 1. Landing Page Screen */}
      {screen === 'landing' && (
        <LandingPage
          onStartExploration={handleStartExploration}
          onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        />
      )}

      {/* 2. Choose Your World Upload Modal */}
      {screen === 'upload' && (
        <UploadModal
          onConfirmUpload={handleConfirmUpload}
          onCancel={() => setScreen('landing')}
        />
      )}

      {/* 3. Processing Sequence */}
      {screen === 'processing' && (
        <ProcessingScreen onComplete={handleProcessingComplete} />
      )}

      {/* 4. Main 3D World Simulation Screen */}
      {screen === 'world' && (
        <div className="relative w-full h-full">
          {/* Three.js Canvas */}
          <ThreeCanvas
            buildings={buildings}
            simulationState={simulationState}
            onSelectBuilding={(b) =>
              setSimulationState((prev) => ({ ...prev, selectedBuilding: b }))
            }
            onUpdateWaterLevel={handleUpdateWaterLevel}
          />

          {/* Disaster Game HUD */}
          <DisasterHUD
            buildings={buildings}
            simulationState={simulationState}
            onUpdateWaterLevel={handleUpdateWaterLevel}
            onToggleFlood={handleToggleFlood}
            onToggleSound={handleToggleSound}
            onToggleHeights={handleToggleHeights}
            onToggleHeightMap={handleToggleHeightMap}
            onToggleEvacuation={handleToggleEvacuation}
            onToggleCompare={handleToggleCompare}
            onChangeCameraMode={handleChangeCameraMode}
            onOpenResults={() =>
              setSimulationState((prev) => ({ ...prev, showResults: true }))
            }
            onReset={handleReset}
          />

          {/* Floating Building Inspection Card */}
          {simulationState.selectedBuilding && (
            <BuildingCard
              building={simulationState.selectedBuilding}
              simulationState={simulationState}
              onClose={() =>
                setSimulationState((prev) => ({ ...prev, selectedBuilding: null }))
              }
            />
          )}

          {/* Height Map Elevation Legend (When Height Map mode is active) */}
          {simulationState.heightMapMode && (
            <div className="absolute left-6 bottom-36 z-30 fantasy-stone-panel p-3.5 rounded-2xl border border-amber-500/60 shadow-xl max-w-xs animate-in fade-in">
              <div className="font-fantasy text-xs font-bold text-amber-200 tracking-wider mb-2">
                HEIGHT MAP ELEVATION LEGEND
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                  <span className="font-bold text-emerald-300">LOW ELEVATION (&lt; 5m)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 shadow-[0_0_6px_#facc15]" />
                  <span className="font-bold text-yellow-300">MEDIUM ELEVATION (5m - 12m)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
                  <span className="font-bold text-red-300">HIGH ELEVATION (&gt; 12m)</span>
                </div>
              </div>
            </div>
          )}

          {/* Evacuation Mode Banner Notice */}
          {simulationState.evacuationMode && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 fantasy-stone-panel px-5 py-2 rounded-full border-2 border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center gap-3 animate-bounce">
              <Shield className="w-5 h-5 text-emerald-400" />
              <div className="text-xs font-fantasy font-bold text-emerald-200">
                EVACUATION ACTIVE: Follow glowing green chevrons to High Citadel (Higher Ground Safe Haven)
              </div>
            </div>
          )}

          {/* Split-Screen Compare View Modal */}
          {simulationState.compareMode && (
            <CompareView
              buildings={buildings}
              simulationState={simulationState}
              onSelectBuilding={(b) =>
                setSimulationState((prev) => ({ ...prev, selectedBuilding: b }))
              }
              onUpdateWaterLevel={handleUpdateWaterLevel}
              onClose={() =>
                setSimulationState((prev) => ({ ...prev, compareMode: false }))
              }
            />
          )}

          {/* Results Summary Modal */}
          {simulationState.showResults && (
            <ResultsPanel
              buildings={buildings}
              simulationState={simulationState}
              onReplay={handleReset}
              onExploreAgain={() => setScreen('upload')}
              onViewElevationMap={() => {
                setSimulationState((prev) => ({
                  ...prev,
                  showResults: false,
                  heightMapMode: true,
                }));
              }}
              onClose={() =>
                setSimulationState((prev) => ({ ...prev, showResults: false }))
              }
            />
          )}
        </div>
      )}

      {/* How It Works Modal */}
      {isHowItWorksOpen && (
        <HowItWorksModal onClose={() => setIsHowItWorksOpen(false)} />
      )}
    </div>
  );
}
