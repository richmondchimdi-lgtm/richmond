import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  FlipHorizontal, 
  Zap, 
  Clock, 
  Music, 
  Sparkles, 
  Send, 
  Plus, 
  X, 
  Check, 
  Upload, 
  Flame, 
  Sliders,
  Type
} from 'lucide-react';
import { User, SnapStreak } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface CameraStudioProps {
  currentUser: User;
  streaks: SnapStreak[];
  onPublishStory: (mediaUrl: string, caption: string, isCloseFriends: boolean) => void;
  onPublishFeed: (mediaUrl: string, caption: string, category: string, music: string) => void;
  onSendSnapToFriend: (friendId: string, mediaUrl: string, timerSeconds: number) => void;
  onClose: () => void;
}

type LensFilter = 'none' | 'cyber' | 'golden' | 'vhs' | 'matrix' | 'anime' | 'noir';
type FaceSticker = 'none' | 'visor' | 'horns' | 'glasses' | 'catears' | 'halo';

export const CameraStudio: React.FC<CameraStudioProps> = ({
  currentUser,
  streaks,
  onPublishStory,
  onPublishFeed,
  onSendSnapToFriend,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [timerDuration, setTimerDuration] = useState<0 | 3 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<LensFilter>('cyber');
  const [activeSticker, setActiveSticker] = useState<FaceSticker>('none');
  const [selectedMusic, setSelectedMusic] = useState('Cyber Euphoria');
  
  // Captured state
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [overlayText, setOverlayText] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [isCloseFriendsOnly, setIsCloseFriendsOnly] = useState(false);
  const [snapTimer, setSnapTimer] = useState<number>(10);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(streaks[0]?.friendId || '');
  const [isPublished, setIsPublished] = useState(false);

  // Initialize camera stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;
    async function setupCamera() {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 720 }, height: { ideal: 1280 } },
          audio: false,
        });
        currentStream = media;
        setStream(media);
        if (videoRef.current) {
          videoRef.current.srcObject = media;
          videoRef.current.play();
        }
        setCameraError(false);
      } catch {
        setCameraError(true);
      }
    }

    setupCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Flip Camera
  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture current frame from Video or Fallback Canvas
  const takeSnapshot = () => {
    if (timerDuration > 0) {
      let count = timerDuration;
      setCountdown(count);
      const timer = setInterval(() => {
        count--;
        if (count <= 0) {
          clearInterval(timer);
          setCountdown(null);
          doCapture();
        } else {
          setCountdown(count);
        }
      }, 1000);
    } else {
      doCapture();
    }
  };

  const doCapture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 1280;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (videoRef.current && !cameraError && stream) {
      // Draw from camera video
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    } else {
      // Draw stylized generative cyber snapshot
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#130424');
      grad.addColorStop(0.5, '#481358');
      grad.addColorStop(1, '#051833');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stylized avatar silhouette
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.arc(360, 480, 140, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(168, 85, 247, 0.8)';
      ctx.font = 'bold 32px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VYRO SNAP STUDIO', 360, 720);
    }

    // Apply active filter to snapshot canvas
    applyFilterToCanvas(ctx, canvas.width, canvas.height, activeFilter);

    // Apply sticker if active
    if (activeSticker !== 'none') {
      drawSticker(ctx, canvas.width, canvas.height, activeSticker);
    }

    audioEngine.playLikeSound();
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedMedia(dataUrl);
  };

  const applyFilterToCanvas = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    filter: LensFilter
  ) => {
    if (filter === 'cyber') {
      ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.fillRect(0, 0, w, h);
    } else if (filter === 'golden') {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.fillRect(0, 0, w, h);
    } else if (filter === 'vhs') {
      // Draw VHS lines
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1);
      }
      ctx.fillStyle = '#ff0055';
      ctx.font = '24px monospace';
      ctx.fillText('REC ● 1999', 40, 60);
    } else if (filter === 'matrix') {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.fillRect(0, 0, w, h);
    } else if (filter === 'noir') {
      // B&W overlay
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
      }
      ctx.putImageData(imgData, 0, 0);
    }
  };

  const drawSticker = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    sticker: FaceSticker
  ) => {
    ctx.textAlign = 'center';
    ctx.font = '96px sans-serif';
    if (sticker === 'horns') {
      ctx.fillText('🔥', w / 2 - 90, h * 0.35);
      ctx.fillText('🔥', w / 2 + 90, h * 0.35);
    } else if (sticker === 'catears') {
      ctx.fillText('🐱', w / 2, h * 0.32);
    } else if (sticker === 'glasses') {
      ctx.fillText('😎', w / 2, h * 0.45);
    } else if (sticker === 'halo') {
      ctx.fillText('✨', w / 2, h * 0.28);
    } else if (sticker === 'visor') {
      ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.fillRect(w * 0.2, h * 0.42, w * 0.6, 60);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.strokeRect(w * 0.2, h * 0.42, w * 0.6, 60);
    }
  };

  // Upload custom photo from file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedMedia(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter CSS class mapping for live viewfinder
  const getFilterStyle = (): React.CSSProperties => {
    switch (activeFilter) {
      case 'cyber':
        return { filter: 'contrast(1.15) hue-rotate(280deg) saturate(1.4)' };
      case 'golden':
        return { filter: 'sepia(0.3) saturate(1.5) brightness(1.05)' };
      case 'vhs':
        return { filter: 'contrast(1.3) saturate(1.2)' };
      case 'matrix':
        return { filter: 'hue-rotate(90deg) contrast(1.2) saturate(2)' };
      case 'anime':
        return { filter: 'saturate(1.8) contrast(1.1) brightness(1.05)' };
      case 'noir':
        return { filter: 'grayscale(1) contrast(1.4)' };
      default:
        return {};
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] max-w-md mx-auto bg-black flex flex-col justify-between overflow-hidden select-none">
      {/* 1. Camera Viewfinder or Captured Preview */}
      {!capturedMedia ? (
        <div className="relative flex-1 w-full h-full bg-[#08090E] overflow-hidden flex items-center justify-center">
          {/* Live Video Feed */}
          {!cameraError ? (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              style={getFilterStyle()}
              className={`w-full h-full object-cover transition-all duration-300 ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              }`}
            />
          ) : (
            /* Stylized Simulated Live Camera Feed */
            <div className="relative w-full h-full bg-gradient-to-b from-[#180828] via-[#240b36] to-[#0c0d14] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-purple-500 via-pink-500 to-cyan-400 mb-4 animate-pulse">
                <img
                  src={currentUser.avatar}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h4 className="text-white font-bold text-base mb-1">
                Virtual AR Lens Camera
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Camera access simulated for web preview. Tap capture to test AR filters, stickers, streaks, and view-once snaps!
              </p>
              <label className="cursor-pointer px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium flex items-center gap-2 border border-slate-700 transition-colors">
                <Upload className="w-3.5 h-3.5 text-purple-400" />
                <span>Upload From Device</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Flash Effect Overlay */}
          {isFlashOn && (
            <div className="absolute inset-0 bg-white/30 pointer-events-none" />
          )}

          {/* Live AR Sticker Overlay on Viewfinder */}
          {activeSticker !== 'none' && (
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
              {activeSticker === 'horns' && (
                <div className="flex gap-28 text-6xl -mt-40 animate-bounce">
                  <span>🔥</span>
                  <span>🔥</span>
                </div>
              )}
              {activeSticker === 'catears' && (
                <div className="text-7xl -mt-52">🐱</div>
              )}
              {activeSticker === 'glasses' && (
                <div className="text-7xl -mt-16">😎</div>
              )}
              {activeSticker === 'halo' && (
                <div className="text-6xl -mt-60 animate-pulse">✨</div>
              )}
              {activeSticker === 'visor' && (
                <div className="w-64 h-12 border-2 border-cyan-400 bg-cyan-500/30 backdrop-blur-sm -mt-20 flex items-center justify-between px-3">
                  <span className="text-[10px] font-mono text-cyan-200">TARGET: LOCKED</span>
                  <span className="text-[10px] font-mono text-cyan-200">VYRO-99</span>
                </div>
              )}
            </div>
          )}

          {/* Countdown timer badge */}
          {countdown !== null && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <span className="text-8xl font-black text-white animate-ping">
                {countdown}
              </span>
            </div>
          )}

          {/* Top Controls Bar */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Audio Track Tag */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs">
              <Music className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] font-medium max-w-[120px] truncate">{selectedMusic}</span>
            </div>

            {/* Flip Camera */}
            <button
              onClick={toggleCameraFacing}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center active:rotate-180 transition-transform"
              title="Flip Camera"
            >
              <FlipHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Right Tool Shelf: Flash, Timer, Stickers */}
          <div className="absolute right-4 top-20 z-20 flex flex-col gap-3">
            <button
              onClick={() => setIsFlashOn(!isFlashOn)}
              className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                isFlashOn ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30' : 'bg-black/40 text-white'
              }`}
              title="Toggle Flash"
            >
              <Zap className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const next = timerDuration === 0 ? 3 : timerDuration === 3 ? 10 : 0;
                setTimerDuration(next);
              }}
              className={`w-10 h-10 rounded-full backdrop-blur-md flex flex-col items-center justify-center transition-all ${
                timerDuration > 0 ? 'bg-purple-600 text-white' : 'bg-black/40 text-white'
              }`}
              title="Timer"
            >
              <Clock className="w-4 h-4" />
              {timerDuration > 0 && <span className="text-[8px] font-bold">{timerDuration}s</span>}
            </button>

            <button
              onClick={() => {
                const stickers: FaceSticker[] = ['none', 'visor', 'horns', 'glasses', 'catears', 'halo'];
                const nextIdx = (stickers.indexOf(activeSticker) + 1) % stickers.length;
                setActiveSticker(stickers[nextIdx]);
              }}
              className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                activeSticker !== 'none' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30' : 'bg-black/40 text-white'
              }`}
              title="AR Stickers"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Filter Carousel (Snapchat Lenses) */}
          <div className="absolute bottom-24 left-0 right-0 z-20 px-4">
            <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-2">
              {[
                { id: 'none', label: 'Normal' },
                { id: 'cyber', label: 'Cyber Violet' },
                { id: 'golden', label: 'Golden Hour' },
                { id: 'vhs', label: '1999 VHS' },
                { id: 'matrix', label: 'Matrix Code' },
                { id: 'anime', label: 'Anime Glow' },
                { id: 'noir', label: 'Noir Film' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    setActiveFilter(filter.id as LensFilter);
                    audioEngine.playLikeSound();
                  }}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                    activeFilter === filter.id
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md shadow-purple-600/30 scale-105'
                      : 'bg-black/50 text-white/70 hover:text-white border border-white/10'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Shutter Button (Snapchat Yellow Ring) */}
          <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center">
            <button
              onClick={takeSnapshot}
              className="w-18 h-18 rounded-full p-1 bg-white/20 border-4 border-amber-400 hover:border-amber-300 active:scale-90 transition-transform shadow-xl shadow-amber-400/20 flex items-center justify-center group"
            >
              <div className="w-14 h-14 rounded-full bg-white group-hover:bg-amber-300 transition-colors" />
            </button>
          </div>
        </div>
      ) : (
        /* 2. Captured Media Review & Publishing Drawer */
        <div className="relative flex-1 w-full h-full bg-[#08090E] flex flex-col justify-between overflow-hidden">
          {/* Preview Image */}
          <div className="relative flex-1 w-full overflow-hidden bg-black flex items-center justify-center">
            <img
              src={capturedMedia}
              alt="Snap Preview"
              className="w-full h-full object-contain"
            />

            {/* Movable Text Overlay */}
            {overlayText && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <span className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-white font-bold text-base shadow-xl">
                  {overlayText}
                </span>
              </div>
            )}

            {/* Cancel / Retake button */}
            <button
              onClick={() => setCapturedMedia(null)}
              className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Publishing Controls Panel */}
          <div className="bg-[#0c0d14] border-t border-slate-800 p-4 space-y-3">
            {/* Overlay Caption Input */}
            <div className="flex items-center gap-2 bg-slate-900 rounded-xl px-3 py-2 border border-slate-800">
              <Type className="w-4 h-4 text-purple-400 shrink-0" />
              <input
                type="text"
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                placeholder="Add text or caption to snap..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Action Targets Grid: Send Snap to Friend / Post to Story / Post to Feed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                <span>Select Destination</span>
                {/* Snap Timer Selector */}
                <div className="flex items-center gap-1 normal-case text-amber-400">
                  <Clock className="w-3 h-3" />
                  <span>View: {snapTimer}s</span>
                </div>
              </div>

              {/* Direct Snap Friend Target */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {streaks.map((s) => (
                  <button
                    key={s.friendId}
                    onClick={() => setSelectedRecipientId(s.friendId)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
                      selectedRecipientId === s.friendId
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Flame className="w-3 h-3 text-amber-500" />
                    <span>{s.friend.displayName.split(' ')[0]} ({s.days}d)</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {/* Send Direct Snap (Boost Streak 🔥) */}
                <button
                  onClick={() => {
                    onSendSnapToFriend(selectedRecipientId, capturedMedia, snapTimer);
                    audioEngine.playStreakIgnite();
                    setIsPublished(true);
                    setTimeout(() => {
                      setCapturedMedia(null);
                      setIsPublished(false);
                      onClose();
                    }, 800);
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs transition-transform active:scale-95 shadow-md shadow-amber-500/20"
                >
                  <Send className="w-4 h-4 mb-0.5" />
                  <span>Send Snap 🔥</span>
                </button>

                {/* Add to Story */}
                <button
                  onClick={() => {
                    onPublishStory(capturedMedia, overlayText, isCloseFriendsOnly);
                    audioEngine.playWhoosh();
                    setIsPublished(true);
                    setTimeout(() => {
                      setCapturedMedia(null);
                      setIsPublished(false);
                      onClose();
                    }, 800);
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-transform active:scale-95 shadow-md shadow-purple-600/20"
                >
                  <Plus className="w-4 h-4 mb-0.5" />
                  <span>My Story</span>
                </button>

                {/* Post to Feed (Reel) */}
                <button
                  onClick={() => {
                    onPublishFeed(capturedMedia, overlayText, 'fashion', selectedMusic);
                    audioEngine.playWhoosh();
                    setIsPublished(true);
                    setTimeout(() => {
                      setCapturedMedia(null);
                      setIsPublished(false);
                      onClose();
                    }, 800);
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs transition-transform active:scale-95"
                >
                  <Upload className="w-4 h-4 mb-0.5 text-cyan-400" />
                  <span>Share Feed</span>
                </button>
              </div>

              {/* Close friends toggle */}
              <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
                <span>Story privacy:</span>
                <button
                  onClick={() => setIsCloseFriendsOnly(!isCloseFriendsOnly)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                    isCloseFriendsOnly
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {isCloseFriendsOnly ? '★ Close Friends Only' : 'Public Story'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
