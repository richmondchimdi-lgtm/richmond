import React, { useState } from 'react';
import { Search, TrendingUp, Music, Sparkles, Play, Flame, Check, Plus, Volume2 } from 'lucide-react';
import { VideoFeedItem, User, ContentCategory } from '../types';
import { CREATORS } from '../data/mockData';
import { audioEngine } from '../utils/audioEngine';

interface DiscoverViewProps {
  videos: VideoFeedItem[];
  onSelectVideo: (video: VideoFeedItem) => void;
  onFollowToggle: (userId: string) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  videos,
  onSelectVideo,
  onFollowToggle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [playingSound, setPlayingSound] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Matrix' },
    { id: 'tech', label: 'AI & Cyber' },
    { id: 'anime', label: 'Anime & Aesthetic' },
    { id: 'music', label: 'Beats & Synths' },
    { id: 'fashion', label: 'Future Fashion' },
    { id: 'comedy', label: 'Comedy Skits' },
  ];

  const popularSounds = [
    { id: 's1', title: 'Cyber Euphoria (VIP Remix)', author: 'Maya x Kai Vance', uses: '842K' },
    { id: 's2', title: 'Neon Pulse Wave 128BPM', author: 'Kai Vance Beats', uses: '419K' },
    { id: 's3', title: 'Lofi Rain Reflections', author: 'Elena Neo', uses: '310K' },
    { id: 's4', title: 'Quantum Computing Logic', author: 'Silicon Audio', uses: '185K' },
  ];

  const creatorsList = Object.values(CREATORS);

  // Filter videos based on category and search query
  const filteredVideos = videos.filter((v) => {
    const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
    const matchesQuery =
      v.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.author.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.author.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const handleSoundToggle = (title: string) => {
    if (playingSound === title) {
      audioEngine.stopMusic();
      setPlayingSound(null);
    } else {
      audioEngine.setMuted(false);
      audioEngine.playMusicTrack(title);
      setPlayingSound(title);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 space-y-6 pb-24">
      {/* Search Header */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search creators, #hashtags, sounds, anime, tech..."
          className="w-full bg-[#0c0d14] border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-md"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Hero Trending Banner */}
      {!searchQuery && (
        <div className="relative rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-900 shadow-xl group">
          <img
            src="/src/assets/images/hero_trending_showcase_1794373440007.jpg"
            alt="Trending Showcase"
            className="w-full h-48 sm:h-64 object-cover object-center group-hover:scale-102 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trending Matrix Spotlight</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight font-display">
              Neon Heights Creator Festival 2026
            </h2>
            <p className="text-xs text-slate-300 max-w-xl line-clamp-1 mt-1">
              Over 2.4 million creators broadcasting live across Tokyo, London, and San Francisco.
            </p>
          </div>
        </div>
      )}

      {/* Category Pills (Interactive Filter Controls) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-[#0c0d14] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Popular Creators Rail */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Top Creators
          </span>
          <span className="text-[11px] text-purple-400 font-medium cursor-pointer hover:underline">
            View All
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {creatorsList.map((creator) => (
            <div
              key={creator.id}
              className="bg-[#0c0d14] border border-slate-800/80 rounded-2xl p-3 flex flex-col items-center text-center gap-2 hover:border-slate-700 transition-colors"
            >
              <div className="relative">
                <img
                  src={creator.avatar}
                  alt={creator.displayName}
                  className="w-14 h-14 rounded-full object-cover border border-purple-500/40"
                  referrerPolicy="no-referrer"
                />
                {creator.verified && (
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[9px] font-black">
                    ✓
                  </span>
                )}
              </div>

              <div className="min-w-0 w-full">
                <h4 className="text-xs font-bold text-white truncate">{creator.displayName}</h4>
                <span className="text-[10px] text-slate-400 truncate block">@{creator.username}</span>
              </div>

              <span className="text-[10px] text-slate-500 tabular-nums">
                {(creator.followersCount / 1000).toFixed(0)}k Followers
              </span>

              <button
                onClick={() => onFollowToggle(creator.id)}
                className={`w-full py-1.5 rounded-full text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  creator.isFollowing
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                }`}
              >
                {creator.isFollowing ? (
                  <>
                    <Check className="w-3 h-3" /> Following
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" /> Follow
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Sounds Strip */}
      <div className="bg-[#0c0d14] border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Music className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Trending Sounds
            </h3>
          </div>
          <span className="text-[11px] text-cyan-400 font-medium">Synced with Feed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {popularSounds.map((sound) => (
            <div
              key={sound.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => handleSoundToggle(sound.title)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    playingSound === sound.title
                      ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/40 animate-pulse'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {playingSound === sound.title ? <Volume2 className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                </button>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{sound.title}</h4>
                  <span className="text-[10px] text-slate-400 truncate block">{sound.author}</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 tabular-nums font-semibold shrink-0">
                {sound.uses} clips
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Instagram Explore Bento Grid */}
      <div>
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
          Explore Matrix ({filteredVideos.length} Posts)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {filteredVideos.map((video, idx) => {
            const isFeatured = idx % 5 === 0;

            return (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer bg-slate-900 border border-slate-800/80 hover:border-purple-500/60 transition-all ${
                  isFeatured ? 'col-span-2 row-span-2 h-72 sm:h-80' : 'h-36 sm:h-40'
                }`}
              >
                <img
                  src={video.posterUrl || '/src/assets/images/hero_trending_showcase_1794373440007.jpg'}
                  alt={video.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />

                {/* Overlay on hover / mobile */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-purple-300 border border-purple-500/20">
                      {video.category}
                    </span>
                    <Play className="w-3.5 h-3.5 text-white/80" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <img
                        src={video.author.avatar}
                        alt=""
                        className="w-4 h-4 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[11px] font-bold text-white truncate">
                        {video.author.username}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 line-clamp-1">
                      {video.caption}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 font-semibold tabular-nums">
                      <span>{(video.likesCount / 1000).toFixed(1)}k likes</span>
                      <span>{(video.commentsCount / 1000).toFixed(1)}k comments</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
