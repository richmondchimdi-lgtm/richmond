import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Heart, Flame, Sparkles, Zap, Laugh, Shield } from 'lucide-react';
import { StoryItem } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface StoryViewerProps {
  story: StoryItem;
  onClose: () => void;
  onReply: (authorId: string, text: string) => void;
  onReact: (storyId: string, emoji: string) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  story,
  onClose,
  onReply,
  onReact,
}) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; x: number }[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance progress
  useEffect(() => {
    if (isPaused) return;

    const interval = 50; // update every 50ms
    const totalTime = 5000; // 5 seconds per story
    const step = (interval / totalTime) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timerRef.current!);
          onClose();
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, onClose]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(story.author.id, replyText);
    audioEngine.playWhoosh();
    setReplyText('');
    onClose();
  };

  const handleEmojiClick = (emoji: string) => {
    onReact(story.id, emoji);
    audioEngine.playLikeSound();
    const id = Date.now() + Math.random();
    setFloatingEmojis((prev) => [...prev, { id, emoji, x: Math.random() * 80 + 10 }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-md">
      {/* Phone container layout */}
      <div 
        className="relative w-full h-full max-w-md max-h-[880px] bg-[#0c0d14] sm:rounded-3xl overflow-hidden flex flex-col justify-between select-none"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Story Progress Bar */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5">
          <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Top Header: Creator Info & Close */}
        <div className="absolute top-6 left-3 right-3 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={story.author.avatar}
              alt={story.author.displayName}
              className="w-9 h-9 rounded-full object-cover border border-white/40"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white text-xs font-bold leading-none">{story.author.username}</span>
                {story.isCloseFriendsOnly && (
                  <span className="bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Shield className="w-2.5 h-2.5" /> Close Friends
                  </span>
                )}
              </div>
              <span className="text-[10px] text-white/70">{story.timestamp}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story Media Background */}
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <img
            src={story.mediaUrl}
            alt="Story content"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
        </div>

        {/* Story Caption Overlay */}
        {story.caption && (
          <div className="absolute bottom-28 left-4 right-4 z-20 text-center">
            <p className="inline-block bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-white text-sm font-medium shadow-lg">
              {story.caption}
            </p>
          </div>
        )}

        {/* Floating animated reaction bursts */}
        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
          {floatingEmojis.map((item) => (
            <span
              key={item.id}
              className="absolute text-4xl animate-fade-slide-up"
              style={{
                left: `${item.x}%`,
                bottom: '100px',
                animation: 'floatUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            >
              {item.emoji}
            </span>
          ))}
        </div>

        {/* Bottom Actions: Reply & Quick Reactions */}
        <div className="relative z-30 p-4 mt-auto space-y-3">
          {/* Quick Reaction Emoji Pills */}
          <div className="flex items-center justify-center gap-3">
            {[
              { emoji: '🔥', icon: Flame },
              { emoji: '❤️', icon: Heart },
              { emoji: '⚡', icon: Zap },
              { emoji: '✨', icon: Sparkles },
              { emoji: '😂', icon: Laugh },
            ].map(({ emoji }) => (
              <button
                key={emoji}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEmojiClick(emoji);
                }}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 active:scale-125 backdrop-blur-md flex items-center justify-center text-lg transition-all"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Reply Input Field */}
          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Send message to ${story.author.username}...`}
              className="flex-1 bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-400 text-white flex items-center justify-center disabled:opacity-40 transition-opacity active:scale-95 shadow-md shadow-purple-600/30"
              onClick={(e) => e.stopPropagation()}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.6); opacity: 1; }
          100% { transform: translateY(-300px) scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
