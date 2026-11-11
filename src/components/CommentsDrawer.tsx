import React, { useState } from 'react';
import { X, Heart, Send } from 'lucide-react';
import { VideoFeedItem, CommentItem, User } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface CommentsDrawerProps {
  video: VideoFeedItem;
  currentUser: User;
  onClose: () => void;
  onAddComment: (videoId: string, commentText: string) => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  video,
  currentUser,
  onClose,
  onAddComment,
}) => {
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: 'c1',
      author: {
        id: 'usr_fan1',
        username: 'cyber_voyager',
        displayName: 'Neo R.',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop',
        bio: '',
        verified: false,
        followersCount: 120,
        followingCount: 90,
        totalLikes: 400,
      },
      text: 'The color grading on this is absolutely next level! What lens did you shoot this on?',
      timestamp: '2h ago',
      likesCount: 142,
      isLiked: false,
    },
    {
      id: 'c2',
      author: {
        id: 'usr_fan2',
        username: 'sol_beat',
        displayName: 'Solana Beats',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&fit=crop',
        bio: '',
        verified: true,
        followersCount: 4500,
        followingCount: 300,
        totalLikes: 24000,
      },
      text: 'That bass transition at the 0:08 mark sent chills 🔥🔥',
      timestamp: '45m ago',
      likesCount: 89,
      isLiked: true,
    },
    {
      id: 'c3',
      author: {
        id: 'usr_fan3',
        username: 'pixel_mira',
        displayName: 'Mira Dev',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&fit=crop',
        bio: '',
        verified: false,
        followersCount: 890,
        followingCount: 410,
        totalLikes: 5200,
      },
      text: 'Immediately saving this to my inspiration folder. VYRO quality is unhinged 🚀',
      timestamp: '12m ago',
      likesCount: 24,
      isLiked: false,
    },
  ]);

  const [inputVal, setInputVal] = useState('');

  const handleLikeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          audioEngine.playLikeSound();
          return {
            ...c,
            isLiked: !c.isLiked,
            likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1,
          };
        }
        return c;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const newComment: CommentItem = {
      id: `c_${Date.now()}`,
      author: currentUser,
      text: inputVal.trim(),
      timestamp: 'Just now',
      likesCount: 0,
      isLiked: false,
    };

    setComments([newComment, ...comments]);
    onAddComment(video.id, inputVal.trim());
    audioEngine.playWhoosh();
    setInputVal('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="w-full sm:max-w-md h-[70vh] sm:h-[600px] bg-[#0c0d14] border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab bar affordance for mobile */}
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">
              {comments.length} Comments
            </h3>
            <span className="text-[11px] text-slate-400">
              on @{video.author.username}&apos;s video
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <img
                src={comment.author.avatar}
                alt={comment.author.displayName}
                className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-slate-700"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-200">
                    {comment.author.displayName}
                  </span>
                  {comment.author.verified && (
                    <span className="text-cyan-400 text-[10px] font-bold">✓</span>
                  )}
                  <span className="text-[10px] text-slate-500">
                    · {comment.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">
                  {comment.text}
                </p>
              </div>

              {/* Like Comment */}
              <button
                onClick={() => handleLikeComment(comment.id)}
                className="flex flex-col items-center gap-0.5 pt-1 text-slate-400 hover:text-red-400 transition-colors"
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    comment.isLiked ? 'text-red-500 fill-red-500' : ''
                  }`}
                />
                <span className="text-[9px] font-medium tabular-nums">
                  {comment.likesCount}
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Post comment input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800/80 bg-[#08090e] flex items-center gap-2">
          <img
            src={currentUser.avatar}
            alt="Current user"
            className="w-7 h-7 rounded-full object-cover shrink-0"
            referrerPolicy="no-referrer"
          />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-slate-900/90 border border-slate-800 rounded-full px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white flex items-center justify-center transition-all active:scale-95 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
