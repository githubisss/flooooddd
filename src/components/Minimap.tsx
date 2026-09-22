import React from 'react';
import { BuildingData, SimulationState } from '../types';
import { Shield, AlertTriangle } from 'lucide-react';

interface MinimapProps {
  buildings: BuildingData[];
  simulationState: SimulationState;
}

export const Minimap: React.FC<MinimapProps> = ({ buildings, simulationState }) => {
  // Map world bounds [-45, 45] to minimap canvas [0, 100]%
  const worldToMap = (x: number, z: number) => {
    const left = ((x + 45) / 90) * 100;
    const top = ((z + 45) / 90) * 100;
    return { left: `${left}%`, top: `${top}%` };
  };

  return (
    <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-amber-500/80 bg-slate-950/85 shadow-[0_0_20px_rgba(245,158,11,0.3)] overflow-hidden backdrop-blur-md">
      {/* Compass Directions */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-300 pointer-events-none z-20">N</div>
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-300 pointer-events-none z-20">S</div>
      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-300 pointer-events-none z-20">W</div>
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-300 pointer-events-none z-20">E</div>

      {/* Radar Sweep Animation */}
      <div className="absolute inset-0 rounded-full border border-sky-500/30 pointer-events-none z-10">
        <div className="w-full h-full rounded-full border-t border-sky-400/40 animate-spin origin-center" style={{ animationDuration: '6s' }} />
      </div>

      {/* Flood Inundation Zone overlay on West/Left */}
      <div
        className="absolute top-0 bottom-0 left-0 bg-sky-500/30 border-r-2 border-sky-400 transition-all duration-300 pointer-events-none"
        style={{
          width: `${Math.min((simulationState.waterLevel / 20) * 65 + 10, 80)}%`,
        }}
      />

      {/* Red Hazard Overlay on Low Elevation Zone */}
      <div className="absolute left-2 bottom-3 w-14 h-14 rounded-full bg-red-500/20 border border-red-500/40 pointer-events-none flex items-center justify-center">
        <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
      </div>

      {/* Safe Citadel on High Ridge East */}
      <div className="absolute right-4 top-8 w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 pointer-events-none flex items-center justify-center">
        <Shield className="w-4 h-4 text-emerald-400" />
      </div>

      {/* Render Building Points */}
      {buildings.map((b) => {
        const { left, top } = worldToMap(b.position[0], b.position[2]);
        const isFlooded = simulationState.waterLevel > b.groundElevation + 0.8;
        return (
          <div
            key={b.id}
            className={`absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform ${
              b.isShelter
                ? 'bg-emerald-400 ring-2 ring-emerald-300 scale-125 z-20'
                : isFlooded
                ? 'bg-red-500 ring-1 ring-red-300 animate-ping'
                : 'bg-amber-300'
            }`}
            style={{ left, top }}
            title={`${b.name} (${b.estimatedHeight}m)`}
          />
        );
      })}

      {/* Evacuation Route Dotted Line */}
      {simulationState.evacuationMode && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <polyline
            points="35,65 50,55 65,45 80,35"
            fill="none"
            stroke="#34d399"
            strokeWidth="2.5"
            strokeDasharray="4 3"
            className="animate-pulse"
          />
        </svg>
      )}

      {/* Player Avatar Position Center */}
      <div className="absolute left-[45%] top-[50%] w-3 h-3 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 border border-black rounded-full z-30 shadow-[0_0_8px_#facc15]" />
    </div>
  );
};
