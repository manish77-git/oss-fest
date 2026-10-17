'use client';

import React from 'react';
import { ShieldCheck, School, Users, Info } from 'lucide-react';
import { User } from '@/types';

interface CampusVerificationBannerProps {
  currentUser: User;
  onSwitchUser: (userIndex: number) => void;
}

export const CampusVerificationBanner: React.FC<CampusVerificationBannerProps> = ({
  currentUser,
  onSwitchUser,
}) => {
  return (
    <div className="w-full bg-gradient-to-r from-indigo-900 via-indigo-950 to-neutral-900 border-b border-indigo-800/40 px-4 py-2 text-white flex items-center justify-between flex-wrap gap-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
        </span>
        <span>
          <strong className="text-white">Campus-Exclusive Network:</strong> Access strictly restricted to verified <span className="font-mono text-indigo-300">@{currentUser.email.split('@')[1]}</span> students.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-neutral-400 hidden sm:inline">
          Demo Student Persona:
        </span>
        <button
          onClick={() => onSwitchUser(0)}
          className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
            currentUser.id === 'usr_me'
              ? 'bg-indigo-600 text-white ring-1 ring-white/50'
              : 'bg-white/10 hover:bg-white/20 text-neutral-300'
          }`}
        >
          Aarav (Junior · CSE)
        </button>
        <button
          onClick={() => onSwitchUser(1)}
          className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
            currentUser.id === 'usr_priya'
              ? 'bg-indigo-600 text-white ring-1 ring-white/50'
              : 'bg-white/10 hover:bg-white/20 text-neutral-300'
          }`}
        >
          Priya (Senior · Microsoft)
        </button>
      </div>
    </div>
  );
};
