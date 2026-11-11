import React from 'react';
import { Plus } from 'lucide-react';
import { StoryItem, User } from '../types';

interface StoriesBarProps {
  currentUser: User;
  stories: StoryItem[];
  onSelectStory: (story: StoryItem) => void;
  onAddStory: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  currentUser,
  stories,
  onSelectStory,
  onAddStory,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-3 px-3 bg-[#0c0d14]/80 border-b border-slate-800/60 backdrop-blur-sm">
      <div className="flex items-center gap-3.5 min-w-max">
        {/* Your Story Button */}
        <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={onAddStory}>
          <div className="relative">
            <div className="w-14 h-14 rounded-full p-[2px] bg-slate-800 ring-2 ring-slate-800/50 group-hover:ring-purple-500 transition-all">
              <img
                src={currentUser.avatar}
                alt={currentUser.displayName}
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-400 border-2 border-[#0c0d14] flex items-center justify-center text-white shadow-md">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-slate-300 max-w-[60px] truncate">
            Your Story
          </span>
        </div>

        {/* Stories from Friends & Creators */}
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={() => onSelectStory(story)}
            className="flex flex-col items-center gap-1.5 cursor-pointer group transition-transform active:scale-95"
          >
            <div className="relative">
              {/* Ring styling: Emerald Green for Close Friends, Neon Purple/Cyan for Standard */}
              <div
                className={`w-14 h-14 rounded-full p-[2.5px] transition-all group-hover:scale-105 ${
                  story.isCloseFriendsOnly
                    ? 'bg-gradient-to-tr from-emerald-500 via-green-400 to-teal-300 shadow-sm shadow-emerald-500/30'
                    : 'bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 shadow-sm shadow-purple-500/30'
                }`}
              >
                <div className="w-full h-full rounded-full p-[2px] bg-[#0c0d14]">
                  <img
                    src={story.author.avatar}
                    alt={story.author.displayName}
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Close Friend Star Badge */}
              {story.isCloseFriendsOnly && (
                <div 
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-[#0c0d14] flex items-center justify-center text-[8px] font-black text-black"
                  title="Close Friends Story"
                >
                  ★
                </div>
              )}
            </div>

            <span className="text-[11px] font-medium text-slate-200 max-w-[64px] truncate text-center">
              {story.author.username}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
