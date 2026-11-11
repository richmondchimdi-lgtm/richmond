/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Sparkles, 
  Compass, 
  PlusSquare, 
  MessageSquare, 
  User as UserIcon,
  Radio,
  BrainCircuit,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { 
  User, 
  VideoFeedItem as IVideoItem, 
  StoryItem, 
  SnapStreak, 
  Conversation, 
  ChatMessage, 
  NotificationItem, 
  ContentCategory 
} from './types';

import { 
  CURRENT_USER, 
  INITIAL_VIDEOS, 
  INITIAL_STORIES, 
  INITIAL_STREAKS, 
  INITIAL_CONVERSATIONS, 
  INITIAL_NOTIFICATIONS,
  CREATORS 
} from './data/mockData';

import { recommendationEngine } from './services/recommendationEngine';
import { audioEngine } from './utils/audioEngine';

// Components
import { Navigation } from './components/Navigation';
import { StoriesBar } from './components/StoriesBar';
import { StoryViewer } from './components/StoryViewer';
import { VideoFeedItem } from './components/VideoFeedItem';
import { CommentsDrawer } from './components/CommentsDrawer';
import { ShareModal } from './components/ShareModal';
import { SnapStreaks } from './components/SnapStreaks';
import { CameraStudio } from './components/CameraStudio';
import { MessagingView } from './components/MessagingView';
import { DiscoverView } from './components/DiscoverView';
import { ProfileView } from './components/ProfileView';
import { LiveStreamModal } from './components/LiveStreamModal';
import { AlgorithmInspector } from './components/AlgorithmInspector';
import { AdminDashboard } from './components/AdminDashboard';
import { NotificationsModal } from './components/NotificationsModal';

