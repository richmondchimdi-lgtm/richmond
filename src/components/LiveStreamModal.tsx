import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Heart, Radio, Gift, Sparkles, Users, Flame, Trophy } from 'lucide-react';
import { User } from '../types';
import { CREATORS } from '../data/mockData';
import { audioEngine } from '../utils/audioEngine';

interface LiveStreamModalProps {
  currentUser: User;
  onClose: () => void;
}

interface LiveGift {
  id: string;
  name: string;
  icon: string;
  cost: number;
}

export const LiveStreamModal: React.FC<LiveStreamModalProps> = ({
  currentUser,
  onClose,
}) => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [viewerCount, setViewerCount] = useState(14820);
  const [comments, setComments] = useState<{ id: string; user: string; text: string; badge?: string }[]>([
    { id: '1', user: 'cyber_dave', text: 'THAT BASS IS CRAZY 🔥🔥🔥', badge: 'Top Fan' },
    { id: '2', user: 'neon_chloe', text: 'What software are you running for the synth?', badge: 'VIP' },
    { id: '3', user: 'alex_vyro', text: 'Loving the studio vibes tonight 🚀' },
    { id: '4', user: 'mira_japan', text: 'Greetings from Shibuya! 🌸' },
  ]);
  const [inputText, setInputText] = useState('');
  const [giftExplosion, setGiftExplosion] = useState<LiveGift | null>(null);
  const [heartsCount, setHeartsCount] = useState(38420);
  const [battleScore, setBattleScore] = useState({ host: 58, opponent: 42 });

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const gifts: LiveGift[] = [
    { id: 'g1', name: 'Cyber Rose', icon: '🌹', cost: 10 },
    { id: 'g2', name: 'Neon Energy', icon: '⚡', cost: 50 },
    { id: 'g3', name: 'Hyper Car', icon: '🏎️', cost: 250 },
    { id: 'g4', name: 'Galaxy Falcon', icon: '🌌', cost: 1000 },
  ];

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  // Periodic random live comments
  useEffect(() => {
    const dummyComments = [
      'LET IT DROOOOOP 🔊',
      'Sent a galaxy gift! Keep grinding!',
      'VYRO stream quality is unbeatable',
      'The audio mastering is so crisp',
      'Drop the remix link on discover!',
    ];

    const interval = setInterval(() => {
      const randomText = dummyComments[Math.floor(Math.random() * dummyComments.length)];
      const randomUser = `fan_${Math.floor(Math.random() * 900 + 100)}`;
      setComments((prev) => [...prev.slice(-20), { id: String(Date.now()), user: randomUser, text: randomText }]);
      setViewerCount((prev) => prev + Math.floor(Math.random() * 7 - 3));
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: String(Date.now()), user: currentUser.username, text: inputText.trim(), badge: 'Creator' },
    ]);
    audioEngine.playWhoosh();
    setInputText('');
  };

  const handleSendGift = (gift: LiveGift) => {
    setGiftExplosion(gift);
    audioEngine.playGiftFanfare();
    setComments((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        user: currentUser.displayName,
        text: `sent a ${gift.name} ${gift.icon}!`,
        badge: 'Gifter 🏆',
      },
    ]);
    setBattleScore((prev) => ({ host: prev.host + 2, opponent: Math.max(10, prev.opponent - 2) }));
    setTimeout(() => setGiftExplosion(null), 2500);
  };

  const handleHeartBurst = () => {
    setHeartsCount((prev) => prev + 1);
    audioEngine.playLikeSound();
  };

  const hostUser = isBroadcasting ? currentUser : CREATORS.kai;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4">
      <div 
        className="relative w-full sm:max-w-md h-full sm:h-[840px] bg-[#0c0d14] sm:rounded-3xl overflow-hidden flex flex-col justify-between select-none shadow-2xl"
        onClick={handleHeartBurst}
      >
        {/* Stream Video Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={isBroadcasting ? currentUser.avatar : '/src/assets/images/hero_trending_showcase_1794373440007.jpg'}
            alt="Live stream feed"
            className="w-full h-full object-cover filter brightness-95"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/70 pointer-events-none" />
        </div>

        {/* Top Header Strip */}
        <div className="relative z-20 p-4 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
            <img
              src={hostUser.avatar}
              alt={hostUser.displayName}
              className="w-8 h-8 rounded-full object-cover border border-red-500"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-1">
                <span className="text-white text-xs font-bold">{hostUser.displayName}</span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/80">
                <Users className="w-3 h-3 text-cyan-400" />
                <span className="tabular-nums font-semibold">{(viewerCount / 1000).toFixed(1)}k viewers</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode switch (Host yourself vs Watch) */}
            <button
              onClick={() => setIsBroadcasting(!isBroadcasting)}
              className="px-3 py-1.5 rounded-full bg-purple-600/80 hover:bg-purple-600 text-white text-[11px] font-bold border border-white/20 transition-all"
            >
              {isBroadcasting ? 'Viewing Mode' : 'Broadcast Live'}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Battle Score Bar */}
        <div className="relative z-20 px-4 py-1" onClick={(e) => e.stopPropagation()}>
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-2 border border-white/10 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-white px-1">
              <span className="flex items-center gap-1 text-cyan-400">
                <Trophy className="w-3 h-3" /> Host ({battleScore.host}%)
              </span>
              <span className="text-amber-400">LIVE BATTLE ⚔️</span>
              <span className="text-pink-400">Challenger ({battleScore.opponent}%)</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300"
                style={{ width: `${battleScore.host}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-600 transition-all duration-300"
                style={{ width: `${battleScore.opponent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center Gift Celebration Explosion */}
        {giftExplosion && (
          <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center animate-bounce">
            <span className="text-8xl drop-shadow-[0_0_35px_rgba(234,179,8,0.8)]">
              {giftExplosion.icon}
            </span>
            <span className="text-lg font-black text-amber-300 bg-black/80 px-4 py-1 rounded-full border border-amber-400 mt-2 shadow-2xl">
              {giftExplosion.name} Sent!
            </span>
          </div>
        )}

        {/* Bottom Area: Scrolling Comments & Gift Bar */}
        <div className="relative z-20 p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
          {/* Comments Stream */}
          <div className="max-h-44 overflow-y-auto no-scrollbar space-y-2 flex flex-col justify-end">
            {comments.slice(-6).map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full w-fit max-w-[85%] border border-white/10"
              >
                {c.badge && (
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-purple-600 text-white">
                    {c.badge}
                  </span>
                )}
                <span className="text-xs font-bold text-slate-300 shrink-0">@{c.user}:</span>
                <span className="text-xs text-white truncate">{c.text}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Virtual Gifts Quick Bar */}
          <div className="flex items-center justify-between gap-2 bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/10">
            {gifts.map((gift) => (
              <button
                key={gift.id}
                onClick={() => handleSendGift(gift)}
                className="flex-1 flex flex-col items-center p-1 rounded-xl hover:bg-white/10 active:scale-110 transition-all"
              >
                <span className="text-xl">{gift.icon}</span>
                <span className="text-[9px] font-bold text-amber-400 tabular-nums">
                  {gift.cost}c
                </span>
              </button>
            ))}
          </div>

          {/* Comment input & heart likes */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSendComment} className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Say something to the live..."
                className="w-full bg-black/60 border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-white/60 focus:outline-none focus:border-purple-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <button
              onClick={handleHeartBurst}
              className="w-10 h-10 rounded-full bg-red-600/80 hover:bg-red-500 text-white flex items-center justify-center shrink-0 active:scale-125 transition-transform shadow-lg shadow-red-600/30"
            >
              <Heart className="w-5 h-5 fill-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
