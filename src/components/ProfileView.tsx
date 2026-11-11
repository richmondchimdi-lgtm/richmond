import React, { useState } from 'react';
import { 
  Grid, 
  Film, 
  Bookmark, 
  Heart, 
  Flame, 
  Edit3, 
  Settings, 
  Check, 
  Share2, 
  ShieldCheck, 
  Camera, 
  UserCheck, 
  Users 
} from 'lucide-react';
import { User, VideoFeedItem } from '../types';
import { CREATORS } from '../data/mockData';
import { audioEngine } from '../utils/audioEngine';

interface ProfileViewProps {
  currentUser: User;
  onUpdateUser: (updated: Partial<User>) => void;
  onSwitchUser: (user: User) => void;
  userVideos: VideoFeedItem[];
  savedVideos: VideoFeedItem[];
  likedVideos: VideoFeedItem[];
  onSelectVideo: (video: VideoFeedItem) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  onSwitchUser,
  userVideos,
  savedVideos,
  likedVideos,
  onSelectVideo,
}) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'photos' | 'saved' | 'liked' | 'streaks'>('videos');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser.displayName);
  const [editBio, setEditBio] = useState(currentUser.bio);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      displayName: editName.trim(),
      bio: editBio.trim(),
    });
    audioEngine.playLikeSound();
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 space-y-6 pb-24">
      {/* 1. Profile Header Card */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0c0d14] border border-slate-800 shadow-xl">
        {/* Banner Cover */}
        <div className="h-32 sm:h-44 w-full bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 relative">
          <img
            src="/src/assets/images/hero_trending_showcase_1794373440007.jpg"
            alt="Cover"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d14] via-transparent to-transparent" />
        </div>

        {/* Profile Info Row */}
        <div className="px-5 pb-5 -mt-14 relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 shadow-2xl">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.displayName}
                  className="w-full h-full rounded-full object-cover border-2 border-[#0c0d14]"
                  referrerPolicy="no-referrer"
                />
              </div>
              {currentUser.verified && (
                <div 
                  className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-cyan-400 text-black flex items-center justify-center text-xs font-black ring-2 ring-[#0c0d14]"
                  title="Verified Matrix Creator"
                >
                  ✓
                </div>
              )}
            </div>

            <div className="mb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white font-display">
                  {currentUser.displayName}
                </h2>
              </div>
              <span className="text-xs text-purple-400 font-medium">@{currentUser.username}</span>
            </div>
          </div>

          {/* Edit & Share Profile Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>

            {/* Persona switcher dropdown for instant multi-role testing */}
            <div className="relative group">
              <button
                className="px-3 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-xs font-bold text-purple-300 flex items-center gap-1.5 transition-colors"
                title="Switch Persona"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Switch Account</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#0c0d14] border border-slate-800 rounded-2xl p-2 hidden group-hover:block z-30 shadow-2xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1 block">
                  Switch Persona
                </span>
                {Object.values(CREATORS).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSwitchUser(c)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <img src={c.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                    <span className="truncate">{c.displayName}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="px-5 pb-4">
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {currentUser.bio}
          </p>
        </div>

        {/* Numerical Stats Bar (Tabular discipline) */}
        <div className="grid grid-cols-4 border-t border-slate-800/80 bg-slate-950/60 divide-x divide-slate-800/80 text-center py-3">
          <div>
            <span className="block text-base sm:text-lg font-black text-white tabular-nums">
              {(currentUser.followersCount / 1000).toFixed(1)}k
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Followers
            </span>
          </div>

          <div>
            <span className="block text-base sm:text-lg font-black text-white tabular-nums">
              {currentUser.followingCount}
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Following
            </span>
          </div>

          <div>
            <span className="block text-base sm:text-lg font-black text-white tabular-nums">
              {(currentUser.totalLikes / 1000).toFixed(1)}k
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Likes
            </span>
          </div>

          <div>
            <span className="block text-base sm:text-lg font-black text-amber-400 tabular-nums flex items-center justify-center gap-0.5">
              <Flame className="w-4 h-4 fill-amber-400" />
              {currentUser.streakDays || 48}d
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Streaks
            </span>
          </div>
        </div>
      </div>

      {/* 2. Profile Tabs (Segmented Controls) */}
      <div className="flex items-center gap-1 p-1 bg-[#0c0d14] border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'videos'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Videos</span>
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'photos'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Gallery</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'saved'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved</span>
        </button>

        <button
          onClick={() => setActiveTab('liked')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'liked'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Liked</span>
        </button>
      </div>

      {/* 3. Tab Content Grids */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {userVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer group"
            >
              <img
                src={video.posterUrl || '/src/assets/images/hero_trending_showcase_1794373440007.jpg'}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                <span className="text-white text-xs font-bold line-clamp-1">
                  {video.caption}
                </span>
                <span className="text-[10px] text-slate-300 font-semibold tabular-nums mt-0.5">
                  {(video.likesCount / 1000).toFixed(1)}k views
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="grid grid-cols-3 gap-2">
          {[
            '/src/assets/images/hero_trending_showcase_1794373440007.jpg',
            '/src/assets/images/avatar_cyber_creator_1794373440120.jpg',
            '/src/assets/images/avatar_dj_producer_1794373440266.jpg',
            '/src/assets/images/discover_anime_vibe_1794373441473.jpg',
            'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&fit=crop',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&fit=crop',
          ].map((imgUrl, i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer group"
            >
              <img
                src={imgUrl}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {savedVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer group"
            >
              <img
                src={video.posterUrl || '/src/assets/images/hero_trending_showcase_1794373440007.jpg'}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                <span className="text-white text-xs font-bold line-clamp-1">{video.caption}</span>
                <span className="text-[10px] text-amber-400 font-semibold">Saved</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'liked' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {likedVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer group"
            >
              <img
                src={video.posterUrl || '/src/assets/images/hero_trending_showcase_1794373440007.jpg'}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                <span className="text-white text-xs font-bold line-clamp-1">{video.caption}</span>
                <span className="text-[10px] text-red-400 font-semibold">Liked</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveProfile}
            className="w-full max-w-md bg-[#0c0d14] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white">Edit Profile Details</h3>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Biography
              </label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
