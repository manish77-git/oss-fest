'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Bot, 
  Crown, 
  Award, 
  Sparkles, 
  Circle,
  ExternalLink
} from 'lucide-react';
import { ServerMember, User } from '@/types';

interface MemberSidebarProps {
  members: ServerMember[];
  serverName: string;
  onOpenProfile: (user: User) => void;
  isOpen: boolean;
}

export const MemberSidebar: React.FC<MemberSidebarProps> = ({
  members,
  serverName,
  onOpenProfile,
  isOpen,
}) => {
  if (!isOpen) return null;

  // Group members by role category
  const categories: Array<ServerMember['roleCategory']> = [
    'AI & Automation',
    'Core Maintainers',
    'Mentors & Seniors',
    'Student Contributors',
  ];

  const getPresenceColor = (presence: ServerMember['presence']) => {
    switch (presence) {
      case 'online':
        return 'bg-emerald-500';
      case 'idle':
        return 'bg-amber-500';
      case 'dnd':
        return 'bg-rose-500';
      case 'offline':
        return 'bg-slate-500';
    }
  };

  return (
    <aside 
      aria-label="Server members list"
      className="w-[230px] md:w-[240px] bg-[#0f121a] border-l border-[#1a1f2e] flex flex-col h-screen select-none shrink-0 overflow-y-auto py-4 px-3"
    >
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-3">
        Members — {members.length}
      </div>

      <div className="space-y-4">
        {categories.map((category) => {
          const categoryMembers = members.filter((m) => m.roleCategory === category);
          if (categoryMembers.length === 0) return null;

          return (
            <div key={category} className="space-y-1">
              {/* Category Header */}
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center justify-between">
                <span>{category}</span>
                <span className="text-slate-400 font-semibold">{categoryMembers.length}</span>
              </div>

              {/* Members List */}
              <div className="space-y-0.5">
                {categoryMembers.map((member) => {
                  const isBot = member.user.id === 'usr_campus_ai';

                  return (
                    <button
                      key={member.user.id}
                      onClick={() => onOpenProfile(member.user)}
                      className="w-full px-2 py-1.5 rounded-md hover:bg-[#151926] transition-colors flex items-center gap-2.5 group cursor-pointer text-left"
                    >
                      {/* Avatar with Presence Dot */}
                      <div className="relative shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={member.user.avatar} 
                          alt={member.user.name} 
                          className="w-8 h-8 rounded-full object-cover" 
                        />
                        <span 
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#0f121a] ${getPresenceColor(member.presence)}`} 
                        />
                      </div>

                      {/* Name, Role & Custom Status */}
                      <div className="truncate min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`text-xs font-semibold truncate ${isBot ? 'text-purple-300 font-bold' : 'text-slate-200 group-hover:text-white'}`}>
                            {member.user.name}
                          </span>
                          {isBot && (
                            <span className="px-1 py-0.2 bg-purple-900/80 text-purple-200 text-[9px] font-bold rounded">
                              AI
                            </span>
                          )}
                          {member.roleCategory === 'Core Maintainers' && (
                            <span title="Core Maintainer">
                              <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                            </span>
                          )}
                        </div>

                        {member.customStatus ? (
                          <div className="text-[10px] text-slate-400 truncate">
                            {member.customStatus}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 truncate">
                            {member.roleName}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
