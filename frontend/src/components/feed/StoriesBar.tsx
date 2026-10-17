'use client';

import React, { useState } from 'react';
import { Plus, X, Heart, Send, Sparkles } from 'lucide-react';
import { CampusStory } from '@/types';

interface StoriesBarProps {
  stories: CampusStory[];
}

export const StoriesBar: React.FC<StoriesBarProps> = ({ stories }) => {
  const [activeStory, setActiveStory] = useState<CampusStory | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySent, setReplySent] = useState(false);

  const handleOpenStory = (story: CampusStory) => {
    setActiveStory(story);
    setReplySent(false);
    setReplyText('');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplySent(true);
    setTimeout(() => {
      setReplyText('');
      setReplySent(false);
    }, 2000);
  };

  return (
    <>
      <div className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 overflow-x-auto no-scrollbar shadow-2xs">
        <div className="flex items-center gap-4 min-w-max">
          {/* Your Story / Club Post Trigger */}
          <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className="relative w-16 h-16 rounded-full p-[2px] border-2 border-dashed border-indigo-400 dark:border-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="My Story"
                className="w-full h-full rounded-full object-cover"
              />
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center ring-2 ring-white dark:ring-neutral-950">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
              Your Story
            </span>
          </div>

          {/* Campus Club Stories */}
          {stories.map((story) => (
            <div
              key={story.id}
              onClick={() => handleOpenStory(story)}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div
                className={`w-16 h-16 rounded-full p-[2.5px] transition-transform duration-200 group-hover:scale-105 ${
                  story.hasUnseenStory
                    ? 'bg-gradient-to-tr from-amber-500 via-pink-500 to-indigo-600'
                    : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <div className="w-full h-full rounded-full p-[2px] bg-white dark:bg-neutral-950">
                  <img
                    src={story.authorAvatar}
                    alt={story.authorName}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200 max-w-[70px] truncate text-center">
                {story.authorName}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Instagram-style Story Modal Viewer */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md h-[80vh] max-h-[720px] bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-neutral-800">
            {/* Top Progress Bar */}
            <div className="absolute top-0 left-0 right-0 p-3 z-20 bg-gradient-to-b from-black/70 to-transparent">
              <div className="w-full bg-white/30 h-1 rounded-full overflow-hidden mb-3">
                <div className="bg-white h-full w-3/4 animate-pulse rounded-full" />
              </div>

              {/* Story Author Info */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeStory.authorAvatar}
                    alt={activeStory.authorName}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white/50"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs">{activeStory.authorName}</span>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-medium">
                        {activeStory.authorBadge}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/70">{activeStory.timeAgo}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStory(null)}
                  className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Story Image */}
            <div className="w-full h-full relative">
              <img
                src={activeStory.storyImage}
                alt="Story"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent pointer-events-none" />
            </div>

            {/* Story Caption & Interaction Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col gap-3">
              <p className="text-white text-sm font-medium drop-shadow-md">
                {activeStory.caption}
              </p>

              {replySent ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Reply sent to {activeStory.authorName}!</span>
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${activeStory.authorName}...`}
                    className="flex-1 bg-white/10 hover:bg-white/20 focus:bg-white/20 border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-white/60 focus:outline-hidden focus:ring-1 focus:ring-white transition-all"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
