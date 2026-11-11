export type ContentCategory = 'tech' | 'anime' | 'music' | 'comedy' | 'gaming' | 'fashion' | 'lifestyle';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  verified: boolean;
  followersCount: number;
  followingCount: number;
  totalLikes: number;
  streakDays?: number;
  isFollowing?: boolean;
  isCloseFriend?: boolean;
}

export interface VideoFeedItem {
  id: string;
  author: User;
  caption: string;
  tags: string[];
  musicTitle: string;
  musicAuthor: string;
  category: ContentCategory;
  videoUrl: string;
  posterUrl?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  durationSeconds: number;
}

export interface CommentItem {
  id: string;
  author: User;
  text: string;
  timestamp: string;
  likesCount: number;
  isLiked?: boolean;
}

export interface StoryItem {
  id: string;
  author: User;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  timestamp: string;
  expiresInHours: number;
  isCloseFriendsOnly: boolean;
  caption?: string;
  viewers: string[];
  reactions: Record<string, number>;
}

export interface SnapStreak {
  friendId: string;
  friend: User;
  days: number;
  hoursLeft: number;
  isActiveToday: boolean;
  lastSnapSentAt?: string;
}

export type DisappearingMode = 'off' | '10s' | '24h';

export interface ChatMessage {
  id: string;
  senderId: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'text' | 'image' | 'video' | 'snap' | 'audio';
  timestamp: string;
  read: boolean;
  reactions?: Record<string, string>;
  isSnap?: boolean;
  snapTimerSeconds?: number;
  snapOpened?: boolean;
  audioDuration?: number;
}

export interface Conversation {
  id: string;
  participant: User;
  unreadCount: number;
  streakDays: number;
  streakExpiringInHours: number;
  disappearingMode: DisappearingMode;
  messages: ChatMessage[];
  lastActive: string;
}

export interface AlgorithmVector {
  tech: number;
  anime: number;
  music: number;
  comedy: number;
  gaming: number;
  fashion: number;
  lifestyle: number;
  totalWatchSeconds: number;
  completedVideosCount: number;
  skippedVideosCount: number;
  likedCreators: string[];
}

export interface LiveStreamState {
  id: string;
  host: User;
  title: string;
  viewerCount: number;
  giftsReceived: {
    id: string;
    sender: string;
    giftName: string;
    icon: string;
    coins: number;
  }[];
  comments: {
    id: string;
    user: string;
    avatar: string;
    text: string;
  }[];
  battleScore?: { user: number; opponent: number };
}

export interface NotificationItem {
  id: string;
  type: 'like' | 'follow' | 'comment' | 'streak_alert' | 'gift' | 'mention';
  actor: User;
  text: string;
  timestamp: string;
  read: boolean;
  targetId?: string;
}
