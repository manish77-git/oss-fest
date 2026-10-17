'use client';

import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Award, 
  ExternalLink, 
  GitBranch, 
  Globe, 
  GraduationCap, 
  Briefcase, 
  Mail, 
  Check, 
  Sparkles, 
  Bot,
  LogOut
} from 'lucide-react';
import { User } from '@/types';

interface StudentProfileModalProps {
  user: User | null;
  onClose: () => void;
  onLogout?: () => void;
  isCurrentUser?: boolean;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  user,
  onClose,
  onLogout,
  isCurrentUser,
}) => {
  if (!user) return null;

  const isBot = user.id === 'usr_campus_ai';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#101420] border border-[#232c42] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Banner with gradient */}
        <div className="h-28 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 relative p-4 flex justify-end">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar + Main info container */}
        <div className="px-6 pb-6 pt-0 relative flex-1">
          {/* Avatar floating over banner */}
          <div className="relative -mt-14 mb-3 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-[#101420] shadow-xl bg-[#141926]" 
            />
            {user.isVerified && (
              <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-indigo-600 border-2 border-[#101420] text-white flex items-center justify-center shadow">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* Name & Handles */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
                <span>{user.name}</span>
                {isBot && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    CAMPUS AI
                  </span>
                )}
              </h3>
              <p className="text-xs text-indigo-400 font-medium">@{user.handle}</p>
            </div>

            {/* Academic Karma Score Badge */}
            <div className="px-3 py-1 bg-amber-950/60 border border-amber-800 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{user.points} Karma</span>
            </div>
          </div>

          {/* Academic Dept & Year */}
          <div className="py-2.5 px-3 bg-[#151a28] rounded-xl border border-[#21293e] mb-4 space-y-1 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-medium text-white">
              <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{user.college}</span>
            </div>
            <div className="text-slate-400 pl-6">
              {user.department} · {user.year}
            </div>
            {user.company && (
              <div className="flex items-center gap-2 pt-1 border-t border-[#1e2538] text-emerald-400 font-semibold pl-1">
                <Briefcase className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Senior Placement: @{user.company}</span>
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="mb-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              About Student
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {user.bio}
            </p>
          </div>

          {/* Badges and Achievements */}
          {user.achievements && user.achievements.length > 0 && (
            <div className="mb-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Verified Badges
              </div>
              <div className="flex flex-wrap gap-1.5">
                {user.achievements.map((ach, i) => (
                  <span 
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#181f30] text-slate-300 border border-[#242e48]"
                  >
                    <Award className="w-3 h-3 text-amber-400" />
                    {ach}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links & Direct Actions */}
          <div className="pt-3 border-t border-[#1d2438] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-400">
              {user.githubUrl && (
                <a 
                  href={user.githubUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-[#151a28] hover:bg-[#1f273d] hover:text-white transition-colors flex items-center gap-1 text-xs"
                  title="GitHub Profile"
                >
                  <GitBranch className="w-4 h-4 text-slate-300" />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              )}
              {user.linkedinUrl && (
                <a 
                  href={user.linkedinUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-[#151a28] hover:bg-[#1f273d] hover:text-indigo-400 transition-colors flex items-center gap-1 text-xs"
                  title="LinkedIn Profile"
                >
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span className="hidden sm:inline">LinkedIn</span>
                </a>
              )}
              <span className="text-[11px] text-slate-400 truncate max-w-[150px]">{user.email}</span>
            </div>

            {isCurrentUser && onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
