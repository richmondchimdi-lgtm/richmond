import React, { useState } from 'react';
import { X, Copy, Check, Send, Flame, Share } from 'lucide-react';
import { VideoFeedItem, User } from '../types';
import { CREATORS } from '../data/mockData';
import { audioEngine } from '../utils/audioEngine';

interface ShareModalProps {
  video: VideoFeedItem;
  onClose: () => void;
  onSendToFriend: (friendId: string, video: VideoFeedItem) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  video,
  onClose,
  onSendToFriend,
}) => {
  const [copied, setCopied] = useState(false);
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://vyro.social/v/${video.id}`);
    audioEngine.playWhoosh();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = (friend: User) => {
    onSendToFriend(friend.id, video);
    audioEngine.playWhoosh();
    setSentMap((prev) => ({ ...prev, [friend.id]: true }));
  };

  const friends = Object.values(CREATORS);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="w-full sm:max-w-md bg-[#0c0d14] border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Share className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Share Video</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Send to friends row */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
            Send via Direct Message & Streaks
          </span>
          <div className="grid grid-cols-4 gap-2">
            {friends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => handleSend(friend)}
                disabled={sentMap[friend.id]}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 transition-all active:scale-95 group"
              >
                <div className="relative">
                  <img
                    src={friend.avatar}
                    alt={friend.displayName}
                    className="w-11 h-11 rounded-full object-cover border border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  {friend.streakDays && (
                    <span className="absolute -bottom-1 -right-1 bg-amber-500/90 text-black text-[9px] font-black px-1 rounded-full flex items-center">
                      <Flame className="w-2 h-2 fill-black" />
                      {friend.streakDays}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium text-slate-200 truncate w-full text-center">
                  {friend.displayName.split(' ')[0]}
                </span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold transition-all ${
                    sentMap[friend.id]
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-purple-600 text-white group-hover:bg-purple-500'
                  }`}
                >
                  {sentMap[friend.id] ? 'Sent' : 'Send'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Copy Link & Quick Options */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-white font-medium transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-purple-950/80 text-purple-400 flex items-center justify-center">
                <Copy className="w-3.5 h-3.5" />
              </div>
              <span>Copy Video Link</span>
            </div>
            {copied ? (
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Copied!
              </span>
            ) : (
              <span className="text-slate-500 text-[11px]">vyro.social/v/{video.id}</span>
            )}
          </button>

          <button
            onClick={() => {
              onClose();
              audioEngine.playStreakIgnite();
            }}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 hover:from-purple-900/60 hover:to-indigo-900/60 border border-purple-500/30 text-xs text-purple-200 font-medium transition-all"
          >
            <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <Send className="w-3.5 h-3.5" />
            </div>
            <span>Remix & Share to Camera Studio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
