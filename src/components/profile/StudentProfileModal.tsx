'use client';

import React, { useState, useEffect } from 'react';
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
  LogOut,
  Edit3,
  Save,
  RotateCcw,
  Camera
} from 'lucide-react';
import { User, Department, StudentRole } from '@/types';

interface StudentProfileModalProps {
  user: User | null;
  onClose: () => void;
  onLogout?: () => void;
  isCurrentUser?: boolean;
  onUpdateProfile?: (updatedUser: User) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
];

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  user,
  onClose,
  onLogout,
  isCurrentUser,
  onUpdateProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [department, setDepartment] = useState<Department>('Computer Science');
  const [year, setYear] = useState<StudentRole>('Junior (3rd Yr)');
  const [college, setCollege] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setHandle(user.handle);
      setBio(user.bio);
      setDepartment(user.department);
      setYear(user.year);
      setCollege(user.college);
      setGithubUrl(user.githubUrl || '');
      setAvatar(user.avatar);
      setIsEditing(false);
      setSaveSuccess(false);
    }
  }, [user]);

  if (!user) return null;

  const isBot = user.id === 'usr_campus_ai';

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: User = {
      ...user,
      name: name.trim(),
      handle: handle.trim().replace(/^@/, '') || user.handle,
      bio: bio.trim(),
      department,
      year,
      college: college.trim() || user.college,
      githubUrl: githubUrl.trim() || undefined,
      avatar: avatar.trim() || user.avatar,
    };

    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none overflow-y-auto">
      <div className="bg-[#101420] border border-[#232c42] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Banner with gradient */}
        <div className="h-28 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 relative p-4 flex justify-between items-start">
          {isCurrentUser && !isBot && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/60 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          )}
          <div className="ml-auto">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Edit Mode Form */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="p-6 pt-0 relative flex-1 space-y-4">
            {/* Avatar picker */}
            <div className="relative -mt-12 mb-2 flex items-end gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={avatar || user.avatar} 
                alt="Avatar preview" 
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#101420] shadow-xl bg-[#141926]" 
              />
              <div className="flex-1 space-y-1">
                <span className="text-[11px] font-bold text-slate-300 block">Choose Avatar</span>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setAvatar(p)}
                      className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-transform cursor-pointer ${
                        avatar === p ? 'border-indigo-500 scale-105 ring-1 ring-indigo-400' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your Full Name"
                  className="w-full bg-[#151a28] border border-[#232c42] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Username Handle
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  required
                  placeholder="handle"
                  className="w-full bg-[#151a28] border border-[#232c42] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Department)}
                    className="w-full bg-[#151a28] border border-[#232c42] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Tech">Information Tech</option>
                    <option value="Electronics & Comm">Electronics &amp; Comm</option>
                    <option value="Mechanical Eng">Mechanical Eng</option>
                    <option value="Electrical Eng">Electrical Eng</option>
                    <option value="Civil Eng">Civil Eng</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Academic Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value as StudentRole)}
                    className="w-full bg-[#151a28] border border-[#232c42] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Freshman (1st Yr)">Freshman (1st Yr)</option>
                    <option value="Sophomore (2nd Yr)">Sophomore (2nd Yr)</option>
                    <option value="Junior (3rd Yr)">Junior (3rd Yr)</option>
                    <option value="Senior (4th Yr)">Senior (4th Yr)</option>
                    <option value="Master's / Postgrad">Master&apos;s / Postgrad</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  College / Institution
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="Apex Institute of Technology"
                  className="w-full bg-[#151a28] border border-[#232c42] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Bio / About
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="Write a brief student bio or areas of interest..."
                  className="w-full bg-[#151a28] border border-[#232c42] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/your-username"
                  className="w-full bg-[#151a28] border border-[#232c42] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1d2438]">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-xl bg-[#151a28] hover:bg-[#1f273d] text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* View Mode */
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
        )}
      </div>
    </div>
  );
};

