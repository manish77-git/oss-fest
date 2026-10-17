'use client';

import React from 'react';
import { 
  GraduationCap, 
  Home, 
  BookOpen, 
  Users, 
  UserCheck, 
  PlusCircle, 
  Bookmark, 
  ShieldCheck,
  Sparkles,
  MessageSquare,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { User } from '@/types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User;
  onOpenCreateModal: () => void;
  onOpenUploadModal: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount?: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenCreateModal,
  onOpenUploadModal,
  onOpenNotifications,
  unreadNotificationsCount = 2,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const navItems = [
    { id: 'feed', label: 'Campus Feed', icon: Home, badge: null },
    { id: 'academics', label: 'Academic Vault', icon: BookOpen, badge: '5 New' },
    { id: 'mentors', label: 'Senior Connect', icon: UserCheck, badge: null },
    { id: 'teammates', label: 'Teammate Finder', icon: Users, badge: 'Hackathon' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: '1' },
    { id: 'saved', label: 'Saved Resources', icon: Bookmark, badge: null },
    { id: 'profile', label: 'My Profile', icon: GraduationCap, badge: null },
  ];

  return (
    <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col justify-between h-screen sticky top-0 px-4 py-6 select-none shrink-0">
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col gap-2 px-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentTab('feed')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  CampusConnect
                </span>
                <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                  Instagram for Academics
                </p>
              </div>
            </div>

            {/* Notification Bell Shortcut */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-neutral-950" />
              )}
            </button>
          </div>

          {/* Campus Gating Pill */}
          <div className="mt-2 py-1.5 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{currentUser.college}</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-neutral-700 text-white dark:bg-neutral-200 dark:text-neutral-900'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Action Buttons */}
        <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-900">
          <button
            onClick={onOpenCreateModal}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/25 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Post</span>
          </button>
          
          <button
            onClick={onOpenUploadModal}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-semibold text-xs border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Upload Notes / PYQs</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Dark / Light Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            {isDarkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>{isDarkMode ? 'Dark Theme' : 'Light Theme'}</span>
          </div>
          <span className="text-[10px] text-neutral-400">Toggle</span>
        </button>

        {/* User Footer Card */}
        <div 
          onClick={() => setCurrentTab('profile')}
          className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                  {currentUser.name}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {currentUser.year}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0 pl-1">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
              <Sparkles className="w-3 h-3" />
              {currentUser.points}
            </span>
            <span className="text-[9px] text-neutral-400 uppercase">Karma</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
