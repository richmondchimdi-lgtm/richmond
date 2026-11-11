import React, { useState, useEffect } from 'react';
import { BrainCircuit, X, RefreshCw, Zap, TrendingUp, Sparkles, Sliders, Shield } from 'lucide-react';
import { AlgorithmVector, ContentCategory } from '../types';
import { recommendationEngine } from '../services/recommendationEngine';
import { audioEngine } from '../utils/audioEngine';

interface AlgorithmInspectorProps {
  onClose: () => void;
  onRefreshFeed: () => void;
}

export const AlgorithmInspector: React.FC<AlgorithmInspectorProps> = ({
  onClose,
  onRefreshFeed,
}) => {
  const [vector, setVector] = useState<AlgorithmVector>(recommendationEngine.getVector());

  useEffect(() => {
    const unsub = recommendationEngine.subscribe((newVec) => {
      setVector(newVec);
    });
    return unsub;
  }, []);

  const handleSliderChange = (cat: ContentCategory, val: number) => {
    recommendationEngine.updateCategoryWeight(cat, val);
  };

  const handleReset = () => {
    recommendationEngine.resetAlgorithm();
    audioEngine.playWhoosh();
    onRefreshFeed();
  };

  const categories: { key: ContentCategory; label: string; icon: string; color: string }[] = [
    { key: 'tech', label: 'Tech & Spatial Computing', icon: '🤖', color: 'from-blue-500 to-cyan-400' },
    { key: 'anime', label: 'Anime & Cyber Aesthetics', icon: '🌸', color: 'from-pink-500 to-purple-400' },
    { key: 'music', label: 'Electronic Beats & Synths', icon: '🎧', color: 'from-purple-500 to-indigo-400' },
    { key: 'fashion', label: 'Future Streetwear', icon: '🔮', color: 'from-fuchsia-500 to-pink-500' },
    { key: 'comedy', label: 'Comedy & Relatable Skits', icon: '😂', color: 'from-amber-400 to-orange-500' },
    { key: 'gaming', label: 'Next-Gen Gaming', icon: '⚡', color: 'from-emerald-400 to-teal-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-[#0c0d14] border border-purple-500/40 rounded-3xl p-6 flex flex-col gap-5 shadow-2xl shadow-purple-600/20 max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-md">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5 font-display">
                VYRO Smart Neural Engine
              </h3>
              <span className="text-[11px] text-purple-300 font-medium">
                Real-Time Recommendation Matrix
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Learning Explanation Banner */}
        <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200/90 leading-relaxed flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">How VYRO Learns Your Taste:</p>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Watching videos past 80% boosts that genre (+12%). Double-tapping likes awards +18%. Quick skips in under 2s reduce frequency (-8%). You have full transparency and control over your feed weights!
            </p>
          </div>
        </div>

        {/* Real-time Telemetry Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="block text-lg font-black text-white tabular-nums">
              {vector.totalWatchSeconds}s
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Watched
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="block text-lg font-black text-emerald-400 tabular-nums">
              {vector.completedVideosCount}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Completed
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="block text-lg font-black text-rose-400 tabular-nums">
              {vector.skippedVideosCount}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Skipped
            </span>
          </div>
        </div>

        {/* Interactive Affinity Sliders */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Real-Time Interest Weights
            </span>
            <span className="text-[10px] text-slate-400">Drag to rebalance</span>
          </div>

          <div className="space-y-3">
            {categories.map((cat) => {
              const weight = vector[cat.key] || 50;

              return (
                <div
                  key={cat.key}
                  className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-purple-300 tabular-nums">
                      {weight}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={weight}
                      onChange={(e) => handleSliderChange(cat.key, Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white border border-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Algorithm</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playWhoosh();
              onRefreshFeed();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-transform active:scale-95"
          >
            Apply & Re-Rank Feed
          </button>
        </div>
      </div>
    </div>
  );
};
