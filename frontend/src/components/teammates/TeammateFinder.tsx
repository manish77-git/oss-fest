'use client';

import React, { useState } from 'react';
import { Users, Sparkles, Plus, Clock, CheckCircle, X, Send, Award, Tag } from 'lucide-react';
import { TeammateListing, User } from '@/types';

interface TeammateFinderProps {
  listings: TeammateListing[];
  currentUser: User;
}

export const TeammateFinder: React.FC<TeammateFinderProps> = ({ listings, currentUser }) => {
  const [teamList, setTeamList] = useState<TeammateListing[]>(listings);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [applyModalListing, setApplyModalListing] = useState<TeammateListing | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [applicationPitch, setApplicationPitch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New listing state
  const [newTitle, setNewTitle] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newRoles, setNewRoles] = useState('');
  const [newSkills, setNewSkills] = useState('');

  const rolesFilter = ['All', 'Frontend', 'Backend', 'UI/UX Designer', 'Mobile App', 'Computer Vision', 'Robotics'];

  const filteredListings = teamList.filter((item) => {
    if (selectedRoleFilter === 'All') return true;
    return item.rolesNeeded.some((r) => r.toLowerCase().includes(selectedRoleFilter.toLowerCase())) ||
           item.skillsRequired.some((s) => s.toLowerCase().includes(selectedRoleFilter.toLowerCase()));
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyModalListing) return;

    setToastMessage(`Application sent to ${applyModalListing.author.name} for "${applyModalListing.title}"!`);
    setApplyModalListing(null);
    setApplicationPitch('');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newListing: TeammateListing = {
      id: `team_${Date.now()}`,
      author: currentUser,
      title: newTitle,
      competitionOrGoal: newGoal || 'Hackathon / Project',
      description: newDesc,
      rolesNeeded: newRoles.split(',').map((r) => r.trim()).filter(Boolean),
      skillsRequired: newSkills.split(',').map((s) => s.trim()).filter(Boolean),
      currentTeamSize: 1,
      maxTeamSize: 4,
      deadline: 'In 2 weeks',
      createdAt: 'Just now',
    };

    setTeamList([newListing, ...teamList]);
    setCreateModalOpen(false);
    setNewTitle('');
    setNewGoal('');
    setNewDesc('');
    setNewRoles('');
    setNewSkills('');
    setToastMessage('Teammate search posted on campus board!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-950 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-emerald-200 mb-2 border border-white/10">
            <Users className="w-3.5 h-3.5" />
            <span>Campus Collaboration Matchmaker</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Find Teammates for Hackathons & Projects
          </h2>
          <p className="text-xs text-emerald-100/80 mt-1 leading-relaxed">
            Need a designer for Smart India Hackathon? Or a hardware engineer for your robotics capstone? Post openings or join existing ambitious campus squads.
          </p>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Post Teammate Opening</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Role Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
          Looking for:
        </span>
        {rolesFilter.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRoleFilter(role)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedRoleFilter === role
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Listings Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredListings.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-800 transition-all flex flex-col justify-between gap-4"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {item.competitionOrGoal}
                  </span>
                  <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Deadline: {item.deadline}
                  </span>
                </div>

                {/* Team size progress */}
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                  <div className="w-24 bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${(item.currentTeamSize / item.maxTeamSize) * 100}%` }}
                    />
                  </div>
                  <span>
                    {item.currentTeamSize}/{item.maxTeamSize} Members
                  </span>
                </div>
              </div>

              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                {item.description}
              </p>

              {/* Roles Needed Badges */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">
                  Roles Needed:
                </span>
                {item.rolesNeeded.map((r, rIdx) => (
                  <span
                    key={rIdx}
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900"
                  >
                    {r}
                  </span>
                ))}
              </div>

              {/* Tech Stack Skills */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">
                  Skills:
                </span>
                {item.skillsRequired.map((s, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Author info & Apply action */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={item.author.avatar}
                  alt={item.author.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div className="text-xs">
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {item.author.name}
                  </span>
                  <span className="text-neutral-400 ml-1">({item.author.department})</span>
                </div>
              </div>

              <button
                onClick={() => setApplyModalListing(item)}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors active:scale-95 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Join Team</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Apply to Team Modal */}
      {applyModalListing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Apply to: {applyModalListing.title}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Lead: {applyModalListing.author.name} ({applyModalListing.competitionOrGoal})
                </p>
              </div>
              <button onClick={() => setApplyModalListing(null)} className="text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1 block">
                  Why are you interested and what role will you take?
                </label>
                <textarea
                  required
                  value={applicationPitch}
                  onChange={(e) => setApplicationPitch(e.target.value)}
                  placeholder="e.g. I have 2 years of React experience and built an edtech app during last semester. I can handle state management and UI design..."
                  rows={4}
                  className="w-full p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-[11px] text-neutral-500">
                Your profile ({currentUser.name}, {currentUser.year}) and GitHub links will be attached automatically.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModalListing(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Send Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Teammate Search Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                <span>Post Teammate Opening</span>
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1 block">
                  Project / Hackathon Title
                </label>
                <input
                  required
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. AI-driven Smart Water Grid for National Hackathon"
                  className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1 block">
                  Competition or Purpose
                </label>
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="e.g. Smart India Hackathon 2026 / 8th Sem Capstone"
                  className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1 block">
                  Brief Project Overview
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe what you are building and why..."
                  className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1 block">
                    Roles Needed (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newRoles}
                    onChange={(e) => setNewRoles(e.target.value)}
                    placeholder="e.g. Frontend Dev, UI/UX"
                    className="w-full p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1 block">
                    Required Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newSkills}
                    onChange={(e) => setNewSkills(e.target.value)}
                    placeholder="e.g. React, Next.js, Figma"
                    className="w-full p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Publish Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
