import React, { useState, useRef } from 'react';
import { SAMPLE_WORLDS } from '../data/sampleImages';
import { SampleWorld } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { UploadCloud, Image as ImageIcon, Map, CheckCircle2, ArrowRight, X, Sparkles } from 'lucide-react';

interface UploadModalProps {
  onConfirmUpload: (world: SampleWorld, customImage?: string) => void;
  onCancel: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onConfirmUpload, onCancel }) => {
  const [selectedWorld, setSelectedWorld] = useState<SampleWorld>(SAMPLE_WORLDS[0]);
  const [uploadType, setUploadType] = useState<'jpg_png' | 'geotiff'>('jpg_png');
  const [customFile, setCustomFile] = useState<{ name: string; type: string; url: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    soundEngine.playMagicChime();
    const url = URL.createObjectURL(file);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    setCustomFile({
      name: file.name,
      type: file.name.endsWith('.tif') || file.name.endsWith('.tiff') ? 'GeoTIFF (Georeferenced)' : 'RGB Satellite Imagery',
      url,
      size: `${sizeMb} MB`,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirm = () => {
    soundEngine.playMagicChime();
    if (customFile) {
      const customWorld: SampleWorld = {
        id: 'custom_upload',
        name: customFile.name.replace(/\.[^/.]+$/, ''),
        subtitle: 'User Uploaded Remote-Sensing Capture',
        thumbnail: customFile.url,
        type: uploadType === 'geotiff' ? 'geotiff' : 'satellite_rgb',
        description: `Custom ${customFile.type} processed for height estimation and flood simulation.`,
        estimatedStructuresCount: 16,
        maxElevationMeters: 24.5,
        highShelterHeight: 28.0,
      };
      onConfirmUpload(customWorld, customFile.url);
    } else {
      onConfirmUpload(selectedWorld);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-3xl fantasy-stone-panel rounded-3xl p-6 md:p-8 border-2 border-amber-500/80 shadow-[0_0_40px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-amber-500/30 pb-4">
          <div>
            <div className="text-[11px] font-bold font-fantasy tracking-wider text-amber-400">
              STEP 1: SATELLITE IMAGE SELECTION
            </div>
            <h2 className="text-2xl md:text-3xl font-fantasy font-bold text-amber-100 mt-1">
              CHOOSE YOUR WORLD
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1">
              Select or upload a single-view remote sensing image to estimate height and generate the 3D disaster simulation.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Two Upload Options: Non-Georeferenced vs Georeferenced */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setUploadType('jpg_png');
              fileInputRef.current?.click();
            }}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              uploadType === 'jpg_png'
                ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900/60 border-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center gap-2 text-amber-300 font-fantasy font-bold text-sm md:text-base">
              <ImageIcon className="w-5 h-5 text-amber-400" />
              📷 JPG / PNG
            </div>
            <div className="text-xs text-slate-300 mt-1">Non-Georeferenced Image</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Standard single RGB optical capture</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setUploadType('geotiff');
              fileInputRef.current?.click();
            }}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              uploadType === 'geotiff'
                ? 'bg-sky-950/40 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                : 'bg-slate-900/60 border-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center gap-2 text-sky-300 font-fantasy font-bold text-sm md:text-base">
              <Map className="w-5 h-5 text-sky-400" />
              🗺️ GeoTIFF
            </div>
            <div className="text-xs text-slate-300 mt-1">Georeferenced Image</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Embedded spatial metadata & projection</div>
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/tiff,.tif,.tiff"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-4 border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-amber-400 bg-amber-950/30'
              : 'border-slate-700 hover:border-amber-500/80 bg-slate-900/40'
          }`}
        >
          <UploadCloud className="w-10 h-10 text-amber-400 mx-auto mb-2 animate-bounce" />
          <div className="font-fantasy font-bold text-sm text-amber-200">
            Click to Browse or Drag & Drop Satellite Image
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Supports RGB JPG, PNG or GeoTIFF (Cartosat, Sentinel, Landsat, Drone)
          </div>
        </div>

        {/* Uploaded File Details (if uploaded) */}
        {customFile && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/60 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-3">
              <img
                src={customFile.url}
                alt="Upload preview"
                className="w-16 h-16 rounded-xl object-cover border border-slate-700"
              />
              <div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  File Ready for 3D Reconstruction
                </div>
                <div className="font-bold text-sm text-slate-100 truncate max-w-xs md:max-w-md">
                  {customFile.name}
                </div>
                <div className="text-xs text-slate-400">
                  {customFile.type} • {customFile.size}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCustomFile(null);
              }}
              className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1"
            >
              Remove
            </button>
          </div>
        )}

        {/* Or Select Sample Remote-Sensing World */}
        <div className="mt-6">
          <div className="text-xs font-fantasy font-bold text-amber-300 tracking-wider flex items-center gap-1.5 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            OR CHOOSE PRE-VALIDATED ISRO SATELLITE SAMPLE:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SAMPLE_WORLDS.map((world: SampleWorld) => {
              const isSelected = !customFile && selectedWorld.id === world.id;
              return (
                <div
                  key={world.id}
                  onClick={() => {
                    setCustomFile(null);
                    setSelectedWorld(world);
                  }}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-950/60 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <img
                    src={world.thumbnail}
                    alt={world.name}
                    className="w-full h-24 rounded-xl object-cover mb-2 border border-slate-700"
                  />
                  <div className="font-fantasy font-bold text-sm text-slate-100 truncate">
                    {world.name}
                  </div>
                  <div className="text-[11px] text-amber-400/90 truncate">{world.subtitle}</div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{world.estimatedStructuresCount} structures</span>
                    <span>Max {world.maxElevationMeters}m</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 pt-4 border-t border-amber-500/30 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-sm font-bold transition-colors"
          >
            Back to Home
          </button>

          <button
            onClick={handleConfirm}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-fantasy font-black text-base tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 border-yellow-200"
          >
            <span>CREATE 3D WORLD</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
