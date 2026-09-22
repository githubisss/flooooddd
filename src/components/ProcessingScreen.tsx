import React, { useEffect, useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { CheckCircle2, Loader2, Mountain, Sparkles, Waves } from 'lucide-react';

interface ProcessingScreenProps {
  onComplete: () => void;
}

const STEPS = [
  'Image loaded',
  'Detecting structures',
  'Estimating depth',
  'Generating elevation map',
  'Creating 3D terrain',
  'Preparing disaster simulation',
];

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(10);

  useEffect(() => {
    soundEngine.init();

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          soundEngine.playMagicChime();
          const next = prev + 1;
          setProgressPercent(Math.round(((next + 1) / STEPS.length) * 100));
          return next;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            soundEngine.playMagicChime();
            onComplete();
          }, 600);
          return prev;
        }
      });
    }, 650);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Background Animated Sky Rays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.18),rgba(15,23,42,0.95))] pointer-events-none" />

      {/* Center 3D Reconstructing Visualizer Container */}
      <div className="relative z-10 max-w-xl w-full fantasy-stone-panel rounded-3xl p-8 border-2 border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-center flex flex-col items-center">
        {/* Animated Rising 3D Terrain Wireframe Mockup */}
        <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-amber-500/40 animate-ping opacity-25" />
          <div className="absolute inset-2 rounded-full border border-sky-400/40 animate-spin" style={{ animationDuration: '8s' }} />

          {/* Voxel Terrain Rising Graphic */}
          <div className="relative flex items-end justify-center gap-1.5 h-24 w-32 pb-2">
            {[4, 8, 14, 22, 18, 12, 6].map((h, i) => (
              <div
                key={i}
                className="w-3 bg-gradient-to-t from-sky-600 via-amber-500 to-amber-300 rounded-t-sm transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                style={{
                  height: `${Math.min(100, (progressPercent / 100) * (h * 4))}%`,
                  transitionDelay: `${i * 60}ms`,
                }}
              />
            ))}
          </div>

          <Mountain className="absolute -top-1 right-2 w-6 h-6 text-amber-400 animate-bounce" />
          <Waves className="absolute -bottom-1 left-2 w-6 h-6 text-sky-400 animate-pulse" />
        </div>

        {/* Main Status Text */}
        <div className="inline-flex items-center gap-1.5 text-xs font-fantasy font-bold text-amber-400 tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          MONOCULAR HEIGHT INFERENCE
        </div>

        <h2 className="text-2xl md:text-3xl font-fantasy font-black text-amber-100 tracking-wide mb-1">
          “Your world is being reconstructed...”
        </h2>

        <p className="text-xs text-slate-300 mb-6 font-sans">
          Deriving elevation fields, structural bounding heights, and boundary hydrodynamics.
        </p>

        {/* Progress Bar with Golden Trim */}
        <div className="w-full bg-slate-900 rounded-full h-3.5 p-0.5 border border-amber-500/60 shadow-inner mb-6 relative overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 transition-all duration-300 shadow-[0_0_12px_#f59e0b]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 6 Sequential Steps Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
          {STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs transition-all ${
                  isCompleted
                    ? 'bg-amber-950/40 border-amber-500/70 text-amber-200'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                )}
                <span className={isCompleted ? 'font-bold' : ''}>{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
