'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  BookOpen, 
  Award, 
  Grid, 
  Bookmark, 
  UserCheck, 
  Download, 
  ArrowUp,
  Mail,
  GraduationCap
} from 'lucide-react';
import { User, Post, ResourceNote } from '@/types';

interface ProfileViewProps {
  user: User;
  posts: Post[];
  uploadedResources: ResourceNote[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, posts, uploadedResources }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'notes' | 'saved'>('posts');

  const myPosts = posts.filter((p) => p.author.id === user.id || p.author.name === user.name);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar with verification badge */}
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-500/20"
            />
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-neutral-950 p-1 rounded-full shadow-md">
                <ShieldCheck className="w-6 h-6 text-indigo-600 fill-indigo-100 dark:fill-indigo-950" />
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                {user.name}
              </h2>
              <span className="text-xs font-semibold text-neutral-400">@{user.handle}</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {user.year}
              </span>
            </div>

            {/* Email Verification Banner */}
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
              <Mail className="w-3.5 h-3.5 text-emerald-500" />
              <span>{user.email}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.2 rounded-full">
                Institutional Gated
              </span>
            </div>

            <p className="text-xs text-neutral-700 dark:text-neutral-300 max-w-lg leading-relaxed">
              {user.bio}
            </p>

            {/* Badges / Honors */}
            {user.achievements && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {user.achievements.map((ach, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
                  >
                    <Award className="w-3 h-3" />
                    {ach}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Academic Karma & Stats Box */}
          <div className="flex md:flex-col items-center justify-around gap-4 bg-neutral-50 dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 w-full md:w-auto">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 font-black text-lg text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <span>{user.points}</span>
              </div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Karma Points
              </span>
            </div>
            <div className="text-center">
              <span className="font-extrabold text-lg text-neutral-900 dark:text-white">
                {uploadedResources.length}
              </span>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Notes Uploaded
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Sub-Tabs */}
      <div className="flex items-center justify-center border-b border-neutral-200 dark:border-neutral-800 gap-8">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'posts'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>My Posts ({myPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'notes'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Uploaded Notes & PYQs ({uploadedResources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'saved'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Resources</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {myPosts.length > 0 ? (
            myPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 text-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {post.type.toUpperCase()}
                  </span>
                  <span className="text-neutral-400">{post.createdAt}</span>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300">{post.content}</p>
                <div className="mt-3 flex items-center gap-4 text-neutral-500 font-semibold">
                  <span>❤️ {post.likesCount} Likes</span>
                  <span>💬 {post.commentsCount} Comments</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-neutral-400 text-xs">
              No personal posts shared yet. Use the "Create Post" button to post project demos or campus updates.
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uploadedResources.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {item.courseCode}
                  </span>
                  <span className="text-[10px] text-neutral-400">Sem {item.semester}</span>
                </div>
                <h4 className="font-bold text-xs text-neutral-900 dark:text-white line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1">
                  {item.description}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-600 flex items-center gap-1">
                  <ArrowUp className="w-3.5 h-3.5" />
                  {item.upvotes} Upvotes
                </span>
                <span className="text-neutral-400 text-[11px]">{item.downloads} Downloads</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="text-center py-12 text-neutral-400 text-xs">
          Bookmarks are stored locally for quick offline revision.
        </div>
      )}
    </div>
  );
};
