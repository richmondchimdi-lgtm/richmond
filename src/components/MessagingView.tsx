import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Camera, 
  Flame, 
  Phone, 
  Video, 
  Clock, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  CheckCheck, 
  ChevronLeft, 
  Sparkles, 
  Image as ImageIcon,
  Shield,
  Eye,
  Lock
} from 'lucide-react';
import { Conversation, ChatMessage, User, DisappearingMode } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { CallModal } from './CallModal';

interface MessagingViewProps {
  conversations: Conversation[];
  currentUser: User;
  onSendMessage: (conversationId: string, message: Partial<ChatMessage>) => void;
  onOpenSnapCamera: (friendId: string) => void;
}

export const MessagingView: React.FC<MessagingViewProps> = ({
  conversations,
  currentUser,
  onSendMessage,
  onOpenSnapCamera,
}) => {
  const [activeConvId, setActiveConvId] = useState<string>(conversations[0]?.id || '');
  const [inputText, setInputText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<{ participant: User; type: 'video' | 'audio' } | null>(null);
  
  // View-Once Snap Fullscreen Modal State
  const [activeSnapView, setActiveSnapView] = useState<{
    msgId: string;
    mediaUrl: string;
    timer: number;
    timeLeft: number;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const currentConv = conversations.find((c) => c.id === activeConvId);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConv?.messages]);

  // Handle countdown for view-once snaps
  useEffect(() => {
    if (!activeSnapView) return;
    const interval = setInterval(() => {
      setActiveSnapView((prev) => {
        if (!prev) return null;
        if (prev.timeLeft <= 1) {
          clearInterval(interval);
          // Mark snap as opened
          if (currentConv) {
            const msg = currentConv.messages.find((m) => m.id === prev.msgId);
            if (msg) msg.snapOpened = true;
          }
          return null;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSnapView, currentConv]);

  // Send text message
  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    onSendMessage(activeConvId, {
      text: inputText.trim(),
      mediaType: 'text',
      senderId: currentUser.id,
      timestamp: 'Just now',
      read: true,
    });

    audioEngine.playWhoosh();
    setInputText('');
  };

  // Toggle voice recording
  const handleToggleVoiceRecord = () => {
    if (isRecordingVoice) {
      // Finish recording voice note
      setIsRecordingVoice(false);
      onSendMessage(activeConvId, {
        mediaType: 'audio',
        audioDuration: Math.max(3, voiceDuration),
        senderId: currentUser.id,
        timestamp: 'Just now',
        read: true,
      });
      audioEngine.playWhoosh();
      setVoiceDuration(0);
    } else {
      setIsRecordingVoice(true);
      setVoiceDuration(1);
      audioEngine.playLikeSound();
    }
  };

  // Voice recording timer tick
  useEffect(() => {
    if (!isRecordingVoice) return;
    const timer = setInterval(() => setVoiceDuration((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  // Toggle disappearing message mode
  const cycleDisappearingMode = () => {
    if (!currentConv) return;
    const modes: DisappearingMode[] = ['off', '10s', '24h'];
    const nextIdx = (modes.indexOf(currentConv.disappearingMode) + 1) % modes.length;
    currentConv.disappearingMode = modes[nextIdx];
    audioEngine.playLikeSound();
  };

  // Open Snap
  const handleOpenSnap = (msg: ChatMessage) => {
    if (msg.snapOpened) return;
    audioEngine.playLikeSound();
    setActiveSnapView({
      msgId: msg.id,
      mediaUrl: msg.mediaUrl || '/src/assets/images/hero_trending_showcase_1794373440007.jpg',
      timer: msg.snapTimerSeconds || 10,
      timeLeft: msg.snapTimerSeconds || 10,
    });
  };

  return (
    <div className="w-full h-[calc(100vh-120px)] max-w-4xl mx-auto flex flex-col md:flex-row bg-[#08090E] border border-slate-800 md:rounded-3xl overflow-hidden shadow-2xl">
      {/* 1. Conversations List (Left Panel) */}
      <div className={`w-full md:w-80 border-r border-slate-800/80 bg-[#0c0d14] flex flex-col ${activeConvId && 'hidden md:flex'}`}>
        {/* List Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Chat & Streaks</h2>
          </div>
          <span className="text-[11px] text-purple-400 font-bold bg-purple-950/50 px-2.5 py-1 rounded-full border border-purple-500/30">
            {conversations.length} Active
          </span>
        </div>

        {/* Conversation rows */}
        <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-800/40">
          {conversations.map((conv) => {
            const isSelected = conv.id === activeConvId;
            const lastMsg = conv.messages[conv.messages.length - 1];

            return (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors ${
                  isSelected ? 'bg-purple-950/30 border-l-2 border-purple-500' : 'hover:bg-slate-900/50'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={conv.participant.avatar}
                    alt={conv.participant.displayName}
                    className="w-12 h-12 rounded-full object-cover border border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  {/* Streak flame badge */}
                  {conv.streakDays > 0 && (
                    <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shadow-sm">
                      <Flame className="w-2.5 h-2.5 fill-black" />
                      {conv.streakDays}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">
                      {conv.participant.displayName}
                    </span>
                    <span className="text-[10px] text-slate-500">{conv.lastActive}</span>
                  </div>

                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {lastMsg?.isSnap ? (
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        <Flame className="w-3 h-3" /> Snap {lastMsg.snapOpened ? '(Opened)' : '(New Snap)'}
                      </span>
                    ) : (
                      lastMsg?.text || 'Sent an audio note'
                    )}
                  </p>
                </div>

                {/* Quick Snap trigger button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSnapCamera(conv.participant.id);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 border border-slate-800"
                  title="Send Quick Snap"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Active Chat Room (Right Panel) */}
      {currentConv ? (
        <div className={`flex-1 flex flex-col bg-[#08090E] ${!activeConvId && 'hidden md:flex'}`}>
          {/* Chat Header Bar */}
          <div className="px-4 py-3 border-b border-slate-800/80 bg-[#0c0d14]/90 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setActiveConvId('')}
                className="md:hidden w-8 h-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="relative">
                <img
                  src={currentConv.participant.avatar}
                  alt={currentConv.participant.displayName}
                  className="w-9 h-9 rounded-full object-cover border border-slate-700"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0c0d14]" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white">
                    {currentConv.participant.displayName}
                  </h3>
                  {currentConv.streakDays > 0 && (
                    <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                      <Flame className="w-3 h-3 fill-amber-400" />
                      {currentConv.streakDays}d
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">@{currentConv.participant.username}</span>
              </div>
            </div>

            {/* Chat Action Tools */}
            <div className="flex items-center gap-1.5">
              {/* Disappearing Messages Toggle */}
              <button
                onClick={cycleDisappearingMode}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border transition-all ${
                  currentConv.disappearingMode === '10s'
                    ? 'bg-amber-950/60 border-amber-500/50 text-amber-400'
                    : currentConv.disappearingMode === '24h'
                    ? 'bg-purple-950/60 border-purple-500/50 text-purple-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
                title="Cycle Disappearing Mode (Off, 10s, 24h)"
              >
                <Clock className="w-3 h-3" />
                <span>
                  {currentConv.disappearingMode === '10s'
                    ? '10s Snap'
                    : currentConv.disappearingMode === '24h'
                    ? '24h Expiry'
                    : 'Normal'}
                </span>
              </button>

              {/* Audio Call */}
              <button
                onClick={() => {
                  audioEngine.playWhoosh();
                  setActiveCall({ participant: currentConv.participant, type: 'audio' });
                }}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Start Audio Call"
              >
                <Phone className="w-4 h-4" />
              </button>

              {/* Video Call */}
              <button
                onClick={() => {
                  audioEngine.playWhoosh();
                  setActiveCall({ participant: currentConv.participant, type: 'video' });
                }}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-cyan-400 flex items-center justify-center transition-colors"
                title="Start Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {/* Encryption notice */}
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 py-2">
              <Shield className="w-3 h-3 text-purple-400" />
              <span>Messages are end-to-end encrypted on the VYRO Matrix</span>
            </div>

            {currentConv.messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  {/* Case A: View-Once Snap */}
                  {msg.isSnap ? (
                    <div
                      onClick={() => handleOpenSnap(msg)}
                      className={`cursor-pointer p-3 rounded-2xl flex items-center gap-3 border transition-all active:scale-95 ${
                        msg.snapOpened
                          ? 'bg-slate-900/60 border-slate-800 text-slate-500'
                          : 'bg-gradient-to-r from-red-950/50 to-amber-950/50 border-red-500/50 text-white shadow-lg shadow-red-500/10'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        msg.snapOpened ? 'bg-slate-800 text-slate-500' : 'bg-red-500 text-white animate-pulse'
                      }`}>
                        {msg.snapOpened ? <Lock className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block">
                          {msg.snapOpened ? 'Snap Opened' : 'Tap to View Snap 🔥'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {msg.snapOpened ? 'Replay expired' : `${msg.snapTimerSeconds || 10}s view-once timer`}
                        </span>
                      </div>
                    </div>
                  ) : msg.mediaType === 'audio' ? (
                    /* Case B: Voice Message Player */
                    <div className={`p-3 rounded-2xl flex items-center gap-3 border ${
                      isMe ? 'bg-purple-950/40 border-purple-500/30 text-white' : 'bg-slate-900 border-slate-800 text-white'
                    }`}>
                      <button
                        onClick={() => {
                          audioEngine.playWhoosh();
                          setPlayingAudioId(playingAudioId === msg.id ? null : msg.id);
                        }}
                        className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center"
                      >
                        {playingAudioId === msg.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>

                      {/* Visual Audio Waveform */}
                      <div className="flex items-center gap-1 h-6">
                        {[40, 70, 30, 90, 60, 100, 45, 80, 50, 65, 85, 30].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full transition-all ${
                              playingAudioId === msg.id ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        0:{msg.audioDuration?.toString().padStart(2, '0') || '14'}
                      </span>
                    </div>
                  ) : (
                    /* Case C: Standard Text Message */
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none shadow-md shadow-purple-600/20'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  )}

                  {/* Timestamp & read receipts */}
                  <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-500">
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Recording Indicator Banner */}
          {isRecordingVoice && (
            <div className="px-4 py-2 bg-red-950/80 border-t border-red-500/40 flex items-center justify-between text-xs text-red-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span>Recording voice note ({voiceDuration}s)...</span>
              </div>
              <button
                onClick={handleToggleVoiceRecord}
                className="text-xs font-bold text-red-400 hover:text-white"
              >
                Send Audio
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendText}
            className="p-3 border-t border-slate-800/80 bg-[#0c0d14] flex items-center gap-2"
          >
            {/* Quick Snap Camera trigger */}
            <button
              type="button"
              onClick={() => onOpenSnapCamera(currentConv.participant.id)}
              className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 border border-slate-800 active:scale-95 transition-transform"
              title="Take Camera Snap"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Input Field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${currentConv.participant.displayName}...`}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />

            {/* Voice Record Button */}
            <button
              type="button"
              onClick={handleToggleVoiceRecord}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                isRecordingVoice ? 'bg-red-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
              title="Voice Message"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white flex items-center justify-center shrink-0 transition-all active:scale-95 shadow-md shadow-purple-600/30"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center text-slate-500 text-sm">
          Select a chat to begin messaging
        </div>
      )}

      {/* 3. View-Once Snap Fullscreen Overlay */}
      {activeSnapView && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between items-center p-4">
          {/* Top Progress countdown */}
          <div className="w-full max-w-md pt-2 space-y-2">
            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-1000 ease-linear"
                style={{
                  width: `${(activeSnapView.timeLeft / activeSnapView.timer) * 100}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-white">
              <span className="font-bold flex items-center gap-1 text-amber-400">
                <Flame className="w-3.5 h-3.5" /> View-Once Snap
              </span>
              <span className="font-mono tabular-nums">{activeSnapView.timeLeft}s left</span>
            </div>
          </div>

          {/* Snap image content */}
          <div className="relative max-w-md max-h-[75vh] rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={activeSnapView.mediaUrl}
              alt="Snap content"
              className="w-full h-full object-contain"
            />
          </div>

          <span className="text-xs text-slate-400 pb-4">
            This snap will self-destruct once the timer ends ⏳
          </span>
        </div>
      )}

      {/* 4. Live Call Overlay */}
      {activeCall && (
        <CallModal
          participant={activeCall.participant}
          callType={activeCall.type}
          onEndCall={() => setActiveCall(null)}
        />
      )}
    </div>
  );
};
