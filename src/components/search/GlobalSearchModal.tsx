'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Hash, 
  Terminal, 
  Bug, 
  BookOpen, 
  Users, 
  Bot, 
  Sparkles, 
  ExternalLink 
} from 'lucide-react';
import { CommunityServer, StructuredContribution, ResourceNote, User } from '@/types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  servers: CommunityServer[];
  contributions: StructuredContribution[];
  resources: ResourceNote[];
  onSelectChannel: (serverId: string, channelId: string) => void;
  onSelectUser: (user: User) => void;
  onAskAi: (query: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  servers,
  contributions,
  resources,
  onSelectChannel,
  onSelectUser,
  onAskAi,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const query = searchTerm.toLowerCase().trim();

  // Search Channels across all servers
  const matchedChannels = servers.flatMap(s => 
    s.channels
      .filter(c => c.name.toLowerCase().includes(query) || c.topic.toLowerCase().includes(query))
      .map(c => ({ ...c, serverName: s.name, serverId: s.id }))
  ).slice(0, 4);

  // Search Open-Source Contributions
  const matchedContributions = contributions
    .filter(c => c.title.toLowerCase().includes(query) || c.tags.some(t => t.toLowerCase().includes(query)))
    .slice(0, 4);

  // Search Academic Resources
  const matchedResources = resources
    .filter(r => r.title.toLowerCase().includes(query) || r.courseCode.toLowerCase().includes(query) || r.courseName.toLowerCase().includes(query))
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4 select-none">
      <div className="bg-[#101420] border border-[#242c44] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#1c2233] bg-[#0c0f18] flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search channels, open-source issues, PYQ notes, or ask AI..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 bg-[#181e2e] text-[10px] text-slate-400 font-mono rounded border border-[#263148]">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Ask AI Shortcut */}
          {searchTerm && (
            <button
              onClick={() => {
                onAskAi(searchTerm);
                onClose();
              }}
              className="w-full p-2.5 bg-gradient-to-r from-purple-950/60 to-indigo-950/60 hover:from-purple-900/80 hover:to-indigo-900/80 border border-purple-700/60 rounded-xl text-left flex items-center justify-between text-xs transition-all"
            >
              <div className="flex items-center gap-2 text-purple-200 font-semibold">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Ask CampusAI Copilot to query &quot;{searchTerm}&quot;</span>
              </div>
              <span className="text-[10px] text-purple-400 font-bold bg-purple-900/50 px-2 py-0.5 rounded">
                Query AI
              </span>
            </button>
          )}

          {/* Matched Channels */}
          {matchedChannels.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3 h-3 text-slate-500" /> Channels
              </div>
              <div className="space-y-1">
                {matchedChannels.map((ch) => (
                  <button
                    key={`${ch.serverId}-${ch.id}`}
                    onClick={() => {
                      onSelectChannel(ch.serverId, ch.id);
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#141926] hover:bg-[#1d2438] text-left flex items-center justify-between transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Hash className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                      <span className="text-xs font-semibold text-white truncate">{ch.name}</span>
                      <span className="text-[10px] text-slate-500 font-normal truncate">in {ch.serverName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate max-w-[200px] hidden sm:inline">
                      {ch.topic}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Open-Source Contributions */}
          {matchedContributions.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-emerald-400" /> Open-Source Lab Tasks
              </div>
              <div className="space-y-1">
                {matchedContributions.map((iss) => (
                  <div
                    key={iss.id}
                    className="p-2.5 rounded-lg bg-[#141926] hover:bg-[#1d2438] text-left flex items-center justify-between transition-colors cursor-pointer"
                    onClick={() => {
                      onSelectChannel('srv_opensource', 'c_good_first_issues');
                      onClose();
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">{iss.type}</span>
                        <span className="text-xs font-semibold text-white">{iss.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">By {iss.author.name}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] rounded border border-emerald-800 font-medium">
                      {iss.difficulty || iss.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Academic Resources */}
          {matchedResources.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-amber-400" /> Academic Vault
              </div>
              <div className="space-y-1">
                {matchedResources.map((res) => (
                  <div
                    key={res.id}
                    className="p-2.5 rounded-lg bg-[#141926] hover:bg-[#1d2438] text-left flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-400">{res.courseCode}</span>
                        <span className="text-xs font-semibold text-white">{res.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Sem {res.semester} · {res.department}</div>
                    </div>
                    <button
                      onClick={() => alert(`Downloading ${res.title}`)}
                      className="px-2.5 py-1 bg-amber-600/80 hover:bg-amber-500 text-white text-[11px] font-semibold rounded"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
