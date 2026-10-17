'use client';

import React from 'react';
import { Sparkles, Trophy, Calendar, TrendingUp, ArrowRight, UserPlus, ShieldCheck } from 'lucide-react';
import { User } from '@/types';

interface RightWidgetProps {
  onSelectTab: (tab: string) => void;
}

export const RightWidget: React.FC<RightWidgetProps> = ({ onSelectTab }) => {
  const topContributors = [
    { name: 'Priya Nambiar', role: '4th Yr · CSE', karma: 820, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', uploads: 14 },
    { name: 'Shreya Sundaram', role: '4th Yr · ECE', karma: 740, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', uploads: 9 },
    { name: 'Ananya Bose', role: '3rd Yr · IT (CR)', karma: 620, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', uploads: 11 },
  ];

  const upcomingEvents = [
    { title: 'SIH Internal Hackathon Deadline', date: 'Tomorrow, 11:59 PM', tag: 'Hackathon' },
    { title: 'CS401 Operating Systems Mid-Sem', date: 'Oct 24 · 09:30 AM', tag: 'Exam' },
    { title: 'Microsoft SDE Intern Pre-Placement Talk', date: 'Oct 26 · 05:00 PM', tag: 'Placement' },
  ];

  const trendingTags = [
    { tag: 'HackNight2026', postsCount: '84 posts' },
    { tag: 'OperatingSystemsPYQ', postsCount: '62 shares' },
    { tag: 'AmazonInternReview', postsCount: '41 reads' },
    { tag: 'Library24x7', postsCount: '29 posts' },
  ];

  return (
    <aside className="w-80 hidden xl:flex flex-col gap-6 py-6 px-4 h-screen sticky top-0 overflow-y-auto select-none border-l border-neutral-200 dark:border-neutral-800">
      {/* Campus Notice / Urgent Deadlines */}
      <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/40 dark:from-neutral-900/60 dark:to-purple-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Campus Deadlines</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
        </div>
        <div className="flex flex-col gap-2.5">
          {upcomingEvents.map((ev, idx) => (
            <div key={idx} className="bg-white/80 dark:bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
                <span>{ev.date}</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded text-[10px]">
                  {ev.tag}
                </span>
              </div>
              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-1">
                {ev.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Note Contributors Leaderboard (Incentivizing Open Source Knowledge Sharing) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-100">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Top Resource Heroes</span>
          </div>
          <button 
            onClick={() => onSelectTab('academics')}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
          >
            Vault <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {topContributors.map((c, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-black text-xs text-neutral-400 w-4 text-center">
                  #{idx + 1}
                </span>
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-neutral-800 dark:text-neutral-200 truncate">
                      {c.name}
                    </span>
                    <ShieldCheck className="w-3 h-3 text-indigo-500 shrink-0" />
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {c.role} • {c.uploads} notes shared
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  {c.karma}
                </span>
                <p className="text-[9px] text-neutral-400">pts</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Campus Topics */}
      <div className="flex flex-col gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-900">
        <div className="flex items-center gap-1.5 px-1 text-xs font-bold text-neutral-900 dark:text-neutral-100">
          <TrendingUp className="w-4 h-4 text-pink-500" />
          <span>Campus Trends</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {trendingTags.map((item, idx) => (
            <div 
              key={idx}
              className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/60 cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <p className="font-bold text-[11px] text-neutral-800 dark:text-neutral-200 truncate">
                #{item.tag}
              </p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                {item.postsCount}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-4 text-[11px] text-neutral-400 flex flex-col gap-1 px-1">
        <p>© 2026 CampusConnect • Open Source</p>
        <p>Built for College Communities & Academic Collaboration</p>
      </div>
    </aside>
  );
};
