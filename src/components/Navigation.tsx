import React from 'react';
import { 
  Flame, 
  Compass, 
  PlusSquare, 
  MessageSquare, 
  User as UserIcon, 
  Radio, 
  BrainCircuit, 
  Bell, 
  ShieldCheck,
  Smartphone,
  Monitor
} from 'lucide-react';

interface NavigationProps {
  currentTab: 'home' | 'discover' | 'create' | 'messages' | 'profile';
  setCurrentTab: (tab: 'home' | 'discover' | 'create' | 'messages' | 'profile') => void;
  onOpenLive: () => void;
  onOpenAlgo: () => void;
  onOpenNotifications: () => void;
  onOpenAdmin: () => void;
  unreadMessagesCount: number;
  unreadNotifsCount: number;
  highestStreak: number;
  isPhoneFrame: boolean;
  setIsPhoneFrame: (val: boolean) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  setCurrentTab,
  onOpenLive,
  onOpenAlgo,
  onOpenNotifications,
  onOpenAdmin,
  unreadMessagesCount,
  unreadNotifsCount,
  highestStreak,
  isPhoneFrame,
  setIsPhoneFrame,
}) => {
  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#08090E]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 flex items-center justify-center font-display font-extrabold text-white text-base shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform">
              V
            </div>
            <div>
              <span className="font-display font-black tracking-wider text-lg bg-gradient-to-r from-white via-slate-100 to-purple-300 bg-clip-text text-transparent">
                VYRO
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] text-purple-400 font-medium tracking-widest uppercase">
                Social Matrix
              </span>
            </div>
          </button>
        </div>

        {/* Action Pills & Controls */}
        <div className="flex items-center gap-2">
          {/* Live Streaming Button */}
          <button
            onClick={onOpenLive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950/50 border border-red-500/40 text-red-400 hover:bg-red-900/50 text-xs font-semibold tracking-wide transition-all active:scale-95 shadow-sm shadow-red-500/20"
            title="Watch or Start Live Broadcast"
          >
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span className="text-[11px] font-bold">LIVE</span>
          </button>

          {/* Snap Streaks Quick Pill */}
          <button
            onClick={() => setCurrentTab('messages')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-400 hover:bg-amber-900/40 text-xs font-bold transition-all active:scale-95"
            title="Snap Streaks"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-bounce" />
            <span className="tabular-nums">{highestStreak}</span>
          </button>

          {/* AI Recommendation Brain Inspector */}
          <button
            onClick={onOpenAlgo}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/40 text-xs font-medium transition-all active:scale-95"
            title="Inspect & Tune 'For You' Algorithm"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline text-[11px]">Algorithm</span>
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full hover:bg-slate-800 text-slate-300 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#08090E]" />
            )}
          </button>

          {/* Admin Dashboard */}
          <button
            onClick={onOpenAdmin}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Admin Console"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Viewport Frame Mode Toggle (Phone Frame vs Wide Desktop) */}
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="hidden lg:flex items-center p-2 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors ml-1"
            title={isPhoneFrame ? "Switch to Wide Desktop View" : "Switch to Mobile Phone Frame"}
          >
            {isPhoneFrame ? (
              <Monitor className="w-4 h-4 text-purple-400" />
            ) : (
              <Smartphone className="w-4 h-4 text-cyan-400" />
            )}
          </button>
        </div>
      </header>

      {/* Bottom Thumb Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#08090E]/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1 max-w-lg mx-auto sm:rounded-t-2xl">
        <div className="grid grid-cols-5 items-center h-14">
          {/* 1. Home Feed (TikTok style) */}
          <button
            onClick={() => setCurrentTab('home')}
            className={`flex flex-col items-center justify-center min-h-[44px] transition-all ${
              currentTab === 'home' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${currentTab === 'home' ? 'bg-purple-600/20 text-purple-400' : ''}`}>
              <Flame className={`w-5 h-5 ${currentTab === 'home' ? 'fill-purple-400' : ''}`} />
            </div>
            <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${currentTab === 'home' ? 'text-purple-400 font-semibold' : ''}`}>
              Feed
            </span>
          </button>

          {/* 2. Discover (Instagram style) */}
          <button
            onClick={() => setCurrentTab('discover')}
            className={`flex flex-col items-center justify-center min-h-[44px] transition-all ${
              currentTab === 'discover' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${currentTab === 'discover' ? 'bg-cyan-500/20 text-cyan-400' : ''}`}>
              <Compass className={`w-5 h-5 ${currentTab === 'discover' ? 'stroke-[2.5]' : ''}`} />
            </div>
            <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${currentTab === 'discover' ? 'text-cyan-400 font-semibold' : ''}`}>
              Discover
            </span>
          </button>

          {/* 3. Create (+) - Snapchat Camera Studio */}
          <button
            onClick={() => setCurrentTab('create')}
            className="flex flex-col items-center justify-center min-h-[44px] group"
          >
            <div className="w-10 h-10 -mt-2 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-[2px] shadow-lg shadow-purple-600/30 group-active:scale-95 transition-transform">
              <div className="w-full h-full bg-[#08090E] rounded-[14px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                <PlusSquare className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-0.5 text-slate-300">
              Create
            </span>
          </button>

          {/* 4. Messages (Snap Streaks & DMs) */}
          <button
            onClick={() => setCurrentTab('messages')}
            className={`flex flex-col items-center justify-center min-h-[44px] relative transition-all ${
              currentTab === 'messages' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl relative transition-all ${currentTab === 'messages' ? 'bg-purple-600/20 text-purple-400' : ''}`}>
              <MessageSquare className={`w-5 h-5 ${currentTab === 'messages' ? 'fill-purple-400' : ''}`} />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-cyan-500 text-black font-extrabold text-[9px] flex items-center justify-center">
                  {unreadMessagesCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${currentTab === 'messages' ? 'text-purple-400 font-semibold' : ''}`}>
              Chat
            </span>
          </button>

          {/* 5. Profile */}
          <button
            onClick={() => setCurrentTab('profile')}
            className={`flex flex-col items-center justify-center min-h-[44px] transition-all ${
              currentTab === 'profile' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${currentTab === 'profile' ? 'bg-purple-600/20 text-purple-400' : ''}`}>
              <UserIcon className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${currentTab === 'profile' ? 'text-purple-400 font-semibold' : ''}`}>
              Profile
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
