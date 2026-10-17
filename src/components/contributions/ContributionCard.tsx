'use client';

import React from 'react';
import { 
  Bug, 
  Sparkles, 
  Terminal, 
  Rocket, 
  ExternalLink, 
  ThumbsUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  GitBranch, 
  UserCheck, 
  Tag 
} from 'lucide-react';
import { StructuredContribution, User, ContributionStatus } from '@/types';

interface ContributionCardProps {
  contribution: StructuredContribution;
  currentUser: User;
  onClaim?: (id: string) => void;
  onUpvote?: (id: string) => void;
  onStatusChange?: (id: string, newStatus: ContributionStatus) => void;
  onDiscuss?: (contribution: StructuredContribution) => void;
}

export const ContributionCard: React.FC<ContributionCardProps> = ({
  contribution,
  currentUser,
  onClaim,
  onUpvote,
  onStatusChange,
  onDiscuss,
}) => {
  const getTypeBadge = () => {
    switch (contribution.type) {
      case 'good-first-issue':
        return {
          label: 'Good First Issue',
          icon: Terminal,
          bg: 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300',
          accentBorder: 'border-l-emerald-500',
        };
      case 'bug':
        return {
          label: 'Bug Report',
          icon: Bug,
          bg: 'bg-rose-950/60 border-rose-800/80 text-rose-300',
          accentBorder: 'border-l-rose-500',
        };
      case 'feature':
        return {
          label: 'Feature Proposal',
          icon: Sparkles,
          bg: 'bg-indigo-950/60 border-indigo-800/80 text-indigo-300',
          accentBorder: 'border-l-indigo-500',
        };
      case 'project-update':
        return {
          label: 'Project Milestone',
          icon: Rocket,
          bg: 'bg-purple-950/60 border-purple-800/80 text-purple-300',
          accentBorder: 'border-l-purple-500',
        };
    }
  };

  const badge = getTypeBadge();
  const Icon = badge.icon;

  const getStatusBadge = () => {
    switch (contribution.status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-900/40 text-emerald-400 border border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Open
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-900/40 text-amber-400 border border-amber-800/60">
            <Clock className="w-3 h-3" />
            In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-900/40 text-indigo-300 border border-indigo-800/60">
            <CheckCircle2 className="w-3 h-3 text-indigo-400" />
            Resolved
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            Closed
          </span>
        );
    }
  };

  return (
    <div className={`mt-2 mb-1.5 bg-[#171c2a] border border-[#232a3f] border-l-4 ${badge.accentBorder} rounded-lg p-3.5 shadow-md hover:border-slate-600/60 transition-all max-w-2xl`}>
      {/* Header Row: Type Badge + Difficulty/Severity + Status */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg}`}>
            <Icon className="w-3.5 h-3.5" />
            {badge.label}
          </span>

          {contribution.difficulty && (
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
              {contribution.difficulty}
            </span>
          )}

          {contribution.severity && (
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
              contribution.severity === 'High' || contribution.severity === 'Critical'
                ? 'bg-rose-950/70 border-rose-700/80 text-rose-300'
                : 'bg-amber-950/70 border-amber-700/80 text-amber-300'
            }`}>
              Severity: {contribution.severity}
            </span>
          )}
        </div>

        <div>{getStatusBadge()}</div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-bold text-white mb-1.5 tracking-tight flex items-center gap-1.5">
        {contribution.title}
      </h4>

      {/* Description */}
      <p className="text-xs text-slate-300 leading-relaxed mb-3 font-normal whitespace-pre-wrap">
        {contribution.description}
      </p>

      {/* Claimed Indicator if claimed */}
      {contribution.claimedBy && (
        <div className="mb-3 px-2.5 py-1.5 bg-[#121622] rounded border border-[#22293d] flex items-center gap-2 text-xs text-slate-300">
          <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Claimed by <strong className="text-white">{contribution.claimedBy.name}</strong></span>
        </div>
      )}

      {/* Tags */}
      {contribution.tags && contribution.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          {contribution.tags.map((tag) => (
            <span 
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[#121622] text-slate-400 border border-[#22293d]"
            >
              <Tag className="w-2.5 h-2.5 text-slate-500" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions and Repository Links */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#22293d] text-xs flex-wrap gap-2">
        {/* Repo or Issue Links */}
        <div className="flex items-center gap-3">
          {contribution.repoUrl && (
            <a 
              href={contribution.repoUrl} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Repository</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </a>
          )}
          {contribution.issueUrl && (
            <a 
              href={contribution.issueUrl} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span>GitHub Issue #{contribution.issueUrl.split('/').pop()}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}
        </div>

        {/* Interactive Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Upvote button */}
          {onUpvote && (
            <button
              onClick={() => onUpvote(contribution.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                contribution.hasUpvoted
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#121622] text-slate-300 hover:bg-[#1f2538] hover:text-white border border-[#28314a]'
              }`}
              title="Upvote contribution"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{contribution.upvotes || 0}</span>
            </button>
          )}

          {/* Claim Issue button (for Good First Issues) */}
          {contribution.type === 'good-first-issue' && contribution.status === 'open' && onClaim && (
            <button
              onClick={() => onClaim(contribution.id)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded shadow transition-colors flex items-center gap-1"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Claim Issue</span>
            </button>
          )}

          {/* Resolve toggle for bugs if author or maintainer */}
          {contribution.type === 'bug' && contribution.status === 'open' && onStatusChange && (
            <button
              onClick={() => onStatusChange(contribution.id, 'resolved')}
              className="px-2.5 py-1 bg-[#1e2538] hover:bg-emerald-800 text-slate-300 hover:text-white text-xs font-semibold rounded border border-[#28314a] transition-colors"
            >
              Mark Resolved
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
