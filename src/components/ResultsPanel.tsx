import React from 'react';
import { BuildingData, SimulationState } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { Shield, AlertTriangle, Waves, Map, RotateCcw, Compass, ArrowRight, X } from 'lucide-react';

interface ResultsPanelProps {
  buildings: BuildingData[];
  simulationState: SimulationState;
  onReplay: () => void;
  onExploreAgain: () => void;
  onViewElevationMap: () => void;
  onClose: () => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  buildings,
  simulationState,
  onReplay,
  onExploreAgain,
  onViewElevationMap,
  onClose,
}) => {
  const submergedBuildings = buildings.filter(
    (b) => !b.isShelter && simulationState.waterLevel > b.groundElevation + 0.8
  );
  const safeShelters = buildings.filter((b) => b.isShelter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg fantasy-stone-panel rounded-3xl p-6 md:p-8 border-2 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.4)] text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-amber-500/30 pb-3">
          <div>
            <div className="text-[11px] font-bold font-fantasy tracking-widest text-amber-400">
              DISASTER ASSESSMENT TELEMETRY
            </div>
            <h2 className="text-2xl font-fantasy font-black text-amber-100 mt-1">
              SIMULATION COMPLETE
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List formatted like requested in prompt */}
        <div className="my-5 space-y-3 font-sans">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Waves className="w-5 h-5 text-sky-400" />
              <div>
                <div className="text-xs text-slate-400">Water Level</div>
                <div className="text-sm font-bold text-slate-100">Peak simulated surge</div>
              </div>
            </div>
            <div className="font-fantasy font-black text-xl text-sky-300">
              {simulationState.waterLevel.toFixed(1)} m
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-xs text-red-300">Low-elevation structures</div>
                <div className="text-sm font-bold text-red-100">
                  {submergedBuildings.length} of {buildings.length - safeShelters.length} structures
                </div>
              </div>
            </div>
            <div className="text-xs font-bold text-red-300 bg-red-900/60 px-2 py-1 rounded">
              Potentially affected
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs text-emerald-300">Higher-elevation structures</div>
                <div className="text-sm font-bold text-emerald-100">
                  {safeShelters.length} Refuges (Citadel Plateau)
                </div>
              </div>
            </div>
            <div className="text-xs font-bold text-emerald-300 bg-emerald-900/60 px-2 py-1 rounded">
              Less affected in simulation
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2 text-xs text-slate-300">
              <Map className="w-4 h-4 text-amber-400" />
              <span>Elevation Map: <strong>Generated</strong></span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2 text-xs text-slate-300">
              <Compass className="w-4 h-4 text-sky-400" />
              <span>3D World: <strong>Ready to explore</strong></span>
            </div>
          </div>
        </div>

        {/* Disclaimer Note */}
        <p className="text-[11px] text-slate-400 italic bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
          * Note: Single-view height estimation is an experimental visualization prototype. Structural impact levels are simulated for demonstration.
        </p>

        {/* Action Buttons as requested */}
        <div className="mt-6 pt-4 border-t border-amber-500/30 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => {
              soundEngine.playMagicChime();
              onReplay();
            }}
            className="px-3 py-2.5 rounded-xl fantasy-stone-panel text-amber-300 hover:text-white border border-amber-500/60 text-xs font-fantasy font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            REPLAY
          </button>

          <button
            onClick={() => {
              soundEngine.playMagicChime();
              onViewElevationMap();
            }}
            className="px-3 py-2.5 rounded-xl fantasy-stone-panel text-sky-300 hover:text-white border border-sky-500/60 text-xs font-fantasy font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Map className="w-3.5 h-3.5" />
            ELEVATION MAP
          </button>

          <button
            onClick={() => {
              soundEngine.playMagicChime();
              onExploreAgain();
            }}
            className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-fantasy font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.5)] hover:scale-105 transition-all"
          >
            <span>EXPLORE AGAIN</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
