'use client';

import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Compass, 
  Users, 
  ShieldCheck, 
  Check, 
  Plus, 
  Layers, 
  Terminal, 
  Code2, 
  Filter 
} from 'lucide-react';
import { CommunityServer } from '@/types';

interface DiscoverCommunitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  discoverableServers: CommunityServer[];
  joinedServerIds: string[];
  onJoinServer: (server: CommunityServer) => void;
  onLeaveServer: (serverId: string) => void;
}

export const DiscoverCommunitiesModal: React.FC<DiscoverCommunitiesModalProps> = ({
  isOpen,
  onClose,
  discoverableServers,
  joinedServerIds,
  onJoinServer,
  onLeaveServer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Open Source', 'Department', 'Clubs', 'Hackathons'];

  const filteredServers = discoverableServers.filter((server) => {
    const matchesSearch = 
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'All' || server.categoryType === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#101420] border border-[#212a40] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#1b2234] flex items-center justify-between bg-[#0b0e17]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Discover Campus Communities</h3>
              <p className="text-xs text-slate-400">
                Explore student technical clubs, departmental guilds, and hackathon squads
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2134] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 border-b border-[#1b2234] bg-[#0d101a] flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by community name or keywords..."
              className="w-full bg-[#151a28] border border-[#232c42] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#151a28] text-slate-400 hover:text-slate-200 border border-[#22293e]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Community List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredServers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No discoverable communities match your filter.
            </div>
          ) : (
            filteredServers.map((server) => {
              const isJoined = joinedServerIds.includes(server.id);

              return (
                <div
                  key={server.id}
                  className="p-4 bg-[#141926] border border-[#20283c] hover:border-indigo-500/40 rounded-xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#1b2133] to-[#252f4a] border border-[#2d3957] flex items-center justify-center font-bold text-sm text-indigo-300 shrink-0">
                      {server.shortName}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm text-white truncate">{server.name}</h4>
                        {server.isVerified && (
                          <span title="Verified College Guild">
                            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                          </span>
                        )}
                        <span className="px-2 py-0.2 bg-[#1d2438] text-slate-300 text-[10px] font-medium rounded border border-[#29344f]">
                          {server.categoryType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {server.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {server.memberCount} members
                        </span>
                        <span>•</span>
                        <span>{server.channels.length} channels</span>
                      </div>
                    </div>
                  </div>

                  {/* Join / Leave Action */}
                  <div className="shrink-0 w-full sm:w-auto">
                    {isJoined ? (
                      <button
                        onClick={() => onLeaveServer(server.id)}
                        className="w-full sm:w-auto px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#1a2030] hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 border border-[#2b354e] hover:border-rose-800 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Joined</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onJoinServer(server)}
                        className="w-full sm:w-auto px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Join Community</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
