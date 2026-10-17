'use client';

import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Compass, 
  Search, 
  Sparkles, 
  Terminal, 
  Code2, 
  Bot,
  Layers,
  Settings,
  HelpCircle
} from 'lucide-react';
import { CommunityServer, User } from '@/types';

interface ServerRailProps {
  servers: CommunityServer[];
  activeServerId: string;
  onSelectServer: (serverId: string) => void;
  onOpenCreateModal: () => void;
  onOpenDiscoverModal: () => void;
  onOpenSearchModal: () => void;
  onOpenProfile: (user: User) => void;
  currentUser: User;
  isAiDrawerOpen: boolean;
  onToggleAiDrawer: () => void;
}

export const ServerRail: React.FC<ServerRailProps> = ({
  servers,
  activeServerId,
  onSelectServer,
  onOpenCreateModal,
  onOpenDiscoverModal,
  onOpenSearchModal,
  onOpenProfile,
  currentUser,
  isAiDrawerOpen,
  onToggleAiDrawer,
}) => {
  const [hoveredServerId, setHoveredServerId] = useState<string | null>(null);

  const getServerIcon = (server: CommunityServer) => {
    if (server.id === 'srv_opensource') return <Terminal className="w-5 h-5 text-indigo-400" />;
    if (server.id === 'srv_cse') return <Code2 className="w-5 h-5 text-emerald-400" />;
    if (server.id === 'srv_sih') return <Layers className="w-5 h-5 text-amber-400" />;
    return <span className="font-bold text-sm tracking-wider">{server.shortName}</span>;
  };

  return (
    <nav 
      aria-label="Server navigation rail"
      className="w-[72px] bg-[#06070a] border-r border-[#151924] flex flex-col items-center py-3 select-none shrink-0 z-20 h-screen"
    >
      {/* 1. CampusConnect Home Logo */}
      <div className="relative group mb-2">
        <button
          onClick={() => onSelectServer('srv_campus')}
          className={`relative w-12 h-12 flex items-center justify-center transition-all duration-200 rounded-[24px] group-hover:rounded-[16px] ${
            activeServerId === 'srv_campus'
              ? 'rounded-[16px] bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-[#131722] text-indigo-400 hover:bg-indigo-600 hover:text-white'
          }`}
          title="CampusConnect Home"
        >
          <GraduationCap className="w-6 h-6" />
        </button>

        {/* Active Pill Indicator */}
        <span
          className={`absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 bg-white rounded-r-full transition-all duration-200 ${
            activeServerId === 'srv_campus'
              ? 'h-10'
              : 'h-0 group-hover:h-5'
          }`}
        />

        {/* Hover Tooltip */}
        <div className="absolute left-[78px] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0b0e14] border border-[#1e2436] text-white text-xs font-semibold rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
          CampusConnect Home (Apex Hub)
        </div>
      </div>

      {/* Decorative Separator */}
      <div className="w-8 h-[2px] bg-[#1a2030] rounded-full my-1.5" />

      {/* 2. AI Copilot Server / Quick Launcher */}
      <div className="relative group mb-2">
        <button
          onClick={onToggleAiDrawer}
          className={`relative w-12 h-12 flex items-center justify-center transition-all duration-200 rounded-[24px] group-hover:rounded-[16px] ${
            isAiDrawerOpen
              ? 'rounded-[16px] bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40 ring-2 ring-purple-400/50'
              : 'bg-[#151928] text-purple-400 hover:bg-gradient-to-tr hover:from-purple-600 hover:to-indigo-600 hover:text-white'
          }`}
          title="CampusAI Copilot Assistant"
        >
          <Sparkles className="w-5 h-5 animate-pulse-subtle" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#06070a]" />
        </button>

        {/* Hover Tooltip */}
        <div className="absolute left-[78px] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0b0e14] border border-purple-500/40 text-purple-200 text-xs font-semibold rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-purple-400" />
          CampusAI Copilot Assistant
        </div>
      </div>

      {/* 3. Joined Community Servers List */}
      <div className="flex-1 w-full flex flex-col items-center gap-2 overflow-y-auto overflow-x-hidden py-1 px-1">
        {servers.filter(s => s.isJoined && s.id !== 'srv_campus').map((server) => {
          const isActive = activeServerId === server.id;

          return (
            <div key={server.id} className="relative group">
              {/* Active Pill Indicator */}
              <span
                className={`absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 bg-white rounded-r-full transition-all duration-200 ${
                  isActive
                    ? 'h-10'
                    : 'h-0 group-hover:h-5'
                }`}
              />

              <button
                onClick={() => onSelectServer(server.id)}
                className={`relative w-12 h-12 flex items-center justify-center transition-all duration-200 rounded-[24px] group-hover:rounded-[16px] ${
                  isActive
                    ? 'rounded-[16px] bg-[#1d2335] text-white ring-2 ring-indigo-500/80 shadow-md shadow-indigo-500/20'
                    : 'bg-[#121622] text-slate-300 hover:bg-[#1a2030] hover:text-white'
                }`}
                title={server.name}
              >
                {getServerIcon(server)}

                {/* Unread Indicator Badge */}
                {server.unreadCount && server.unreadCount > 0 && !isActive ? (
                  <span className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#06070a]">
                    {server.unreadCount}
                  </span>
                ) : null}
              </button>

              {/* Tooltip */}
              <div className="absolute left-[78px] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0b0e14] border border-[#1e2436] text-white text-xs font-semibold rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                <div className="font-bold">{server.name}</div>
                <div className="text-[10px] text-slate-400 font-normal">{server.categoryType} · {server.memberCount} members</div>
              </div>
            </div>
          );
        })}

        {/* Add Community Action Button */}
        <div className="relative group mt-1">
          <button
            onClick={onOpenCreateModal}
            className="w-12 h-12 rounded-[24px] group-hover:rounded-[16px] bg-[#121622] hover:bg-emerald-600 text-emerald-400 hover:text-white flex items-center justify-center transition-all duration-200"
            title="Create a Community"
          >
            <Plus className="w-5 h-5" />
          </button>
          <div className="absolute left-[78px] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0b0e14] border border-emerald-500/40 text-emerald-200 text-xs font-semibold rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
            Create a Community
          </div>
        </div>

        {/* Discover Communities Button */}
        <div className="relative group">
          <button
            onClick={onOpenDiscoverModal}
            className="w-12 h-12 rounded-[24px] group-hover:rounded-[16px] bg-[#121622] hover:bg-indigo-600 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200"
            title="Discover Communities"
          >
            <Compass className="w-5 h-5" />
          </button>
          <div className="absolute left-[78px] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0b0e14] border border-[#1e2436] text-white text-xs font-semibold rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
            Discover Communities
          </div>
        </div>

        {/* Global Search Shortcut */}
        <div className="relative group">
          <button
            onClick={onOpenSearchModal}
            className="w-12 h-12 rounded-[24px] group-hover:rounded-[16px] bg-[#121622] hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200"
            title="Search Campus (Ctrl+K)"
          >
            <Search className="w-5 h-5" />
          </button>
          <div className="absolute left-[78px] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0b0e14] border border-[#1e2436] text-white text-xs font-semibold rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 flex items-center gap-1.5">
            Search Campus <kbd className="px-1.5 py-0.5 bg-black/40 text-[10px] rounded border border-slate-700 font-mono">Ctrl+K</kbd>
          </div>
        </div>
      </div>

      {/* 4. Bottom User Profile Button with status ring */}
      <div className="relative group pt-2 border-t border-[#151924] w-full flex justify-center">
        <button
          onClick={() => onOpenProfile(currentUser)}
          className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-indigo-500/50 hover:ring-indigo-400 transition-all cursor-pointer"
          title={`Signed in as ${currentUser.name}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-full h-full object-cover" 
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#06070a]" />
        </button>

        {/* Hover Tooltip */}
        <div className="absolute left-[78px] bottom-2 px-3 py-1.5 bg-[#0b0e14] border border-[#1e2436] text-white text-xs font-semibold rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
          <div className="font-bold flex items-center gap-1.5">
            {currentUser.name}
            <span className="px-1.5 py-0.2 text-[9px] bg-indigo-900/60 text-indigo-300 rounded border border-indigo-700">Online</span>
          </div>
          <div className="text-[10px] text-slate-400 font-normal">{currentUser.email}</div>
        </div>
      </div>
    </nav>
  );
};
