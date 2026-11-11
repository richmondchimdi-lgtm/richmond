import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3, 
  Flame, 
  Trash2, 
  BadgeCheck, 
  Activity,
  Radio
} from 'lucide-react';
import { User, VideoFeedItem } from '../types';
import { CREATORS } from '../data/mockData';
import { audioEngine } from '../utils/audioEngine';

interface AdminDashboardProps {
  onClose: () => void;
  videos: VideoFeedItem[];
  onRemoveVideo: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  videos,
  onRemoveVideo,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'verified' | 'algorithm'>('overview');
  const [reportedItems, setReportedItems] = useState([
    {
      id: 'rep_1',
      videoId: 'vid_5',
      author: 'zack_comedy',
      reason: 'Spam / Repeated Content',
      status: 'pending',
    },
    {
      id: 'rep_2',
      videoId: 'vid_1',
      author: 'maya.creates',
      reason: 'Flash sensitivity inquiry',
      status: 'pending',
    },
  ]);

  const [verifiedRequests, setVerifiedRequests] = useState([
    { id: 'v1', user: 'elena_neo', followers: '198K', category: 'Photography', approved: false },
    { id: 'v2', user: 'cyber_dave', followers: '45K', category: 'Tech & AR', approved: false },
  ]);

  const handleApproveReport = (reportId: string, removePost: boolean, videoId: string) => {
    if (removePost) {
      onRemoveVideo(videoId);
    }
    setReportedItems((prev) => prev.filter((r) => r.id !== reportId));
    audioEngine.playLikeSound();
  };

  const handleApproveVerified = (id: string) => {
    setVerifiedRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, approved: true } : req))
    );
    audioEngine.playStreakIgnite();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl bg-[#0c0d14] border border-cyan-500/30 rounded-3xl p-6 flex flex-col gap-5 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                VYRO Command Console
              </h3>
              <span className="text-[11px] text-cyan-400 font-medium">
                Administrator & Safety Engine
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

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/60 rounded-xl border border-slate-800">
          {[
            { id: 'overview', label: 'Platform Stats' },
            { id: 'moderation', label: `Moderation Queue (${reportedItems.length})` },
            { id: 'verified', label: 'Verification Approvals' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview Telemetry */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold mb-1">
                  Active Users
                </span>
                <span className="text-xl font-black text-white tabular-nums">482.4K</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">+14.2% today</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold mb-1">
                  Daily Snaps
                </span>
                <span className="text-xl font-black text-amber-400 tabular-nums">1.82M</span>
                <span className="text-[10px] text-amber-300 block mt-0.5">🔥 98.4% streak rate</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold mb-1">
                  Watch Hours
                </span>
                <span className="text-xl font-black text-purple-400 tabular-nums">94,200h</span>
                <span className="text-[10px] text-purple-300 block mt-0.5">82% retention</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold mb-1">
                  Safety Rating
                </span>
                <span className="text-xl font-black text-emerald-400 tabular-nums">99.8%</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">0 zero-day breaches</span>
              </div>
            </div>

            {/* Platform Health Matrix */}
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Network & Video Ingestion Health
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Feed Recommendation Latency:</span>
                  <span className="font-mono text-emerald-400 tabular-nums font-bold">18ms</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Disappearing Snap Garbage Collector:</span>
                  <span className="font-mono text-cyan-400 font-bold">Active (0 leaked frames)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>WebRTC P2P Call Encryption:</span>
                  <span className="font-mono text-purple-400 font-bold">AES-256 Enabled</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Moderation Queue */}
        {activeTab === 'moderation' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Flagged Content For Review
            </span>

            {reportedItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/40 rounded-2xl">
                No flagged items in moderation queue. All clear!
              </div>
            ) : (
              reportedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-xs font-bold text-white">@{item.author}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/60 text-red-300 border border-red-500/30">
                        {item.reason}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Post Target: {item.videoId} · Flagged by community trust model
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveReport(item.id, false, item.videoId)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-bold"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleApproveReport(item.id, true, item.videoId)}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs text-white font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Take Down</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Verification Approvals */}
        {activeTab === 'verified' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Pending Creator Verified Badges
            </span>

            {verifiedRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">@{req.user}</span>
                    <span className="text-[10px] text-purple-400 bg-purple-950/50 px-2 py-0.5 rounded-full">
                      {req.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Audience: {req.followers} followers across Matrix
                  </span>
                </div>

                <button
                  onClick={() => handleApproveVerified(req.id)}
                  disabled={req.approved}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    req.approved
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-md shadow-cyan-400/20'
                  }`}
                >
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>{req.approved ? 'Badge Granted ✓' : 'Approve Badge'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
