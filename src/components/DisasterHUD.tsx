import React from 'react';
import { BuildingData, CameraMode, SimulationState } from '../types';
import { Minimap } from './Minimap';
import {
  Waves,
  Volume2,
  VolumeX,
  Compass,
  Plane,
  User,
  Ruler,
  Map,
  Shield,
  AlertTriangle,
  RotateCcw,
  FileText,
  SplitSquareVertical,
  Eye,
} from 'lucide-react';

interface DisasterHUDProps {
  buildings: BuildingData[];
  simulationState: SimulationState;
  onUpdateWaterLevel: (level: number) => void;
  onToggleFlood: () => void;
  onToggleSound: () => void;
  onToggleHeights: () => void;
  onToggleHeightMap: () => void;
  onToggleEvacuation: () => void;
  onToggleCompare: () => void;
  onChangeCameraMode: (mode: CameraMode) => void;
  onOpenResults: () => void;
  onReset: () => void;
}

export const DisasterHUD: React.FC<DisasterHUDProps> = ({
  buildings,
  simulationState,
  onUpdateWaterLevel,
  onToggleFlood,
  onToggleSound,
  onToggleHeights,
  onToggleHeightMap,
  onToggleEvacuation,
  onToggleCompare,
  onChangeCameraMode,
  onOpenResults,
  onReset,
}) => {
  const isFloodSurging = simulationState.isFloodActive || simulationState.waterLevel > 6;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 select-none overflow-hidden z-30 font-sans">
      {/* ----------------- TOP BAR (EXACT THEME MATCHING IMAGE 2) ----------------- */}
      <div className="flex items-start justify-between w-full gap-4">
        {/* Top-Left: Tsunami Simulation Water Level Badge (Image 2) */}
        <div className="pointer-events-auto flex items-center gap-3 bg-[#0a192f]/90 border border-sky-400/40 rounded-2xl px-4 py-2.5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          {/* Glowing Circular Wave Emblem (Image 2) */}
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-300 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.6)] border border-white/40">
            <Waves className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base md:text-lg tracking-wide leading-tight">
              Tsunami Simulation
            </h1>
            <div className="text-sky-300 text-xs md:text-sm font-semibold flex items-center gap-1.5 mt-0.5">
              <span>Water Level:</span>
              <span className="text-cyan-200 font-bold font-mono">
                {simulationState.waterLevel.toFixed(0)} m
              </span>
            </div>
          </div>
        </div>

        {/* Top-Center: Water Level Simulation Slider */}
        <div className="pointer-events-auto hidden sm:flex flex-col items-center bg-[#0a192f]/85 border border-sky-500/30 rounded-2xl px-5 py-2.5 backdrop-blur-md shadow-xl max-w-sm w-full">
          <div className="flex items-center justify-between w-full mb-1 text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1">
              <Waves className="w-3.5 h-3.5 text-sky-400" />
              WATER LEVEL CONTROL
            </span>
            <span className="text-sky-300 font-mono font-bold">
              {simulationState.waterLevel.toFixed(1)} m
            </span>
          </div>

          <div className="w-full flex items-center gap-2.5">
            <span className="text-[11px] text-slate-400">0m</span>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={simulationState.waterLevel}
              onChange={(e) => onUpdateWaterLevel(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 hover:accent-sky-300 transition-all"
            />
            <span className="text-[11px] text-slate-400">20m</span>
          </div>

          {/* Quick Level Presets */}
          <div className="flex items-center gap-2 mt-1.5">
            {[0, 5, 10, 15, 20].map((level) => (
              <button
                key={level}
                onClick={() => onUpdateWaterLevel(level)}
                className={`px-2 py-0.5 text-[11px] rounded-lg font-bold transition-all ${
                  Math.round(simulationState.waterLevel) === level
                    ? 'bg-sky-500 text-slate-950 font-black shadow-[0_0_8px_#38bdf8]'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {level}m
              </button>
            ))}
          </div>
        </div>

        {/* Top-Right: Circular Radar Minimap (Image 2) */}
        <div className="pointer-events-auto flex flex-col items-end">
          <Minimap buildings={buildings} simulationState={simulationState} />
        </div>
      </div>

      {/* ----------------- BOTTOM BAR (MATCHING IMAGE 2 EXACTLY) ----------------- */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between w-full gap-4">
        {/* Bottom-Left: Disaster Telemetry Card (Directly from Image 2!) */}
        <div className="pointer-events-auto bg-[#0a192f]/90 border border-sky-400/40 rounded-2xl p-4 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.6)] text-slate-100 min-w-[270px]">
          <div className="flex items-center gap-2.5 text-sm font-bold text-sky-200 mb-2.5">
            <Waves className="w-5 h-5 text-sky-400 shrink-0" />
            <span>Wave Height: {simulationState.waterLevel.toFixed(0)} m</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-semibold text-rose-300 mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              Buildings below 10 m:{' '}
              <strong className="text-rose-400 underline decoration-rose-500/50">
                Likely to be destroyed
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-300">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Buildings above 20 m:{' '}
              <strong className="text-emerald-400">Safe</strong>
            </span>
          </div>
        </div>

        {/* Bottom-Center: Interactive Wave Sound Button (Image 2) */}
        <div className="pointer-events-auto mx-auto md:mx-0">
          <button
            onClick={onToggleSound}
            className="bg-[#0a192f]/90 border border-sky-400/50 rounded-full px-5 py-2.5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.6)] text-slate-100 flex items-center gap-3 hover:border-sky-300 active:scale-95 transition-all cursor-pointer"
          >
            {simulationState.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-sky-400 animate-pulse" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
            <span className="text-xs md:text-sm font-bold tracking-wide">
              Wave sound:{' '}
              <span className="text-sky-300 font-mono tracking-widest font-black ml-1">
                {simulationState.soundEnabled && isFloodSurging
                  ? '*ROAR* *ROAR* *ROAR*'
                  : simulationState.soundEnabled
                  ? 'ON'
                  : 'MUTED'}
              </span>
            </span>
          </button>
        </div>

        {/* Bottom-Right: Modern Glassmorphic Action Controls Tray */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2 max-w-xl">
          {/* Main Large Flood Simulation Trigger Button */}
          <button
            onClick={onToggleFlood}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm tracking-wide flex items-center gap-2 shadow-lg transition-all border ${
              simulationState.isFloodActive
                ? 'bg-gradient-to-r from-rose-600 to-red-700 border-rose-300 text-white shadow-[0_0_20px_rgba(244,63,94,0.7)] animate-pulse'
                : 'bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 border-sky-300 text-white hover:brightness-110 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
            }`}
          >
            <Waves className="w-4 h-4" />
            {simulationState.isFloodActive ? '🌊 FLOOD ACTIVE' : '🌊 FLOOD SIMULATION'}
          </button>

          {/* Camera View Switcher (Overview vs Fly vs Avatar) */}
          <div className="flex items-center rounded-xl bg-[#0a192f]/90 border border-sky-500/40 p-1">
            <button
              onClick={() => onChangeCameraMode('orbit')}
              title="Cinematic Panoramic Overview (Matching Reference Image)"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                simulationState.cameraMode === 'orbit'
                  ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>OVERVIEW</span>
            </button>
            <button
              onClick={() => onChangeCameraMode('fly')}
              title="Drone Aerial Fly Mode"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                simulationState.cameraMode === 'fly'
                  ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>FLY</span>
            </button>
            <button
              onClick={() => onChangeCameraMode('avatar')}
              title="Wizard 3rd-Person Walk Mode"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                simulationState.cameraMode === 'avatar'
                  ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>WALK</span>
            </button>
          </div>

          {/* Show Heights */}
          <button
            onClick={onToggleHeights}
            className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all ${
              simulationState.showHeights
                ? 'bg-sky-500 text-slate-950 border-sky-300 shadow-[0_0_12px_#38bdf8]'
                : 'bg-[#0a192f]/90 text-sky-200 border-sky-500/40 hover:border-sky-300'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>HEIGHTS</span>
          </button>

          {/* Height Map Mode */}
          <button
            onClick={onToggleHeightMap}
            className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all ${
              simulationState.heightMapMode
                ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_12px_#10b981]'
                : 'bg-[#0a192f]/90 text-emerald-200 border-sky-500/40 hover:border-emerald-400'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>HEIGHT MAP</span>
          </button>

          {/* Evacuation Mode */}
          <button
            onClick={onToggleEvacuation}
            className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all ${
              simulationState.evacuationMode
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_12px_#f59e0b]'
                : 'bg-[#0a192f]/90 text-amber-200 border-sky-500/40 hover:border-amber-400'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>EVACUATION</span>
          </button>

          {/* Compare Split View */}
          <button
            onClick={onToggleCompare}
            className="px-3 py-2 rounded-xl font-bold text-xs bg-[#0a192f]/90 text-slate-200 border border-sky-500/40 hover:border-sky-300 flex items-center gap-1.5"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>COMPARE</span>
          </button>

          {/* Results Summary */}
          <button
            onClick={onOpenResults}
            className="px-3 py-2 rounded-xl font-bold text-xs bg-[#0a192f]/90 text-slate-200 border border-sky-500/40 hover:border-sky-300 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>RESULTS</span>
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="p-2 rounded-xl bg-[#0a192f]/90 text-slate-300 hover:text-white border border-sky-500/40 hover:border-slate-400"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
