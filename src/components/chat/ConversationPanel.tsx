'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Hash, 
  Terminal, 
  Sparkles, 
  Users, 
  Search, 
  Bot, 
  Bug, 
  BookOpen, 
  Filter, 
  Plus, 
  Layers, 
  ExternalLink,
  FolderGit2,
  AlertCircle,
  RefreshCw,
  Sparkle
} from 'lucide-react';
import { 
  Channel, 
  ChannelMessage, 
  User, 
  StructuredContribution, 
  ContributionStatus,
  CommunityServer
} from '@/types';
import { MessageItem } from './MessageItem';
import { MessageComposer } from './MessageComposer';

interface ConversationPanelProps {
  activeServer: CommunityServer;
  activeChannel: Channel;
  messages: ChannelMessage[];
  currentUser: User;
  onSendMessage: (content: string) => Promise<void>;
  onEditMessage?: (id: string, newText: string) => void;
  onDeleteMessage?: (id: string) => void;
  onAddReaction?: (id: string, emoji: string) => void;
  onOpenProfile: (user: User) => void;
  onOpenCreateContribution: () => void;
  onOpenUploadNote?: () => void;
  onClaimContribution?: (id: string) => void;
  onUpvoteContribution?: (id: string) => void;
  onStatusChangeContribution?: (id: string, newStatus: ContributionStatus) => void;
  onPromptAi?: (promptText: string) => void;
  isMemberSidebarOpen: boolean;
  onToggleMemberSidebar: () => void;
  onOpenAiDrawer: () => void;
  isLoading?: boolean;
}

