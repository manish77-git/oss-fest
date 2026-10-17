'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Hash, 
  Terminal, 
  Sparkles, 
  BookOpen, 
  Plus, 
  Settings, 
  Mic, 
  MicOff, 
  Headphones, 
  ShieldCheck, 
  LogOut, 
  UserCheck,
  Bot,
  Layers,
  Code2,
  Bug,
  HelpCircle,
  FolderGit2
} from 'lucide-react';
import { CommunityServer, Channel, User } from '@/types';

interface ChannelSidebarProps {
  activeServer: CommunityServer;
  activeChannelId: string;
  onSelectChannel: (channelId: string) => void;
  currentUser: User;
  onOpenProfile: (user: User) => void;
  onLogout?: () => void;
  onOpenCreateContribution?: () => void;
}

export const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
  activeServer,
  activeChannelId,
  onSelectChannel,
  currentUser,
  onOpenProfile,
  onLogout,
  onOpenCreateContribution,
}) => {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [isServerMenuOpen, setIsServerMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  const toggleCategory = (catId: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const getChannelIcon = (channel: Channel) => {
    if (channel.type === 'ai-assistant') {
      return <Bot className="w-4 h-4 text-purple-400 shrink-0" />;
    }
    if (channel.name === 'bug-reports') {
      return <Bug className="w-4 h-4 text-rose-400 shrink-0" />;
    }
    if (channel.name === 'good-first-issues') {
      return <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (channel.name === 'feature-ideas' || channel.name === 'project-discussions') {
      return <FolderGit2 className="w-4 h-4 text-indigo-400 shrink-0" />;
    }
    if (channel.type === 'academic') {
      return <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    return <Hash className="w-4 h-4 text-slate-400 shrink-0" />;
  };

  return (
    <aside 
      aria-label="Channel navigation sidebar"
      className="w-[245px] md:w-[260px] bg-[#0f121a] border-r border-[#1a1f2e] flex flex-col justify-between h-screen select-none shrink-0"
    >
      {/* 1. Server Header with dropdown menu */}
      <div className="relative">
        <button
          onClick={() => setIsServerMenuOpen(!isServerMenuOpen)}
          className="w-full h-14 px-4 flex items-center justify-between border-b border-[#181d2a] hover:bg-[#141824] transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2 overflow-hidden text-left">
            <span className="font-bold text-white text-[15px] truncate tracking-tight">
              {activeServer.name}
            </span>
            {activeServer.isVerified && (
              <span title="Verified Campus Server">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              </span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform ${isServerMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Server Action Dropdown */}
        {isServerMenuOpen && (
          <div className="absolute top-14 left-2 right-2 bg-[#090b10] border border-[#22293d] rounded-lg shadow-2xl py-1.5 z-50">
            <div className="px-3 py-1.5 border-b border-[#1c2233]">
              <div className="text-xs font-semibold text-slate-200">{activeServer.name}</div>
              <div className="text-[11px] text-slate-400 truncate">{activeServer.description}</div>
            </div>
            {activeServer.id === 'srv_opensource' && onOpenCreateContribution && (
              <button
                onClick={() => {
                  setIsServerMenuOpen(false);
                  onOpenCreateContribution();
                }}
                className="w-full px-3 py-1.5 text-xs text-left text-indigo-400 hover:bg-indigo-950/40 hover:text-indigo-300 flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Submit Open-Source Contribution
              </button>
            )}
            <button
              onClick={() => {
                alert(`Invite link for ${activeServer.name} copied to clipboard!`);
                setIsServerMenuOpen(false);
              }}
              className="w-full px-3 py-1.5 text-xs text-left text-slate-300 hover:bg-[#151926] hover:text-white flex items-center gap-2"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              Invite Campus Peers
            </button>
            <button
              onClick={() => setIsServerMenuOpen(false)}
              className="w-full px-3 py-1.5 text-xs text-left text-slate-300 hover:bg-[#151926] hover:text-white flex items-center gap-2"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              Server Notifications
            </button>
          </div>
        )}
      </div>

      {/* 2. Channel Categories and Lists */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* Open-Source Fast Action Pill when inside Open-Source Lab */}
        {activeServer.id === 'srv_opensource' && onOpenCreateContribution && (
          <div className="px-1 mb-2">
            <button
              onClick={onOpenCreateContribution}
              className="w-full py-2 px-3 bg-gradient-to-r from-indigo-950/70 to-purple-950/70 hover:from-indigo-900/80 hover:to-purple-900/80 border border-indigo-700/40 hover:border-indigo-500/60 rounded-lg text-xs font-medium text-indigo-200 flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>New Contribution Card</span>
            </button>
          </div>
        )}

        {activeServer.categories.map((category) => {
          const isCollapsed = collapsedCategories[category.id];
          const categoryChannels = activeServer.channels.filter(ch => 
            category.channelIds.includes(ch.id)
          );

          return (
            <div key={category.id} className="space-y-0.5">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between px-1.5 py-1 text-[11px] font-bold text-slate-400 hover:text-slate-200 tracking-wider uppercase transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
                  )}
                  <span>{category.name}</span>
                </div>
              </button>

              {/* Channels in Category */}
              {!isCollapsed && (
                <div className="space-y-0.5 pt-0.5">
                  {categoryChannels.map((channel) => {
                    const isActive = activeChannelId === channel.id;
                    const isAi = channel.type === 'ai-assistant';

                    return (
                      <button
                        key={channel.id}
                        onClick={() => onSelectChannel(channel.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all group cursor-pointer ${
                          isActive
                            ? 'bg-[#1e2436] text-white shadow-sm font-semibold'
                            : 'text-slate-400 hover:bg-[#141824] hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {getChannelIcon(channel)}
                          <span className={`truncate ${isAi ? 'text-purple-300 group-hover:text-purple-200 font-semibold' : ''}`}>
                            {channel.name}
                          </span>
                        </div>

                        {channel.unreadCount && channel.unreadCount > 0 && !isActive ? (
                          <span className="min-w-[16px] h-4 px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {channel.unreadCount}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Bottom Current User Bar (Discord Signature Widget) */}
      <div className="h-[56px] bg-[#0b0e14] border-t border-[#181d2a] px-2 flex items-center justify-between">
        {/* User Avatar + Name (click to open profile) */}
        <button
          onClick={() => onOpenProfile(currentUser)}
          className="flex items-center gap-2.5 px-1 py-1 rounded-md hover:bg-[#151926] transition-colors cursor-pointer text-left max-w-[150px] overflow-hidden group"
          title="Open Profile Settings"
        >
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-8 h-8 rounded-full object-cover" 
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[#0b0e14]" />
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {currentUser.year}
            </div>
          </div>
        </button>

        {/* User Control Icons: Mic, Audio, Switch Profile */}
        <div className="flex items-center text-slate-400">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1.5 rounded hover:bg-[#151926] hover:text-slate-200 transition-colors ${isMuted ? 'text-red-400' : ''}`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsDeafened(!isDeafened)}
            className={`p-1.5 rounded hover:bg-[#151926] hover:text-slate-200 transition-colors ${isDeafened ? 'text-red-400' : ''}`}
            title={isDeafened ? 'Undeafen' : 'Deafen'}
          >
            <Headphones className="w-3.5 h-3.5" />
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded hover:bg-[#151926] hover:text-rose-400 text-slate-400 transition-colors"
              title="Sign Out of CampusConnect"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