export default function App() {
  // Main Navigation Tab
  const [currentTab, setCurrentTab] = useState<'home' | 'discover' | 'create' | 'messages' | 'profile'>('home');
  const [feedMode, setFeedMode] = useState<'forYou' | 'following'>('forYou');

  // Core App State
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [videos, setVideos] = useState<IVideoItem[]>(() => recommendationEngine.rankFeed(INITIAL_VIDEOS));
  const [stories, setStories] = useState<StoryItem[]>(INITIAL_STORIES);
  const [streaks, setStreaks] = useState<SnapStreak[]>(INITIAL_STREAKS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Active Video Index in Vertical Feed
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const feedContainerRef = useRef<HTMLDivElement | null>(null);

  // Modals & Overlays
  const [activeStory, setActiveStory] = useState<StoryItem | null>(null);
  const [activeCommentVideo, setActiveCommentVideo] = useState<IVideoItem | null>(null);
  const [activeShareVideo, setActiveShareVideo] = useState<IVideoItem | null>(null);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [showAlgoInspector, setShowAlgoInspector] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Responsive Viewport Frame Toggle (Phone Frame vs Wide Desktop)
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);

  // Re-rank feed whenever recommendation engine learns or is reset
  const handleRefreshFeed = () => {
    setVideos(recommendationEngine.rankFeed(INITIAL_VIDEOS));
    setCurrentVideoIndex(0);
    if (feedContainerRef.current) {
      feedContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Keyboard navigation for vertical video feed (Arrow Up / Down, L for like)
  useEffect(() => {
    if (currentTab !== 'home') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollNextVideo();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollPrevVideo();
      } else if (e.key.toLowerCase() === 'l') {
        const cur = videos[currentVideoIndex];
        if (cur) handleLikeToggle(cur.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTab, currentVideoIndex, videos]);

  const scrollNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      const nextIdx = currentVideoIndex + 1;
      setCurrentVideoIndex(nextIdx);
      feedContainerRef.current?.children[nextIdx]?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollPrevVideo = () => {
    if (currentVideoIndex > 0) {
      const prevIdx = currentVideoIndex - 1;
      setCurrentVideoIndex(prevIdx);
      feedContainerRef.current?.children[prevIdx]?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Detect scroll position in vertical snap feed to update active video
  const handleFeedScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const height = container.clientHeight;
    if (height <= 0) return;
    const index = Math.round(container.scrollTop / height);
    if (index !== currentVideoIndex && index >= 0 && index < videos.length) {
      setCurrentVideoIndex(index);
    }
  };

  // Like Toggle
  const handleLikeToggle = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const nextLiked = !v.isLiked;
          if (nextLiked) {
            recommendationEngine.recordLike(v.category, v.author.id);
          }
          return {
            ...v,
            isLiked: nextLiked,
            likesCount: nextLiked ? v.likesCount + 1 : v.likesCount - 1,
          };
        }
        return v;
      })
    );
  };

  // Save / Bookmark Toggle
  const handleSaveToggle = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const nextSaved = !v.isSaved;
          if (nextSaved) {
            recommendationEngine.recordSave(v.category);
          }
          return {
            ...v,
            isSaved: nextSaved,
            savesCount: nextSaved ? v.savesCount + 1 : v.savesCount - 1,
          };
        }
        return v;
      })
    );
  };

  // Follow Creator Toggle
  const handleFollowToggle = (authorId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.author.id === authorId) {
          const nextFollowing = !v.author.isFollowing;
          return {
            ...v,
            author: { ...v.author, isFollowing: nextFollowing },
          };
        }
        return v;
      })
    );
    audioEngine.playLikeSound();
  };

  // Send Direct Message
  const handleSendMessage = (conversationId: string, message: Partial<ChatMessage>) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const newMsg: ChatMessage = {
            id: `msg_${Date.now()}`,
            senderId: currentUser.id,
            text: message.text,
            mediaType: message.mediaType || 'text',
            mediaUrl: message.mediaUrl,
            audioDuration: message.audioDuration,
            timestamp: 'Just now',
            read: true,
            isSnap: message.isSnap,
            snapTimerSeconds: message.snapTimerSeconds,
            snapOpened: false,
          };
          return {
            ...conv,
            messages: [...conv.messages, newMsg],
            lastActive: 'Just now',
          };
        }
        return conv;
      })
    );
  };

  // Publish Snap to Friend (Boost Streak 🔥)
  const handleSendSnapToFriend = (friendId: string, mediaUrl: string, timerSeconds: number) => {
    // 1. Add snap message to conversation
    const conv = conversations.find((c) => c.participant.id === friendId);
    if (conv) {
      handleSendMessage(conv.id, {
        isSnap: true,
        mediaUrl,
        snapTimerSeconds: timerSeconds,
        text: 'Sent a Snap 🔥',
      });
    }

    // 2. Boost Snap Streak & reset expiring timer
    setStreaks((prev) =>
      prev.map((s) => {
        if (s.friendId === friendId) {
          return {
            ...s,
            days: s.days + 1,
            hoursLeft: 24,
            isActiveToday: true,
            lastSnapSentAt: 'Just now',
          };
        }
        return s;
      })
    );
  };

  // Publish Story
  const handlePublishStory = (mediaUrl: string, caption: string, isCloseFriends: boolean) => {
    const newStory: StoryItem = {
      id: `story_${Date.now()}`,
      author: currentUser,
      mediaUrl,
      mediaType: 'image',
      timestamp: 'Just now',
      expiresInHours: 24,
      isCloseFriendsOnly: isCloseFriends,
      caption,
      viewers: [],
      reactions: { '🔥': 1 },
    };
    setStories([newStory, ...stories]);
  };

  // Publish Feed Video/Photo
  const handlePublishFeed = (mediaUrl: string, caption: string, category: string, music: string) => {
    const newVideo: IVideoItem = {
      id: `vid_${Date.now()}`,
      author: currentUser,
      caption,
      tags: ['vyro', 'newdrop', 'future'],
      musicTitle: music,
      musicAuthor: currentUser.displayName,
      category: (category as ContentCategory) || 'fashion',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-neon-lights-on-her-face-41315-large.mp4',
      posterUrl: mediaUrl,
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      savesCount: 0,
      isLiked: true,
      durationSeconds: 15,
    };
    setVideos([newVideo, ...videos]);
    setCurrentTab('home');
    setCurrentVideoIndex(0);
  };

  // Add Comment
  const handleAddComment = (videoId: string, text: string) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, commentsCount: v.commentsCount + 1 } : v))
    );
    recommendationEngine.recordSave('fashion'); // interaction signal
  };

  // Unread counts
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const highestStreak = Math.max(...streaks.map((s) => s.days), 0);

  // Filter feed videos based on For You vs Following
  const displayedVideos = feedMode === 'forYou' 
    ? videos 
    : videos.filter((v) => v.author.isFollowing || v.author.id === currentUser.id);

  return (
    <div className="min-h-screen bg-[#08090E] text-slate-100 flex flex-col justify-between selection:bg-purple-600 selection:text-white">
      {/* Container wrapper: switches between Wide Desktop & Mobile Phone Frame */}
      <div className={`w-full mx-auto flex-1 flex flex-col transition-all duration-300 ${
        isPhoneFrame ? 'max-w-[420px] my-4 rounded-[40px] border-4 border-slate-800 shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden bg-[#0c0d14]' : 'max-w-7xl'
      }`}>
        
        {/* Navigation Bar */}
        <Navigation
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenLive={() => setShowLiveStream(true)}
          onOpenAlgo={() => setShowAlgoInspector(true)}
          onOpenNotifications={() => setShowNotifications(true)}
          onOpenAdmin={() => setShowAdmin(true)}
          unreadMessagesCount={unreadMessagesCount}
          unreadNotifsCount={unreadNotifsCount}
          highestStreak={highestStreak}
          isPhoneFrame={isPhoneFrame}
          setIsPhoneFrame={setIsPhoneFrame}
        />

        {/* MAIN VIEW CONTENT CONTAINER */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* TAB 1: HOME FEED (TikTok + Snapchat Hybrid) */}
          {currentTab === 'home' && (
            <div className="flex-1 flex flex-col relative w-full h-[calc(100vh-125px)] overflow-hidden">
              {/* Stories Bar (Snapchat & Instagram style) */}
              <div className="shrink-0 z-20">
                <StoriesBar
                  currentUser={currentUser}
                  stories={stories}
                  onSelectStory={(story) => setActiveStory(story)}
                  onAddStory={() => setCurrentTab('create')}
                />
              </div>

              {/* Feed Header Tabs: For You vs Following */}
              <div className="absolute top-20 left-0 right-0 z-20 flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 pointer-events-auto">
                  <button
                    onClick={() => {
                      setFeedMode('following');
                      setCurrentVideoIndex(0);
                    }}
                    className={`text-xs font-bold transition-colors ${
                      feedMode === 'following' ? 'text-white' : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    Following
                  </button>
                  <span className="text-white/30 text-xs">|</span>
                  <button
                    onClick={() => {
                      setFeedMode('forYou');
                      setCurrentVideoIndex(0);
                    }}
                    className={`text-xs font-bold transition-colors flex items-center gap-1 ${
                      feedMode === 'forYou' ? 'text-purple-400 font-extrabold' : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    For You
                  </button>
                </div>
              </div>

              {/* Quick Arrow Navigators on Desktop */}
              <div className="hidden lg:flex flex-col gap-2 absolute right-6 top-1/2 -translate-y-1/2 z-30">
                <button
                  onClick={scrollPrevVideo}
                  disabled={currentVideoIndex === 0}
                  className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white border border-white/15 flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all shadow-lg"
                  title="Previous Video (Up Arrow)"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <button
                  onClick={scrollNextVideo}
                  disabled={currentVideoIndex === displayedVideos.length - 1}
                  className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white border border-white/15 flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all shadow-lg"
                  title="Next Video (Down Arrow)"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              {/* Vertical Snapping Video Feed */}
              <div
                ref={feedContainerRef}
                onScroll={handleFeedScroll}
                className="flex-1 w-full max-w-md mx-auto snap-feed overflow-y-auto no-scrollbar relative"
              >
                {displayedVideos.map((video, idx) => (
                  <div key={video.id} className="w-full h-full snap-card">
                    <VideoFeedItem
                      video={video}
                      isActive={idx === currentVideoIndex}
                      onLikeToggle={handleLikeToggle}
                      onSaveToggle={handleSaveToggle}
                      onFollowToggle={handleFollowToggle}
                      onOpenComments={(v) => setActiveCommentVideo(v)}
                      onOpenShare={(v) => setActiveShareVideo(v)}
                      onTagClick={(tag) => {
                        setCurrentTab('discover');
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DISCOVER & EXPLORE */}
          {currentTab === 'discover' && (
            <DiscoverView
              videos={videos}
              onSelectVideo={(video) => {
                const idx = videos.findIndex((v) => v.id === video.id);
                if (idx !== -1) {
                  setCurrentVideoIndex(idx);
                  setCurrentTab('home');
                }
              }}
              onFollowToggle={handleFollowToggle}
            />
          )}

          {/* TAB 3: CAMERA STUDIO (Snapchat AR Filters & Streaks) */}
          {currentTab === 'create' && (
            <CameraStudio
              currentUser={currentUser}
              streaks={streaks}
              onPublishStory={handlePublishStory}
              onPublishFeed={handlePublishFeed}
              onSendSnapToFriend={handleSendSnapToFriend}
              onClose={() => setCurrentTab('home')}
            />
          )}

          {/* TAB 4: MESSAGING & SNAPS */}
          {currentTab === 'messages' && (
            <div className="w-full max-w-4xl mx-auto px-4 py-4 space-y-4 pb-20">
              {/* Snap Streaks Showcase Card */}
              <SnapStreaks
                streaks={streaks}
                onSendSnapToFriend={(friendId) => {
                  setCurrentTab('create');
                }}
              />

              {/* Chat View */}
              <MessagingView
                conversations={conversations}
                currentUser={currentUser}
                onSendMessage={handleSendMessage}
                onOpenSnapCamera={(friendId) => {
                  setCurrentTab('create');
                }}
              />
            </div>
          )}

          {/* TAB 5: PROFILE */}
          {currentTab === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              onUpdateUser={(updated) => setCurrentUser((prev) => ({ ...prev, ...updated }))}
              onSwitchUser={(user) => {
                setCurrentUser(user);
                audioEngine.playWhoosh();
              }}
              userVideos={videos.filter((v) => v.author.id === currentUser.id || v.author.id === 'usr_me')}
              savedVideos={videos.filter((v) => v.isSaved)}
              likedVideos={videos.filter((v) => v.isLiked)}
              onSelectVideo={(video) => {
                const idx = videos.findIndex((v) => v.id === video.id);
                if (idx !== -1) {
                  setCurrentVideoIndex(idx);
                  setCurrentTab('home');
                }
              }}
            />
          )}
        </main>
      </div>

      {/* OVERLAY MODALS */}

      {/* 1. Fullscreen Story Viewer */}
      {activeStory && (
        <StoryViewer
          story={activeStory}
          onClose={() => setActiveStory(null)}
          onReply={(authorId, text) => {
            const conv = conversations.find((c) => c.participant.id === authorId);
            if (conv) {
              handleSendMessage(conv.id, { text: `Replied to story: "${text}"` });
            }
          }}
          onReact={(storyId, emoji) => {
            setStories((prev) =>
              prev.map((s) => {
                if (s.id === storyId) {
                  return {
                    ...s,
                    reactions: {
                      ...s.reactions,
                      [emoji]: (s.reactions[emoji] || 0) + 1,
                    },
                  };
                }
                return s;
              })
            );
          }}
        />
      )}

      {/* 2. TikTok Comments Drawer */}
      {activeCommentVideo && (
        <CommentsDrawer
          video={activeCommentVideo}
          currentUser={currentUser}
          onClose={() => setActiveCommentVideo(null)}
          onAddComment={handleAddComment}
        />
      )}

      {/* 3. Share Modal */}
      {activeShareVideo && (
        <ShareModal
          video={activeShareVideo}
          onClose={() => setActiveShareVideo(null)}
          onSendToFriend={(friendId, video) => {
            const conv = conversations.find((c) => c.participant.id === friendId);
            if (conv) {
              handleSendMessage(conv.id, {
                text: `Check out @${video.author.username}'s video: "${video.caption}" 🔥`,
              });
            }
          }}
        />
      )}

      {/* 4. Live Stream Broadcast Simulator */}
      {showLiveStream && (
        <LiveStreamModal
          currentUser={currentUser}
          onClose={() => setShowLiveStream(false)}
        />
      )}

      {/* 5. Algorithm Inspector & Bias Tuner */}
      {showAlgoInspector && (
        <AlgorithmInspector
          onClose={() => setShowAlgoInspector(false)}
          onRefreshFeed={handleRefreshFeed}
        />
      )}

      {/* 6. Administrator Command Dashboard */}
      {showAdmin && (
        <AdminDashboard
          onClose={() => setShowAdmin(false)}
          videos={videos}
          onRemoveVideo={(id) => {
            setVideos((prev) => prev.filter((v) => v.id !== id));
          }}
        />
      )}

      {/* 7. Notifications Modal */}
      {showNotifications && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkAllRead={() => {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          }}
          onNotificationClick={(notif) => {
            setNotifications((prev) =>
              prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
            );
            if (notif.type === 'streak_alert') {
              setCurrentTab('messages');
            } else {
              setCurrentTab('home');
            }
            setShowNotifications(false);
          }}
        />
      )}
    </div>
  );
}