export const ConversationPanel: React.FC<ConversationPanelProps> = ({
  activeServer,
  activeChannel,
  messages,
  currentUser,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onAddReaction,
  onOpenProfile,
  onOpenCreateContribution,
  onOpenUploadNote,
  onClaimContribution,
  onUpvoteContribution,
  onStatusChangeContribution,
  onPromptAi,
  isMemberSidebarOpen,
  onToggleMemberSidebar,
  onOpenAiDrawer,
  isLoading = false,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [contributionFilter, setContributionFilter] = useState<'all' | 'good-first-issue' | 'bug' | 'feature'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isAiChannel = activeChannel.type === 'ai-assistant';
  const isOpenSourceChannel = activeChannel.type === 'opensource';

  // Filter messages by search term or contribution type
  const filteredMessages = messages.filter((msg) => {
    if (searchFilter.trim()) {
      const matchText = msg.content.toLowerCase().includes(searchFilter.toLowerCase());
      const matchAuthor = msg.author.name.toLowerCase().includes(searchFilter.toLowerCase());
      const matchContribution = msg.contribution?.title.toLowerCase().includes(searchFilter.toLowerCase());
      if (!matchText && !matchAuthor && !matchContribution) return false;
    }

    if (contributionFilter !== 'all') {
      if (!msg.contribution || msg.contribution.type !== contributionFilter) return false;
    }

    return true;
  });

  const getHeaderIcon = () => {
    if (activeChannel.type === 'ai-assistant') return <Bot className="w-5 h-5 text-purple-400" />;
    if (activeChannel.name === 'bug-reports') return <Bug className="w-5 h-5 text-rose-400" />;
    if (activeChannel.name === 'good-first-issues') return <Terminal className="w-5 h-5 text-emerald-400" />;
    if (isOpenSourceChannel) return <FolderGit2 className="w-5 h-5 text-indigo-400" />;
    if (activeChannel.type === 'academic') return <BookOpen className="w-5 h-5 text-amber-400" />;
    return <Hash className="w-5 h-5 text-slate-400" />;
  };

  return (
    <main 
      aria-label="Main conversation panel"
      className="flex-1 flex flex-col h-screen bg-[#131722] overflow-hidden min-w-0"
    >
      {/* 1. Coordinated Channel Header */}
      <header className="h-14 border-b border-[#1c2233] px-4 flex items-center justify-between bg-[#111520] shrink-0 z-10 shadow-sm">
        {/* Left: Channel Icon, Name & Topic */}
        <div className="flex items-center gap-2.5 min-w-0 mr-4">
          <div className="shrink-0">{getHeaderIcon()}</div>
          <h2 className="font-bold text-sm text-white tracking-tight shrink-0">
            {activeChannel.name}
          </h2>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <p className="text-xs text-slate-400 truncate hidden sm:block">
            {activeChannel.topic}
          </p>
        </div>

        {/* Right: Search, Filter, AI Summon & Member List Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick In-Channel Search */}
          <div className="relative hidden md:block">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search channel..."
              className="w-40 lg:w-48 bg-[#181e2d] border border-[#242b3e] rounded-md pl-7 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:w-56 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
          </div>

          {/* Open-Source Filter Pill (if channel contains contributions) */}
          {isOpenSourceChannel && (
            <div className="hidden lg:flex items-center bg-[#181e2d] border border-[#242b3e] rounded-md p-0.5 text-xs">
              <button
                onClick={() => setContributionFilter('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  contributionFilter === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setContributionFilter('good-first-issue')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  contributionFilter === 'good-first-issue' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Issues
              </button>
              <button
                onClick={() => setContributionFilter('bug')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  contributionFilter === 'bug' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Bugs
              </button>
            </div>
          )}

          {/* AI Copilot Summon button in header */}
          <button
            onClick={onOpenAiDrawer}
            className="px-2.5 py-1 rounded-md bg-purple-950/60 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            title="Ask CampusAI Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Toggle Member List */}
          <button
            onClick={onToggleMemberSidebar}
            className={`p-1.5 rounded-md hover:bg-[#1c2233] transition-colors ${
              isMemberSidebarOpen ? 'text-indigo-400 bg-[#181e2d]' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Member Sidebar"
          >
            <Users className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Scrollable Conversation History */}
      <div className="flex-1 overflow-y-auto px-1 py-4 space-y-0.5">
        {/* Channel Introduction Banner (Empty or Start of History) */}
        <div className="px-6 py-6 border-b border-[#1c2233] mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1c2235] border border-[#27314a] flex items-center justify-center text-indigo-400 mb-3 shadow-lg">
            {getHeaderIcon()}
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mb-1">
            Welcome to #{activeChannel.name}!
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            {activeChannel.topic || `This is the beginning of the #${activeChannel.name} channel for ${activeServer.name}.`}
          </p>

          {/* Contextual Action Buttons in Channel Banner */}
          {isOpenSourceChannel && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <button
                onClick={onOpenCreateContribution}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Contribution Card</span>
              </button>

              <button
                onClick={() => onPromptAi && onPromptAi('Show me all Good First Issues in this channel')}
                className="px-3 py-1.5 bg-[#1a2032] hover:bg-[#232b42] border border-[#2d3856] text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Query Active Issues via AI</span>
              </button>
            </div>
          )}

          {isAiChannel && (
            <div className="mt-4 p-3 bg-purple-950/40 border border-purple-800/60 rounded-xl text-xs text-purple-200 max-w-2xl leading-relaxed">
              <strong>🤖 AI Assistant Capabilities:</strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-[11px] text-purple-300">
                <div>• Search PYQs & verified exam notes</div>
                <div>• Filter Good First Issues by tech stack</div>
                <div>• Extract senior interview debriefs</div>
                <div>• Match teammates for hackathons</div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center py-8 text-slate-400 text-xs gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Loading channel messages...</span>
          </div>
        )}

        {/* Filtered No Results State */}
        {!isLoading && filteredMessages.length === 0 && (
          <div className="text-center py-12 px-4 text-slate-400">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-500 mb-2" />
            <div className="text-sm font-semibold text-slate-300">No matching messages found</div>
            <div className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or contribution filter.
            </div>
          </div>
        )}

        {/* Render Conversation Messages with Grouping */}
        {filteredMessages.map((msg, index) => {
          const prevMsg = index > 0 ? filteredMessages[index - 1] : null;
          const isConsecutive = 
            Boolean(prevMsg) && 
            prevMsg?.author.id === msg.author.id && 
            !prevMsg?.isSystem && 
            !msg.isSystem &&
            !msg.contribution &&
            !prevMsg?.contribution;

          return (
            <MessageItem
              key={msg.id}
              message={msg}
              currentUser={currentUser}
              isConsecutive={isConsecutive}
              onEditMessage={onEditMessage}
              onDeleteMessage={onDeleteMessage}
              onAddReaction={onAddReaction}
              onOpenProfile={onOpenProfile}
              onClaimContribution={onClaimContribution}
              onUpvoteContribution={onUpvoteContribution}
              onStatusChangeContribution={onStatusChangeContribution}
            />
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Message Composer Fixed at Bottom */}
      <MessageComposer
        activeChannel={activeChannel}
        onSendMessage={onSendMessage}
        onOpenCreateContribution={onOpenCreateContribution}
        onOpenUploadNote={onOpenUploadNote}
        isAiChannel={isAiChannel}
        onPromptAi={onPromptAi}
      />
    </main>
  );
};
