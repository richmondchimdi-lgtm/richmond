import React from 'react';
import { Flame, Clock, Camera, ShieldCheck, Sparkles } from 'lucide-react';
import { SnapStreak } from '../types';

interface SnapStreaksProps {
  streaks: SnapStreak[];
  onSendSnapToFriend: (friendId: string) => void;
}

export const SnapStreaks: React.FC<SnapStreaksProps> = ({
  streaks,
  onSendSnapToFriend,
}) => {
  return (
    <div className="bg-[#0c0d14] border border-slate-800 rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Flame className="w-4 h-4 fill-amber-500" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Snap Streaks
            </h3>
            <span className="text-[10px] text-slate-400">
              Send daily snaps to keep the flames blazing
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/30">
          <ShieldCheck className="w-3 h-3 text-amber-400" />
          <span>Active</span>
        </div>
      </div>

      {/* Streak Friend Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {streaks.map((streak) => {
          const isExpiringSoon = streak.hoursLeft <= 6 && !streak.isActiveToday;

          return (
            <div
              key={streak.friendId}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                isExpiringSoon
                  ? 'bg-amber-950/20 border-amber-500/40 shadow-sm shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative">
                  <img
                    src={streak.friend.avatar}
                    alt={streak.friend.displayName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center">
                    🔥
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white truncate">
                      {streak.friend.displayName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="text-amber-400 font-extrabold flex items-center gap-0.5">
                      <Flame className="w-3 h-3 fill-amber-400" />
                      {streak.days} Days
                    </span>
                    {isExpiringSoon && (
                      <span className="text-red-400 font-semibold flex items-center gap-0.5 animate-pulse">
                        <Clock className="w-2.5 h-2.5" /> {streak.hoursLeft}h left!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSendSnapToFriend(streak.friendId)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                  streak.isActiveToday
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md shadow-amber-500/20 hover:brightness-110'
                }`}
              >
                <Camera className="w-3 h-3" />
                <span>{streak.isActiveToday ? 'Snap' : 'Send Snap'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
