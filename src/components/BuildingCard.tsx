import React from 'react';
import { BuildingData, SimulationState } from '../types';
import { Shield, AlertTriangle, X, Waves, ArrowUpRight } from 'lucide-react';

interface BuildingCardProps {
  building: BuildingData | null;
  simulationState: SimulationState;
  onClose: () => void;
}

export const BuildingCard: React.FC<BuildingCardProps> = ({
  building,
  simulationState,
  onClose,
}) => {
  if (!building) return null;

  const isSubmerged = simulationState.waterLevel > building.groundElevation + 0.8;
  const floodDepth = Math.max(0, simulationState.waterLevel - building.groundElevation);

  return (
    <div className="absolute left-6 top-24 z-40 w-80 md:w-92 fantasy-stone-panel rounded-2xl p-5 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-amber-500/30 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/70 border border-amber-700/60 px-2 py-0.5 rounded">
            STRUCTURE TELEMETRY (ESTIMATED)
          </span>
          <h3 className="font-fantasy text-xl font-bold text-amber-100 mt-1 flex items-center gap-2">
            {building.name}
            {building.isShelter && <Shield className="w-5 h-5 text-emerald-400 inline" />}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 my-4">
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3">
          <div className="text-xs text-slate-400">Estimated Height</div>
          <div className="text-2xl font-black font-fantasy text-sky-400 mt-0.5">
            {building.estimatedHeight.toFixed(1)} <span className="text-sm font-normal text-slate-300">m</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Single-view regression</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3">
          <div className="text-xs text-slate-400">Ground Elevation</div>
          <div className="text-2xl font-black font-fantasy text-amber-300 mt-0.5">
            {building.groundElevation.toFixed(1)} <span className="text-sm font-normal text-slate-300">m</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Terrain baseline model</div>
        </div>
      </div>

      {/* Simulated Flood Status */}
      <div className={`rounded-xl p-3.5 border ${
        building.isShelter
          ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
          : isSubmerged
          ? 'bg-red-950/70 border-red-500/70 text-red-200 animate-pulse'
          : building.groundElevation < 4
          ? 'bg-amber-950/60 border-amber-500/60 text-amber-200'
          : 'bg-blue-950/60 border-blue-500/60 text-blue-200'
      }`}>
        <div className="flex items-center gap-2 font-bold text-sm">
          {building.isShelter ? (
            <>
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>POTENTIAL SAFE LOCATION</span>
            </>
          ) : isSubmerged ? (
            <>
              <Waves className="w-4 h-4 text-red-400" />
              <span>SIMULATED IMPACT: POTENTIALLY AFFECTED</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>ELEVATION STATUS: {building.groundElevation < 4 ? 'LOW' : 'MODERATE'}</span>
            </>
          )}
        </div>

        <p className="text-xs mt-1.5 opacity-90 leading-relaxed">
          {building.isShelter
            ? 'Higher-elevation area (>18m ground). Less affected in this simulation. Designated as potential evacuation haven.'
            : isSubmerged
            ? `Water depth at base is estimated at ${floodDepth.toFixed(1)}m. Low elevation structures in this zone face simulated inundation.`
            : `Current simulation water level is ${simulationState.waterLevel}m. Structure foundation is currently above flood line.`}
        </p>
      </div>

      {/* Footer Disclaimer */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Model: ISRO Prototype Est.</span>
        <span className="text-amber-400/90 italic">Simulated visualization only</span>
      </div>
    </div>
  );
};
