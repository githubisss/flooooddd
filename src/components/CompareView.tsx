import React from 'react';
import { BuildingData, SimulationState } from '../types';
import { ThreeCanvas } from './ThreeCanvas';
import { X, SplitSquareVertical, ArrowLeft, ArrowRight, Waves, Sun } from 'lucide-react';

interface CompareViewProps {
  buildings: BuildingData[];
  simulationState: SimulationState;
  onSelectBuilding: (b: BuildingData | null) => void;
  onUpdateWaterLevel: (lvl: number) => void;
  onClose: () => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  buildings,
  simulationState,
  onSelectBuilding,
  onUpdateWaterLevel,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col select-none overflow-hidden">
      {/* Header Bar */}
      <div className="h-14 bg-slate-900 border-b border-amber-500/40 px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <SplitSquareVertical className="w-5 h-5 text-amber-400" />
          <h2 className="font-fantasy font-bold text-base md:text-lg text-amber-200">
            DUAL-VIEW IMPACT COMPARISON
          </h2>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Synchronized Baseline (Left) vs Inundated Disaster World (Right)
          </span>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Exit Comparison</span>
        </button>
      </div>

      {/* Split Views Container */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 relative">
        {/* LEFT VIEW: BEFORE FLOOD (Pristine, 0m Water Level) */}
        <div className="relative border-r border-amber-500/40 overflow-hidden h-[50vh] md:h-full">
          <div className="absolute top-4 left-4 z-20 fantasy-stone-panel px-3.5 py-1.5 rounded-xl border border-sky-400/50 flex items-center gap-2 text-xs font-fantasy font-bold text-sky-200 shadow-lg">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>LEFT: BEFORE FLOOD (BASELINE PRISTINE)</span>
          </div>
          <ThreeCanvas
            buildings={buildings}
            simulationState={{ ...simulationState, waterLevel: 0, isFloodActive: false }}
            onSelectBuilding={onSelectBuilding}
            onUpdateWaterLevel={() => {}}
            isCompareSecondary={true}
          />
        </div>

        {/* RIGHT VIEW: FLOOD SIMULATION */}
        <div className="relative overflow-hidden h-[50vh] md:h-full">
          <div className="absolute top-4 left-4 z-20 fantasy-stone-panel px-3.5 py-1.5 rounded-xl border border-red-500/50 flex items-center gap-2 text-xs font-fantasy font-bold text-red-200 shadow-lg animate-pulse">
            <Waves className="w-4 h-4 text-red-400" />
            <span>RIGHT: FLOOD SIMULATION ({simulationState.waterLevel.toFixed(1)}m SURGE)</span>
          </div>
          <ThreeCanvas
            buildings={buildings}
            simulationState={simulationState}
            onSelectBuilding={onSelectBuilding}
            onUpdateWaterLevel={onUpdateWaterLevel}
            isCompareSecondary={false}
          />
        </div>

        {/* Center Split Marker */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none items-center justify-center w-10 h-10 rounded-full border-2 border-amber-400 bg-slate-950 shadow-2xl text-amber-300">
          <SplitSquareVertical className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
