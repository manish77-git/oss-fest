'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  MoreHorizontal, 
  Smile, 
  Edit3, 
  Trash2, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  BookOpen, 
  Building2, 
  Users, 
  Check, 
  X,
  FileText
} from 'lucide-react';
import { 
  ChannelMessage, 
  User, 
  StructuredContribution, 
  ContributionStatus,
  ResourceNote,
  PlacementDebrief,
  TeammateListing
} from '@/types';
import { ContributionCard } from '@/components/contributions/ContributionCard';

interface MessageItemProps {
  message: ChannelMessage;
  currentUser: User;
  isConsecutive: boolean;
  onEditMessage?: (id: string, newText: string) => void;
  onDeleteMessage?: (id: string) => void;
  onAddReaction?: (id: string, emoji: string) => void;
  onOpenProfile: (user: User) => void;
  onClaimContribution?: (id: string) => void;
  onUpvoteContribution?: (id: string) => void;
  onStatusChangeContribution?: (id: string, newStatus: ContributionStatus) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUser,
  isConsecutive,
  onEditMessage,
  onDeleteMessage,
  onAddReaction,
  onOpenProfile,
  onClaimContribution,
  onUpvoteContribution,
  onStatusChangeContribution,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [showActions, setShowActions] = useState(false);
  const [appliedSquads, setAppliedSquads] = useState<Record<string, boolean>>({});

  const isAuthor = message.author.id === currentUser.id;
  const isBot = message.author.id === 'usr_campus_ai';

