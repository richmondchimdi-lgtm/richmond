import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, Share2, Music, Volume2, VolumeX, Check, Plus } from 'lucide-react';
import { VideoFeedItem as IVideoItem } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { recommendationEngine } from '../services/recommendationEngine';

interface VideoFeedItemProps {
  video: IVideoItem;
  isActive: boolean;
  onLikeToggle: (id: string) => void;
  onSaveToggle: (id: string) => void;
  onFollowToggle: (authorId: string) => void;
  onOpenComments: (video: IVideoItem) => void;
  onOpenShare: (video: IVideoItem) => void;
  onTagClick?: (tag: string) => void;
}

export const VideoFeedItem: React.FC<VideoFeedItemProps> = ({
  video,
  isActive,
  onLikeToggle,
  onSaveToggle,
  onFollowToggle,
  onOpenComments,
  onOpenShare,
  onTagClick,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [useCanvasFallback, setUseCanvasFallback] = useState(false);
  const [heartBurst, setHeartBurst] = useState<{ x: number; y: number } | null>(null);
  const [watchStart, setWatchStart] = useState<number>(Date.now());
  const lastTapRef = useRef<number>(0);

  // Manage playback based on feed visibility
  useEffect(() => {
    if (isActive) {
      setWatchStart(Date.now());
      if (videoRef.current && !useCanvasFallback) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
          // Autoplay policy or video load error -> canvas fallback
          setUseCanvasFallback(true);
        });
      }
      setIsPlaying(true);
      if (!isMuted) {
        audioEngine.playMusicTrack(video.musicTitle);
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
      audioEngine.stopMusic();

      // Measure watch time and report to AI algorithm
      const watchedSeconds = (Date.now() - watchStart) / 1000;
      if (watchedSeconds < 1.8) {
        recommendationEngine.recordSkip(video.category);
      } else if (watchedSeconds >= video.durationSeconds * 0.75) {
        recommendationEngine.recordCompletion(video.category, video.author.id, watchedSeconds);
      }
    }
  }, [isActive, video.musicTitle, isMuted, useCanvasFallback, video.category, video.author.id, video.durationSeconds]);

  // Canvas visualizer fallback in case external MP4 fails or in hermetic sandbox
  useEffect(() => {
    if (!useCanvasFallback || !isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      // Draw futuristic animated gradient background
      const grad = ctx.createLinearGradient(0, 0, w, h);
      if (video.category === 'fashion' || video.category === 'music') {
        grad.addColorStop(0, '#1a0033');
        grad.addColorStop(0.5, '#4a0e4e');
        grad.addColorStop(1, '#0d0221');
      } else if (video.category === 'tech') {
        grad.addColorStop(0, '#001a2c');
        grad.addColorStop(0.5, '#023e8a');
        grad.addColorStop(1, '#03045e');
      } else {
        grad.addColorStop(0, '#2b0938');
        grad.addColorStop(0.5, '#6a0572');
        grad.addColorStop(1, '#11052c');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Draw flowing neon particle waves
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const strokeGrad = ctx.createLinearGradient(0, 0, w, 0);
        strokeGrad.addColorStop(0, 'rgba(168, 85, 247, 0.7)');
        strokeGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.8)');
        strokeGrad.addColorStop(1, 'rgba(236, 72, 153, 0.7)');
        ctx.strokeStyle = strokeGrad;

        for (let x = 0; x < w; x += 8) {
          const y = h * 0.5 + Math.sin(x * 0.01 + t + i) * 60 * Math.cos(t * 0.5 + i * 0.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Pulse circle in center
      const r = 90 + Math.sin(t * 2) * 20;
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.45, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [useCanvasFallback, isActive, video.category]);

  // Video time update for progress bar & completion
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || video.durationSeconds;
      setVideoProgress((cur / dur) * 100);

      // Loop or completion
      if (cur >= dur * 0.85) {
        recommendationEngine.recordCompletion(video.category, video.author.id, dur);
      }
    }
  };

  // Double tap to like gesture
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (now - lastTapRef.current < 320) {
      // Double tap!
      onLikeToggle(video.id);
      audioEngine.playLikeSound();
      setHeartBurst({ x, y });
      setTimeout(() => setHeartBurst(null), 850);
      lastTapRef.current = 0;
    } else {
      // Single tap -> toggle pause / play
      lastTapRef.current = now;
      setTimeout(() => {
        if (lastTapRef.current === now) {
          if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
          }
          setIsPlaying(!isPlaying);
        }
      }, 330);
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
    if (!nextMuted) {
      audioEngine.setMuted(false);
      audioEngine.playMusicTrack(video.musicTitle);
    } else {
      audioEngine.stopMusic();
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className="relative w-full h-full bg-black snap-card overflow-hidden select-none flex items-center justify-center"
    >
      {/* Video element */}
      {!useCanvasFallback ? (
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.posterUrl}
          loop
          playsInline
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onError={() => setUseCanvasFallback(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <canvas
          ref={canvasRef}
          width={400}
          height={750}
          className="w-full h-full object-cover"
        />
      )}

      {/* Subtle Dark Vignette Gradients for Text Contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />

      {/* Double Tap Heart Pop Animation */}
      {heartBurst && (
        <div
          className="absolute z-30 pointer-events-none animate-ping-once"
          style={{
            left: `${heartBurst.x - 45}px`,
            top: `${heartBurst.y - 45}px`,
          }}
        >
          <div className="w-24 h-24 rounded-full bg-red-500/20 backdrop-blur-sm flex items-center justify-center animate-bounce">
            <Heart className="w-16 h-16 text-red-500 fill-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
          </div>
        </div>
      )}

      {/* Floating Sound Toggle Button (Top Right) */}
      <button
        onClick={toggleSound}
        className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center active:scale-90 transition-transform"
        title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
      </button>

      {/* Right Action Rail (TikTok style) */}
      <div 
        className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Creator Avatar with Follow button */}
        <div className="relative mb-2">
          <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-purple-500 to-cyan-400 shadow-md">
            <img
              src={video.author.avatar}
              alt={video.author.displayName}
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <button
            onClick={() => onFollowToggle(video.author.id)}
            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-white transition-all ${
              video.author.isFollowing ? 'bg-slate-700' : 'bg-red-500 hover:bg-red-400'
            }`}
            title={video.author.isFollowing ? 'Following' : 'Follow Creator'}
          >
            {video.author.isFollowing ? (
              <Check className="w-3 h-3 stroke-[3]" />
            ) : (
              <Plus className="w-3 h-3 stroke-[3]" />
            )}
          </button>
        </div>

        {/* Like Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onLikeToggle(video.id)}
            className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white active:scale-125 transition-transform"
          >
            <Heart
              className={`w-7 h-7 transition-colors ${
                video.isLiked
                  ? 'text-red-500 fill-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                  : 'text-white'
              }`}
            />
          </button>
          <span className="text-[11px] font-bold text-white mt-1 tabular-nums drop-shadow-md">
            {(video.likesCount / 1000).toFixed(1)}k
          </span>
        </div>

        {/* Comment Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onOpenComments(video)}
            className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white active:scale-125 transition-transform"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          <span className="text-[11px] font-bold text-white mt-1 tabular-nums drop-shadow-md">
            {(video.commentsCount / 1000).toFixed(1)}k
          </span>
        </div>

        {/* Save/Bookmark Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onSaveToggle(video.id)}
            className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white active:scale-125 transition-transform"
          >
            <Bookmark
              className={`w-6 h-6 transition-colors ${
                video.isSaved ? 'text-amber-400 fill-amber-400' : 'text-white'
              }`}
            />
          </button>
          <span className="text-[11px] font-bold text-white mt-1 tabular-nums drop-shadow-md">
            {(video.savesCount / 1000).toFixed(1)}k
          </span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onOpenShare(video)}
            className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white active:scale-125 transition-transform"
          >
            <Share2 className="w-6 h-6" />
          </button>
          <span className="text-[11px] font-bold text-white mt-1 tabular-nums drop-shadow-md">
            {(video.sharesCount / 1000).toFixed(1)}k
          </span>
        </div>

        {/* Rotating Music Disc */}
        <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-slate-700/80 p-1 flex items-center justify-center shadow-lg animate-spin-slow">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center">
            <Music className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>

      {/* Bottom Information (Creator handle, caption, sound marquee) */}
      <div 
        className="absolute left-3 right-16 bottom-16 z-20 space-y-2 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Creator Name & Category Tag */}
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm tracking-tight drop-shadow-md">
            @{video.author.username}
          </span>
          {video.author.verified && (
            <span className="w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[10px] font-black" title="Verified Creator">
              ✓
            </span>
          )}
          <span className="text-[10px] text-purple-300 font-medium px-2 py-0.5 rounded-full bg-purple-900/50 border border-purple-500/30 uppercase tracking-wider">
            {video.category}
          </span>
        </div>

        {/* Caption & Hashtags */}
        <p className="text-white/90 text-xs line-clamp-2 leading-relaxed drop-shadow-md">
          {video.caption.split(' ').map((word, i) => {
            if (word.startsWith('#')) {
              return (
                <button
                  key={i}
                  onClick={() => onTagClick?.(word.replace('#', ''))}
                  className="font-bold text-cyan-300 hover:underline mr-1"
                >
                  {word}
                </button>
              );
            }
            return <span key={i}>{word} </span>;
          })}
        </p>

        {/* Music Sound Strip */}
        <div className="flex items-center gap-2 text-white/80 text-[11px]">
          <Music className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <div className="overflow-hidden whitespace-nowrap max-w-[200px]">
            <span className="inline-block animate-marquee">
              {video.musicTitle} · {video.musicAuthor}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Scrub Bar (Bottom Edge) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-100"
          style={{ width: `${videoProgress}%` }}
        />
      </div>

      <style>{`
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 6s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 12s linear infinite;
        }
      `}</style>
    </div>
  );
};
