'use client';

import React, { useState } from 'react';
import { X, Image, Sparkles, Calendar, Code, Plus } from 'lucide-react';
import { Post, User } from '@/types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onAddPost: (post: Post) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAddPost,
}) => {
  const [postType, setPostType] = useState<'social' | 'project' | 'event'>('social');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Project specific
  const [demoUrl, setDemoUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [techStack, setTechStack] = useState('');

  // Event specific
  const [eventDate, setEventDate] = useState('');
  const [eventVenue, setEventVenue] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newPost: Post = {
      id: `post_${Date.now()}`,
      author: currentUser,
      type: postType,
      content,
      images: imageUrl.trim() ? [imageUrl.trim()] : undefined,
      tags: tags.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean),
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      hasLiked: true,
      hasSaved: false,
      createdAt: 'Just now',
      projectMeta: postType === 'project' ? {
        demoUrl: demoUrl || undefined,
        repoUrl: repoUrl || undefined,
        techStack: techStack.split(',').map((t) => t.trim()).filter(Boolean),
      } : undefined,
      eventMeta: postType === 'event' ? {
        date: eventDate || 'Upcoming',
        venue: eventVenue || 'Campus Grounds',
        organizer: currentUser.name,
      } : undefined,
    };

    onAddPost(newPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Create Campus Post
              </h3>
              <p className="text-[11px] text-neutral-400">Share updates, hackathon projects, or club events</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Type Selector */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
          <button
            type="button"
            onClick={() => setPostType('social')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
              postType === 'social' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'
            }`}
          >
            Campus Life
          </button>
          <button
            type="button"
            onClick={() => setPostType('project')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
              postType === 'project' ? 'bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-neutral-500'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Project Demo
          </button>
          <button
            type="button"
            onClick={() => setPostType('event')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
              postType === 'event' ? 'bg-white dark:bg-neutral-800 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-neutral-500'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Club Event
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            required
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              postType === 'project'
                ? 'Describe your project, inspiration, challenges overcome, and architecture...'
                : postType === 'event'
                ? 'Details regarding the event, schedule, registration link, and guest speakers...'
                : 'What is happening on campus? Share achievements, study tips, or questions...'
            }
            className="w-full p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />

          {/* Project Specific Inputs */}
          {postType === 'project' && (
            <div className="space-y-2 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                Project Showcase Links
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="Demo URL (e.g. https://...)"
                  className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                />
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="GitHub Repo URL"
                  className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                />
              </div>
              <input
                type="text"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="Tech Stack (e.g. Next.js, Python, PyTorch)"
                className="w-full p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
              />
            </div>
          )}

          {/* Event Specific Inputs */}
          {postType === 'event' && (
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900">
              <input
                type="text"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="Date (e.g. Oct 28, 4:00 PM)"
                className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
              />
              <input
                type="text"
                value={eventVenue}
                onChange={(e) => setEventVenue(e.target.value)}
                placeholder="Venue (e.g. Central Auditorium)"
                className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
              />
            </div>
          )}

          {/* Common Fields: Tags & Image URL */}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (e.g. Hackathon, SIH2026, DSA)"
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
            />
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Image URL (optional)"
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Publish to Campus
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
