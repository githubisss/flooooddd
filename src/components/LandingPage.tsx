import React from 'react';
import { Sparkles, Compass, ShieldAlert, ArrowRight, BookOpen, Layers, Mountain, Waves } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface LandingPageProps {
  onStartExploration: () => void;
  onOpenHowItWorks: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartExploration,
  onOpenHowItWorks,
}) => {
  const handleStart = () => {
    soundEngine.init();
    soundEngine.playMagicChime();
    onStartExploration();
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-950 flex flex-col items-center justify-between text-slate-100 overflow-hidden px-4 py-8 md:py-12">
      {/* Background Fantasy Sky & Atmospheric Clouds */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-950 via-indigo-950/80 to-slate-950 pointer-events-none" />

      {/* Decorative Golden Stars / Particles */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-6xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-amber-400 bg-indigo-900 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.5)]">
            <span className="text-xl md:text-2xl">🧙</span>
          </div>
          <div>
            <span className="font-fantasy font-black tracking-widest text-amber-200 text-lg md:text-xl">
              DEPTHWIZARD
            </span>
            <div className="text-[10px] text-amber-400/80 font-bold tracking-wider">
              ISRO SINGLE-VIEW HEIGHT SIMULATION
            </div>
          </div>
        </div>

        <button
          onClick={onOpenHowItWorks}
          className="fantasy-stone-panel px-4 py-2 rounded-xl text-xs md:text-sm font-fantasy font-bold text-amber-300 border border-amber-500/50 hover:border-amber-300 flex items-center gap-2 transition-all hover:scale-105"
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          HOW IT WORKS
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-4xl text-center flex flex-col items-center my-auto py-8">
        {/* Fantasy Crest Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/70 border border-amber-500/50 text-amber-300 text-xs font-fantasy tracking-wider mb-6 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          SINGLE-VIEW REMOTE SENSING TO 3D DISASTER WORLD
        </div>

        {/* Title */}
        <h1 className="font-fantasy text-4xl sm:text-6xl md:text-7xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-500 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] leading-tight">
          DEPTHWIZARD
        </h1>

        {/* Subtitle */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-fantasy font-bold text-sky-200 mt-3 tracking-wide drop-shadow">
          Turn One Image Into a 3D Disaster World
        </h2>

        {/* Description */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mt-5 leading-relaxed font-sans">
          Upload a single remote-sensing image and explore its estimated terrain,
          building heights and disaster impact in an interactive 3D fantasy-inspired environment.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full justify-center">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-fantasy font-black text-base md:text-lg tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:shadow-[0_0_35px_rgba(245,158,11,0.9)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border-2 border-yellow-200"
          >
            <span>START EXPLORATION</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          <button
            onClick={onOpenHowItWorks}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl fantasy-stone-panel text-amber-200 font-fantasy font-bold text-base tracking-wider hover:bg-slate-800/80 border border-amber-500/60 hover:border-amber-300 transition-all flex items-center justify-center gap-2"
          >
            <Compass className="w-5 h-5 text-amber-400" />
            HOW IT WORKS
          </button>
        </div>

        {/* Core Concept Pipeline Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12 w-full max-w-3xl">
          <div className="fantasy-stone-panel p-3 rounded-xl border border-amber-500/30 text-left">
            <div className="text-amber-400 text-xs font-bold font-fantasy flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              1. SINGLE RGB
            </div>
            <div className="text-xs text-slate-300 mt-1">Satellite or drone image upload</div>
          </div>

          <div className="fantasy-stone-panel p-3 rounded-xl border border-sky-500/30 text-left">
            <div className="text-sky-400 text-xs font-bold font-fantasy flex items-center gap-1.5">
              <Mountain className="w-3.5 h-3.5" />
              2. HEIGHT ESTIMATION
            </div>
            <div className="text-xs text-slate-300 mt-1">Single-view building heights</div>
          </div>

          <div className="fantasy-stone-panel p-3 rounded-xl border border-cyan-500/30 text-left">
            <div className="text-cyan-400 text-xs font-bold font-fantasy flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5" />
              3. FLOOD WAVE
            </div>
            <div className="text-xs text-slate-300 mt-1">Surge wave & impact physics</div>
          </div>

          <div className="fantasy-stone-panel p-3 rounded-xl border border-emerald-500/30 text-left">
            <div className="text-emerald-400 text-xs font-bold font-fantasy flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              4. HIGH GROUND
            </div>
            <div className="text-xs text-slate-300 mt-1">Safe haven & evacuation path</div>
          </div>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="relative z-10 text-center text-xs text-slate-400 max-w-xl">
        <p>
          Visualization prototype for the ISRO Problem Statement.
          All heights, flood waves, and impact calculations are <strong className="text-amber-300">estimated simulations</strong> for planning & concept demonstration.
        </p>
      </footer>
    </div>
  );
};
