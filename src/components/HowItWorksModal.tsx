import React from 'react';
import { BookOpen, Layers, Mountain, Waves, Shield, X, AlertTriangle } from 'lucide-react';

interface HowItWorksModalProps {
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl fantasy-stone-panel rounded-3xl p-6 md:p-8 border-2 border-amber-500 shadow-[0_0_40px_rgba(0,0,0,0.9)] text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-amber-500/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold font-fantasy tracking-wider text-amber-400">
                ISRO PROBLEM STATEMENT ARCHITECTURE
              </div>
              <h2 className="text-2xl font-fantasy font-black text-amber-100">
                HOW DEPTHWIZARD WORKS
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Modules */}
        <div className="mt-6 space-y-4 text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60">
            <h3 className="text-amber-300 font-fantasy font-bold text-base flex items-center gap-2 mb-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              1. Single-View Optical Remote Sensing
            </h3>
            <p>
              Traditional 3D reconstruction requires stereoscopic satellite pairs (such as stereo Cartosat passes) or LiDAR flyovers, which are often unavailable during rapid disaster emergencies. DepthWizard demonstrates monocular height estimation—deriving relative depth, shadows, building footprint textures, and nadir-to-oblique perspectives from a single RGB optical image.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60">
            <h3 className="text-sky-300 font-fantasy font-bold text-base flex items-center gap-2 mb-1.5">
              <Mountain className="w-4 h-4 text-sky-400" />
              2. 3D Procedural Digital Elevation Model (DEM)
            </h3>
            <p>
              The system isolates ground terrain from elevated architectural structures. Ground elevations are converted into a contiguous elevation surface (DEM), while segmented footprints are extruded into individual 3D structures with verified height attributes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60">
            <h3 className="text-cyan-300 font-fantasy font-bold text-base flex items-center gap-2 mb-1.5">
              <Waves className="w-4 h-4 text-cyan-400" />
              3. Dynamic Hydrodynamic Wave Inundation
            </h3>
            <p>
              Rather than a static flat flood plane, simulated water charges into the world as a physical surging wave body. As the water level slider rises from 0m to 20m, the flood penetrates low-lying inlets, creates foaming displacement, shakes low foundation cottages, and floats debris.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50">
            <h3 className="text-emerald-300 font-fantasy font-bold text-base flex items-center gap-2 mb-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              4. Higher-Ground Haven Identification & Evacuation
            </h3>
            <p>
              Structures situated above critical flood stage (&gt;18m elevation, such as the High Citadel) are categorized as potential shelters. DepthWizard computes an optimal low-hazard uphill path, rendered as a 3D glowing chevron route for evacuation planning.
            </p>
          </div>

          {/* Warning Callout */}
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/60 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Prototype Disclaimer:</strong> This application is a visualization prototype for the ISRO challenge statement. Heights, terrain models, and flood inundation are simulated estimations intended for concept testing and exploratory modeling, not certified evacuation guidance.
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t border-amber-500/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-fantasy font-bold text-xs tracking-wider shadow-lg hover:scale-105 transition-all"
          >
            ENTER SIMULATION
          </button>
        </div>
      </div>
    </div>
  );
};
