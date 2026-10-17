'use client';

import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Bug, 
  Sparkles, 
  Rocket, 
  GitBranch, 
  Tag, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { ContributionType, ContributionDifficulty, ContributionSeverity, StructuredContribution, User } from '@/types';

interface CreateContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSubmit: (contribution: Omit<StructuredContribution, 'id' | 'createdAt'>) => void;
}

export const CreateContributionModal: React.FC<CreateContributionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmit,
}) => {
  const [type, setType] = useState<ContributionType>('good-first-issue');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [issueUrl, setIssueUrl] = useState('');
  const [difficulty, setDifficulty] = useState<ContributionDifficulty>('Beginner Friendly');
  const [severity, setSeverity] = useState<ContributionSeverity>('Medium');
  const [tagsInput, setTagsInput] = useState('React, TypeScript, GoodFirstIssue');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the contribution.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a detailed description or reproduction steps.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSubmit({
      type,
      title: title.trim(),
      description: description.trim(),
      status: 'open',
      difficulty: type === 'good-first-issue' || type === 'feature' ? difficulty : undefined,
      severity: type === 'bug' ? severity : undefined,
      repoUrl: repoUrl.trim() || undefined,
      issueUrl: issueUrl.trim() || undefined,
      tags,
      author: currentUser,
      upvotes: 0,
      hasUpvoted: false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121624] border border-[#232c44] rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#1f273d] flex items-center justify-between bg-[#0e121d]">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              New Open-Source Contribution
            </h3>
            <p className="text-xs text-slate-400">
              Publish structured tasks, bug tickets, or proposals to the Open-Source Lab
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1b2236] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Contribution Type
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => setType('good-first-issue')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  type === 'good-first-issue'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-[#171c2b] border-[#222a40] text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-4 h-4 text-emerald-400" />
                Good First Issue
              </button>

              <button
                type="button"
                onClick={() => setType('bug')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  type === 'bug'
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-sm'
                    : 'bg-[#171c2b] border-[#222a40] text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bug className="w-4 h-4 text-rose-400" />
                Bug Report
              </button>

              <button
                type="button"
                onClick={() => setType('feature')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  type === 'feature'
                    ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 shadow-sm'
                    : 'bg-[#171c2b] border-[#222a40] text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Feature Proposal
              </button>

              <button
                type="button"
                onClick={() => setType('project-update')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  type === 'project-update'
                    ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-sm'
                    : 'bg-[#171c2b] border-[#222a40] text-slate-400 hover:text-slate-200'
                }`}
              >
                <Rocket className="w-4 h-4 text-purple-400" />
                Project Milestone
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === 'bug'
                  ? 'e.g. Memory leak when rendering multiple DICOM slices'
                  : type === 'good-first-issue'
                  ? 'e.g. Add Dark Mode toggle to MedVision AI Edge viewer'
                  : 'e.g. Implement Semantic PYQ search with vector embeddings'
              }
              className="w-full bg-[#181e30] border border-[#26314c] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          {/* Type-Specific Modifiers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(type === 'good-first-issue' || type === 'feature') && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as ContributionDifficulty)}
                  className="w-full bg-[#181e30] border border-[#26314c] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Beginner Friendly">Beginner Friendly</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            )}

            {type === 'bug' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Bug Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as ContributionSeverity)}
                  className="w-full bg-[#181e30] border border-[#26314c] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tech Stack Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="React, Next.js, PyTorch"
                className="w-full bg-[#181e30] border border-[#26314c] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description & Context
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem, expected behavior, context, or steps to reproduce..."
              className="w-full bg-[#181e30] border border-[#26314c] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              required
            />
          </div>

          {/* Repository & GitHub Issue Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                GitHub Repository URL (Optional)
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/apex-institute/repo"
                className="w-full bg-[#181e30] border border-[#26314c] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                GitHub Issue Link (Optional)
              </label>
              <input
                type="url"
                value={issueUrl}
                onChange={(e) => setIssueUrl(e.target.value)}
                placeholder="https://github.com/apex-institute/repo/issues/14"
                className="w-full bg-[#181e30] border border-[#26314c] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-[#1f273d] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-[#1b2236] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Publish Contribution Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
