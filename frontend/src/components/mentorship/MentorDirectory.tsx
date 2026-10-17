'use client';

import React, { useState } from 'react';
import { 
  UserCheck, 
  Briefcase, 
  Star, 
  MessageSquare, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  ExternalLink,
  Award,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { Mentor, PlacementDebrief, User } from '@/types';

interface MentorDirectoryProps {
  mentors: Mentor[];
  debriefs: PlacementDebrief[];
  currentUser: User;
}

export const MentorDirectory: React.FC<MentorDirectoryProps> = ({ mentors, debriefs, currentUser }) => {
  const [activeSubTab, setActiveSubTab] = useState<'mentors' | 'debriefs'>('mentors');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [bookingTopic, setBookingTopic] = useState('');
  const [bookingTime, setBookingTime] = useState('Tomorrow 6:00 PM');
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const domains = ['All', 'Software Engineering', 'Open Source / GSoC', 'FinTech & Quant', 'GATE Preparation'];

  const filteredMentors = mentors.filter((m) => {
    if (selectedDomain === 'All') return true;
    return m.domains.some((d) => d.toLowerCase().includes(selectedDomain.toLowerCase()));
  });

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingMentor) return;

    setBookingSuccess(`Guidance session requested with ${bookingMentor.user.name}! They will confirm via email.`);
    setBookingMentor(null);
    setBookingTopic('');
    setTimeout(() => setBookingSuccess(null), 4000);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Mentorship Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-neutral-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-purple-200 mb-2 border border-white/10">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Senior Mentorship & Placement Archive</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Learn Directly From Campus Seniors & Alumni
          </h2>
          <p className="text-xs text-purple-100/80 mt-1 leading-relaxed">
            Get 1-on-1 advice on internship preparation, elective recommendations, research guidance, and resume reviews from seniors who just cracked top opportunities.
          </p>

          {/* Sub-tab Switcher */}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('mentors')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'mentors'
                  ? 'bg-white text-purple-950 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Verified Senior Mentors
            </button>
            <button
              onClick={() => setActiveSubTab('debriefs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'debriefs'
                  ? 'bg-white text-purple-950 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Interview & Placement Archive
            </button>
          </div>
        </div>
        <div className="absolute -right-6 -bottom-8 opacity-10 text-white pointer-events-none">
          <UserCheck className="w-64 h-64" />
        </div>
      </div>

      {/* Booking Toast */}
      {bookingSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>{bookingSuccess}</span>
          </div>
          <button onClick={() => setBookingSuccess(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIEW 1: SENIOR MENTORS DIRECTORY */}
      {activeSubTab === 'mentors' && (
        <div className="flex flex-col gap-4">
          {/* Domain Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {domains.map((dom) => (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedDomain === dom
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100'
                }`}
              >
                {dom}
              </button>
            ))}
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-900 transition-all shadow-2xs"
              >
                <div>
                  {/* Senior Profile Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={mentor.user.avatar}
                        alt={mentor.user.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/30"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                            {mentor.user.name}
                          </h3>
                          <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          {mentor.user.year} • {mentor.user.department}
                        </p>
                        {mentor.companyOffers && mentor.companyOffers.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md w-fit">
                            <Briefcase className="w-3 h-3" />
                            <span>{mentor.companyOffers[0]}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{mentor.rating}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        {mentor.sessionsConducted} sessions
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-700 dark:text-neutral-300 mb-3 line-clamp-2">
                    {mentor.user.bio}
                  </p>

                  {/* Mentorship Focus Topics */}
                  <div className="space-y-1 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Can help you with:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {mentor.adviceTopics.map((topic, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-900"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{mentor.availability}</span>
                  </div>

                  <button
                    onClick={() => setBookingMentor(mentor)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ask Senior</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: PLACEMENT & INTERVIEW ARCHIVE */}
      {activeSubTab === 'debriefs' && (
        <div className="flex flex-col gap-4">
          {debriefs.map((deb) => (
            <div
              key={deb.id}
              className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-2xs flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
                    {deb.companyName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                        {deb.companyName}
                      </h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {deb.type}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
                        Difficulty: {deb.difficulty}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                      {deb.role} • <span className="text-emerald-600 dark:text-emerald-400 font-bold">{deb.stipendOrPackage}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <img
                    src={deb.senior.avatar}
                    alt={deb.senior.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div className="text-right text-[11px]">
                    <span className="font-bold text-neutral-900 dark:text-white">
                      By {deb.senior.name}
                    </span>
                    <p className="text-[10px] text-neutral-400">{deb.createdAt}</p>
                  </div>
                </div>
              </div>

              {/* Rounds Breakdown */}
              <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  Interview Rounds Breakdown ({deb.roundsCount} Rounds):
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {deb.rounds.map((round, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 flex flex-col gap-2"
                    >
                      <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {round.roundName}
                      </span>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                        {round.description}
                      </p>
                      <div className="pt-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">
                          Questions Asked:
                        </span>
                        <ul className="list-disc list-inside text-[11px] text-neutral-800 dark:text-neutral-200 space-y-0.5 mt-1 font-mono">
                          {round.questionsAsked.map((q, qIdx) => (
                            <li key={qIdx}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prep Tips */}
              <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Senior's Advice & Preparation Tips:
                </span>
                <ul className="space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
                  {deb.prepTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {bookingMentor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={bookingMentor.user.avatar}
                  alt={bookingMentor.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                    Request Guidance: {bookingMentor.user.name}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {bookingMentor.user.year} • {bookingMentor.companyOffers?.[0] || 'Senior'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBookingMentor(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1 block">
                  What would you like guidance on?
                </label>
                <textarea
                  required
                  value={bookingTopic}
                  onChange={(e) => setBookingTopic(e.target.value)}
                  placeholder="e.g. Need feedback on my resume for Amazon summer internship or elective choices for 4th sem..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1 block">
                  Preferred slot / Mode:
                </label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                >
                  <option value="Tomorrow 6:00 PM">Tomorrow 6:00 PM (15m Google Meet)</option>
                  <option value="Weekend Morning">Saturday 11:00 AM (Central Library Lawn)</option>
                  <option value="Async Q&A">Async Q&A (Reply directly on CampusConnect)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBookingMentor(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
                >
                  Send Guidance Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
