import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, Shield } from 'lucide-react';
import { User } from '../types';

interface CallModalProps {
  participant: User;
  callType: 'video' | 'audio';
  onEndCall: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  participant,
  callType,
  onEndCall,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#08090E]/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-sm h-[600px] bg-[#0c0d14] border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between p-6 relative shadow-2xl">
        {/* Top Call Info */}
        <div className="flex flex-col items-center text-center space-y-2 z-10">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
            <Shield className="w-3 h-3" /> End-to-End Encrypted
          </div>
          <h3 className="text-xl font-bold text-white">{participant.displayName}</h3>
          <span className="text-xs text-purple-400 font-semibold tabular-nums">
            {formatTime(callDuration)}
          </span>
        </div>

        {/* Center Visual: Video Stream or Avatar */}
        <div className="relative flex-1 my-6 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
          {isVideoEnabled ? (
            <div className="relative w-full h-full">
              <img
                src={participant.avatar}
                alt={participant.displayName}
                className="w-full h-full object-cover filter brightness-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-white font-medium">{participant.username}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-purple-600 to-cyan-400 shadow-xl shadow-purple-600/30 mb-3 animate-pulse">
                <img
                  src={participant.avatar}
                  alt={participant.displayName}
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xs text-slate-400">Audio Connected</span>
            </div>
          )}
        </div>

        {/* Call Controls Bar */}
        <div className="flex items-center justify-around z-10 bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-800">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
            title="Toggle Mute"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              !isVideoEnabled ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
            title="Toggle Video"
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={onEndCall}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform active:scale-95"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