  // System message styling
  if (message.isSystem) {
    return (
      <div className="py-2.5 px-4 my-1.5 bg-[#141824]/60 border border-[#1e2538] rounded-lg text-xs text-slate-300 flex items-start gap-2.5 max-w-3xl">
        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="flex-1 leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  const handleSaveEdit = () => {
    if (editText.trim() && onEditMessage) {
      onEditMessage(message.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleApplySquad = (listingId: string) => {
    setAppliedSquads(prev => ({ ...prev, [listingId]: true }));
    alert('Squad Application sent to team organizer with your CampusConnect profile!');
  };

  // Render markdown-like simple formatting (bold, code blocks)
  const renderFormattedText = (text: string) => {
    if (text.startsWith('```') && text.endsWith('```')) {
      const code = text.slice(3, -3).replace(/^[a-z]+\n/, '');
      return (
        <pre className="p-3 my-1.5 bg-[#0b0e14] border border-[#1d2335] rounded-md text-xs font-mono text-emerald-400 overflow-x-auto">
          <code>{code}</code>
        </pre>
      );
    }

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold text formatting
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="leading-relaxed mb-0.5">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return <em key={i} className="text-slate-300">{part.slice(1, -1)}</em>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`relative group px-4 py-1.5 hover:bg-[#141824]/50 transition-colors flex gap-3 ${
        isConsecutive ? 'mt-0 pt-0.5' : 'mt-2.5'
      }`}
    >
      {/* Avatar or Timestamp Spacer */}
      <div className="w-10 shrink-0 select-none">
        {!isConsecutive ? (
          <button
            onClick={() => onOpenProfile(message.author)}
            className="w-10 h-10 rounded-full overflow-hidden hover:opacity-90 transition-opacity cursor-pointer relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={message.author.avatar} 
              alt={message.author.name} 
              className="w-full h-full object-cover" 
            />
            {isBot && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-purple-600 rounded-full border border-[#0f121a] flex items-center justify-center">
                <Bot className="w-2 h-2 text-white" />
              </span>
            )}
          </button>
        ) : (
          <span className="text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pl-2 select-none">
            {message.timestamp}
          </span>
        )}
      </div>

      {/* Main Message Content Container */}
      <div className="flex-1 min-w-0">
        {/* Header (Author, Badge, Timestamp) */}
        {!isConsecutive && (
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => onOpenProfile(message.author)}
              className="font-bold text-[13px] text-white hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <span>{message.author.name}</span>
              {isBot && (
                <span className="px-1.5 py-0.2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold rounded flex items-center gap-0.5">
                  <Bot className="w-2.5 h-2.5" />
                  AI COPILOT
                </span>
              )}
              {message.author.company && (
                <span className="px-1.5 py-0.2 bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-[10px] font-medium rounded">
                  @{message.author.company}
                </span>
              )}
            </button>

            <span className="text-[11px] text-slate-500 font-normal">
              {message.timestamp}
            </span>

            {message.edited && (
              <span className="text-[10px] text-slate-500 italic">(edited)</span>
            )}
          </div>
        )}

        {/* Message Body or Edit Mode */}
        {isEditing ? (
          <div className="mt-1">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full bg-[#181e30] border border-indigo-500 rounded p-2 text-sm text-white focus:outline-none resize-none"
              rows={2}
            />
            <div className="flex items-center gap-2 mt-1 text-xs">
              <button
                onClick={handleSaveEdit}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-[13px] text-slate-200 break-words font-normal">
            {renderFormattedText(message.content)}
          </div>
        )}

        {/* 1. Structured Contribution Card (if attached to message) */}
        {message.contribution && (
          <ContributionCard
            contribution={message.contribution}
            currentUser={currentUser}
            onClaim={onClaimContribution}
            onUpvote={onUpvoteContribution}
            onStatusChange={onStatusChangeContribution}
          />
        )}

        {/* 2. CampusAI Copilot Payload (Resources, Debriefs, Teammates, Issues) */}
        {message.aiPayload && (
          <div className="mt-3 space-y-2 max-w-2xl">
            {/* Fetched Resources */}
            {message.aiPayload.resources && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Verified Study Materials & Exam Papers:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {message.aiPayload.resources.map((res: ResourceNote) => (
                    <div 
                      key={res.id} 
                      className="p-3 bg-[#171c2b] border border-[#26314c] hover:border-amber-500/50 rounded-lg transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 border border-amber-800 text-amber-300">
                          {res.courseCode} · Sem {res.semester}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{res.fileSize}</span>
                      </div>
                      <h5 className="font-bold text-xs text-white line-clamp-1 mb-1">{res.title}</h5>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{res.description}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-[#222a40] text-xs">
                        <span className="text-[10px] text-slate-400">By {res.uploader.name}</span>
                        <a
                          href={res.downloadUrl}
                          download
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`Downloading ${res.title} (${res.fileSize}) verified by AIT Faculty!`);
                          }}
                          className="px-2 py-0.5 bg-amber-600/80 hover:bg-amber-500 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fetched Senior Placement Debriefs */}
            {message.aiPayload.debriefs && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Senior Interview Debriefs & Hiring Roadmaps:
                </div>
                {message.aiPayload.debriefs.map((d: PlacementDebrief) => (
                  <div key={d.id} className="p-3 bg-[#171c2b] border border-[#26314c] rounded-lg">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="font-bold text-xs text-white flex items-center gap-2">
                        <span>{d.companyName}</span>
                        <span className="text-slate-400 font-normal">· {d.role}</span>
                        <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 text-[10px] rounded border border-emerald-800">
                          {d.stipendOrPackage}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{d.difficulty} Difficulty</span>
                    </div>

                    <div className="text-xs text-slate-300 mb-2 font-medium">
                      Debrief by <button onClick={() => onOpenProfile(d.senior)} className="text-indigo-400 hover:underline">{d.senior.name}</button> ({d.type})
                    </div>

                    <div className="space-y-1.5 bg-[#121622] p-2.5 rounded border border-[#20273b] text-xs">
                      <div className="font-semibold text-slate-300">Rounds & Questions Asked:</div>
                      {d.rounds.map((r, idx) => (
                        <div key={idx} className="text-slate-400 text-[11px]">
                          <strong className="text-slate-200">{r.roundName}:</strong> {r.description}
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" /> Top Prep Tip: {d.prepTips[0]}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Fetched Teammate Squads */}
            {message.aiPayload.teammates && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Active Hackathon Squads Seeking Members:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {message.aiPayload.teammates.map((t: TeammateListing) => (
                    <div key={t.id} className="p-3 bg-[#171c2b] border border-[#26314c] rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                          {t.competitionOrGoal}
                        </span>
                        <span className="text-[10px] text-slate-400">{t.currentTeamSize}/{t.maxTeamSize} Members</span>
                      </div>
                      <h5 className="font-bold text-xs text-white mb-1">{t.title}</h5>
                      <p className="text-[11px] text-slate-300 mb-2">{t.description}</p>
                      <div className="flex flex-wrap gap-1 mb-2.5">
                        {t.rolesNeeded.map((r, i) => (
                          <span key={i} className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                            Looking for: {r}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => handleApplySquad(t.id)}
                        disabled={appliedSquads[t.id]}
                        className={`w-full py-1 rounded text-xs font-semibold transition-all ${
                          appliedSquads[t.id]
                            ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {appliedSquads[t.id] ? 'Application Submitted ✓' : 'Request to Join Squad'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fetched Issues if query was for issues */}
            {message.aiPayload.issues && (
              <div className="space-y-2">
                {message.aiPayload.issues.map((iss: StructuredContribution) => (
                  <ContributionCard
                    key={iss.id}
                    contribution={iss}
                    currentUser={currentUser}
                    onClaim={onClaimContribution}
                    onUpvote={onUpvoteContribution}
                    onStatusChange={onStatusChangeContribution}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reaction Badges */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {message.reactions.map((r, idx) => (
              <button
                key={idx}
                onClick={() => onAddReaction && onAddReaction(message.id, r.emoji)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border transition-all ${
                  r.users.includes(currentUser.id)
                    ? 'bg-indigo-950/80 border-indigo-600 text-indigo-300'
                    : 'bg-[#121622] border-[#222a40] text-slate-400 hover:text-white'
                }`}
              >
                <span>{r.emoji}</span>
                <span className="font-semibold text-[11px]">{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Hover Context Menu (Discord style) */}
      {showActions && !isEditing && (
        <div className="absolute right-4 -top-3 bg-[#0d1018] border border-[#232b40] rounded-md shadow-xl flex items-center p-0.5 z-10 text-slate-400">
          {onAddReaction && (
            <button
              onClick={() => onAddReaction(message.id, '❤️')}
              className="p-1 hover:bg-[#1a2133] hover:text-red-400 rounded transition-colors"
              title="React Heart"
            >
              ❤️
            </button>
          )}
          {onAddReaction && (
            <button
              onClick={() => onAddReaction(message.id, '🚀')}
              className="p-1 hover:bg-[#1a2133] hover:text-amber-400 rounded transition-colors"
              title="React Rocket"
            >
              🚀
            </button>
          )}
          {onAddReaction && (
            <button
              onClick={() => onAddReaction(message.id, '🔥')}
              className="p-1 hover:bg-[#1a2133] hover:text-orange-400 rounded transition-colors"
              title="React Fire"
            >
              🔥
            </button>
          )}

          {isAuthor && onEditMessage && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:bg-[#1a2133] hover:text-white rounded transition-colors"
              title="Edit Message"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {isAuthor && onDeleteMessage && (
            <button
              onClick={() => onDeleteMessage(message.id)}
              className="p-1 hover:bg-[#1a2133] hover:text-red-400 rounded transition-colors"
              title="Delete Message"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
