'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Search, 
  Terminal, 
  Compass, 
  BookOpen, 
  Users, 
  Bot 
} from 'lucide-react';

import { 
  CommunityServer, 
  Channel, 
  ChannelMessage, 
  StructuredContribution, 
  ServerMember, 
  User, 
  ContributionStatus,
  ResourceNote 
} from '@/types';

import { 
  MOCK_SERVERS, 
  MOCK_DISCOVERABLE_COMMUNITIES, 
  INITIAL_CONTRIBUTIONS, 
  INITIAL_CHANNEL_MESSAGES, 
  SERVER_MEMBERS,
  CAMPUS_BOT_USER 
} from '@/data/communityData';

import { 
  MOCK_RESOURCES, 
  MOCK_PLACEMENT_DEBRIEFS, 
  MOCK_TEAMMATE_LISTINGS 
} from '@/data/mockData';

import { ApiClient } from '@/services/apiClient';
import { AIAssistantService } from '@/services/aiAssistantService';
import { AuthService } from '@/services/authService';

import { ServerRail } from '@/components/layout/ServerRail';
import { ChannelSidebar } from '@/components/layout/ChannelSidebar';
import { MemberSidebar } from '@/components/layout/MemberSidebar';
import { ConversationPanel } from '@/components/chat/ConversationPanel';
import { AIAssistantDrawer } from '@/components/ai/AIAssistantDrawer';
import { DiscoverCommunitiesModal } from '@/components/communities/DiscoverCommunitiesModal';
import { CreateCommunityModal } from '@/components/communities/CreateCommunityModal';
import { CreateContributionModal } from '@/components/contributions/CreateContributionModal';
import { StudentProfileModal } from '@/components/profile/StudentProfileModal';
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal';
import { LoginPage } from '@/components/auth/LoginPage';

export default function CampusConnectApp() {
  // ─── Authentication State ───
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // 1. Core State
  const [servers, setServers] = useState<CommunityServer[]>(MOCK_SERVERS);
  const [activeServerId, setActiveServerId] = useState<string>('srv_opensource');
  const [activeChannelId, setActiveChannelId] = useState<string>('c_good_first_issues');
  const [messagesMap, setMessagesMap] = useState<Record<string, ChannelMessage[]>>(INITIAL_CHANNEL_MESSAGES);
  const [contributions, setContributions] = useState<StructuredContribution[]>(INITIAL_CONTRIBUTIONS);
  const [resources, setResources] = useState<ResourceNote[]>(MOCK_RESOURCES);

  // 2. Modals & Drawers
  const [isDiscoverModalOpen, setIsDiscoverModalOpen] = useState(false);
  const [isCreateServerModalOpen, setIsCreateServerModalOpen] = useState(false);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isMemberSidebarOpen, setIsMemberSidebarOpen] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // 3. Restore auth session + load data from localStorage + Ctrl+K shortcut
  useEffect(() => {
    // Restore session
    const savedUser = AuthService.getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
    setIsAuthChecked(true);

    // Restore persisted data (v3 key namespace for clean state)
    try {
      const savedServers = localStorage.getItem('cc_servers_v3');
      if (savedServers) setServers(JSON.parse(savedServers));

      const savedContribs = localStorage.getItem('cc_contribs_v3');
      if (savedContribs) {
        const parsed: StructuredContribution[] = JSON.parse(savedContribs);
        // Sanitize any legacy placeholder author names
        const sanitized = parsed.map((c) => {
          if (c.author && c.author.name === 'CampusConnect Lead') {
            return {
              ...c,
              author: {
                ...c.author,
                name: 'Community Contributor',
                handle: 'contributor',
                bio: 'Open-Source Contributor @ CampusConnect Lab',
              },
            };
          }
          return c;
        });
        setContributions(sanitized);
      }

      const savedMsgs = localStorage.getItem('cc_msgs_map_v3');
      if (savedMsgs) {
        const parsed: Record<string, ChannelMessage[]> = JSON.parse(savedMsgs);
        setMessagesMap(parsed);
      }
    } catch (e) {
      console.warn('LocalStorage unavailable');
    }

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // ─── Auth Handlers ───
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  const handleUpdateProfile = (updated: User) => {
    setCurrentUser(updated);
    AuthService.updateCurrentUser(updated);
    setSelectedProfileUser(updated);
    setContributions((prev) =>
      prev.map((c) => (c.author.id === updated.id ? { ...c, author: updated } : c))
    );
  };

  // Sync to localStorage on update
  const persistServers = (updated: CommunityServer[]) => {
    setServers(updated);
    try { localStorage.setItem('cc_servers_v3', JSON.stringify(updated)); } catch (e) {}
  };

  const persistMessages = (updated: Record<string, ChannelMessage[]>) => {
    setMessagesMap(updated);
    try { localStorage.setItem('cc_msgs_map_v3', JSON.stringify(updated)); } catch (e) {}
  };

  const persistContribs = (updated: StructuredContribution[]) => {
    setContributions(updated);
    try { localStorage.setItem('cc_contribs_v3', JSON.stringify(updated)); } catch (e) {}
  };

  // ─── Auth Gate: Show login page if not authenticated ───
  if (!isAuthChecked) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#090b10]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white animate-pulse">
            <Bot className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400">Loading CampusConnect...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // ─── Authenticated App ───

  // Active Server & Channel resolution
  const activeServer = servers.find((s) => s.id === activeServerId) || servers[0];
  const activeChannel = activeServer.channels.find((c) => c.id === activeChannelId) || activeServer.channels[0];
  const activeChannelMessages = messagesMap[activeChannel?.id] || [];
  const activeServerMembers: ServerMember[] = useMemo(() => {
    const baseList = SERVER_MEMBERS[activeServer.id] || SERVER_MEMBERS['srv_opensource'];
    const filtered = baseList.filter(
      (m) => m.user.name !== 'CampusConnect Lead' && m.user.id !== currentUser.id
    );
    const currentUserMember: ServerMember = {
      user: currentUser,
      roleName: 'Student Member',
      roleCategory: 'Student Contributors',
      presence: 'online',
      customStatus: 'Active in channel',
    };
    return [currentUserMember, ...filtered];
  }, [activeServer.id, currentUser]);

  // Switch Server handler
  const handleSelectServer = (serverId: string) => {
    setActiveServerId(serverId);
    const targetServer = servers.find((s) => s.id === serverId);
    if (targetServer && targetServer.channels.length > 0) {
      setActiveChannelId(targetServer.channels[0].id);
    }
    setIsMobileNavOpen(false);
  };

  // Switch Channel handler
  const handleSelectChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    setIsMobileNavOpen(false);
  };

  // Send message and trigger CampusAI if mentioned or in AI channel
  const handleSendMessage = async (content: string) => {
    if (!activeChannel) return;

    const newMessage: ChannelMessage = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      channelId: activeChannel.id,
      author: currentUser,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
      reactions: [],
    };

    const currentChannelList = messagesMap[activeChannel.id] || [];
    const updatedChannelMsgs = [...currentChannelList, newMessage];

    const newMap = {
      ...messagesMap,
      [activeChannel.id]: updatedChannelMsgs,
    };
    persistMessages(newMap);

    // AI Trigger check: in #campus-ai-assistant OR message mentions @campus-ai / @ai
    const isAiTarget = 
      activeChannel.type === 'ai-assistant' || 
      content.toLowerCase().includes('@campus-ai') || 
      content.toLowerCase().includes('@ai');

    if (isAiTarget) {
      // Clean query string
      const queryClean = content.replace(/@campus-ai/gi, '').replace(/@ai/gi, '').trim() || 'hello';

      setTimeout(async () => {
        const aiResponse = await AIAssistantService.queryAssistant(
          queryClean,
          updatedChannelMsgs,
          contributions,
          resources
        );

        const aiMessage: ChannelMessage = {
          id: `m_ai_${Date.now()}`,
          channelId: activeChannel.id,
          author: CAMPUS_BOT_USER,
          content: aiResponse.replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          aiPayload: aiResponse.payload,
          reactions: [{ emoji: '⚡', count: 1, users: ['usr_campus_ai'] }],
        };

        setMessagesMap((prev) => {
          const chList = prev[activeChannel.id] || [];
          const updatedWithAi = {
            ...prev,
            [activeChannel.id]: [...chList, aiMessage],
          };
          try { localStorage.setItem('cc_msgs_map_v2', JSON.stringify(updatedWithAi)); } catch (e) {}
          return updatedWithAi;
        });
      }, 650);
    }
  };

  // Edit message
  const handleEditMessage = (id: string, newText: string) => {
    if (!activeChannel) return;
    const currentList = messagesMap[activeChannel.id] || [];
    const updated = currentList.map((m) => {
      if (m.id === id) {
        return { ...m, content: newText, edited: true };
      }
      return m;
    });
    persistMessages({ ...messagesMap, [activeChannel.id]: updated });
  };

  // Delete message
  const handleDeleteMessage = (id: string) => {
    if (!activeChannel) return;
    const currentList = messagesMap[activeChannel.id] || [];
    const updated = currentList.filter((m) => m.id !== id);
    persistMessages({ ...messagesMap, [activeChannel.id]: updated });
  };

  // Add reaction
  const handleAddReaction = (messageId: string, emoji: string) => {
    if (!activeChannel) return;
    const currentList = messagesMap[activeChannel.id] || [];
    const updated = currentList.map((m) => {
      if (m.id === messageId) {
        const reactions = m.reactions ? [...m.reactions] : [];
        const existing = reactions.find((r) => r.emoji === emoji);
        if (existing) {
          if (existing.users.includes(currentUser.id)) {
            existing.count -= 1;
            existing.users = existing.users.filter((u) => u !== currentUser.id);
          } else {
            existing.count += 1;
            existing.users.push(currentUser.id);
          }
        } else {
          reactions.push({ emoji, count: 1, users: [currentUser.id] });
        }
        return { ...m, reactions: reactions.filter((r) => r.count > 0) };
      }
      return m;
    });
    persistMessages({ ...messagesMap, [activeChannel.id]: updated });
  };

  // Claim Open-Source issue
  const handleClaimContribution = (id: string) => {
    const updatedContribs = contributions.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          status: 'in-progress' as ContributionStatus,
          claimedBy: currentUser,
        };
      }
      return c;
    });
    persistContribs(updatedContribs);

    // Update inside messages too
    setMessagesMap((prev) => {
      const nextMap = { ...prev };
      Object.keys(nextMap).forEach((chId) => {
        nextMap[chId] = nextMap[chId].map((m) => {
          if (m.contribution?.id === id) {
            return {
              ...m,
              contribution: {
                ...m.contribution,
                status: 'in-progress',
                claimedBy: currentUser,
              },
            };
          }
          return m;
        });
      });
      return nextMap;
    });

    alert(`🎉 You claimed "${contributions.find(c => c.id === id)?.title}"! +50 Academic Karma awarded to your profile.`);
  };

  // Upvote contribution
  const handleUpvoteContribution = (id: string) => {
    const updatedContribs = contributions.map((c) => {
      if (c.id === id) {
        const hasUpvoted = !c.hasUpvoted;
        return {
          ...c,
          hasUpvoted,
          upvotes: (c.upvotes || 0) + (hasUpvoted ? 1 : -1),
        };
      }
      return c;
    });
    persistContribs(updatedContribs);

    setMessagesMap((prev) => {
      const nextMap = { ...prev };
      Object.keys(nextMap).forEach((chId) => {
        nextMap[chId] = nextMap[chId].map((m) => {
          if (m.contribution?.id === id) {
            const hasUpvoted = !m.contribution.hasUpvoted;
            return {
              ...m,
              contribution: {
                ...m.contribution,
                hasUpvoted,
                upvotes: (m.contribution.upvotes || 0) + (hasUpvoted ? 1 : -1),
              },
            };
          }
          return m;
        });
      });
      return nextMap;
    });
  };

  // Change contribution status (e.g. resolve bug)
  const handleStatusChangeContribution = (id: string, newStatus: ContributionStatus) => {
    const updatedContribs = contributions.map((c) => {
      if (c.id === id) return { ...c, status: newStatus };
      return c;
    });
    persistContribs(updatedContribs);

    setMessagesMap((prev) => {
      const nextMap = { ...prev };
      Object.keys(nextMap).forEach((chId) => {
        nextMap[chId] = nextMap[chId].map((m) => {
          if (m.contribution?.id === id) {
            return {
              ...m,
              contribution: { ...m.contribution, status: newStatus },
            };
          }
          return m;
        });
      });
      return nextMap;
    });
  };

  // Create new structured contribution
  const handleCreateContribution = (data: Omit<StructuredContribution, 'id' | 'createdAt'>) => {
    const newContrib: StructuredContribution = {
      ...data,
      id: `${data.type}_${Date.now()}`,
      createdAt: 'Just now',
      upvotes: 0,
      hasUpvoted: false,
    };

    const updated = [newContrib, ...contributions];
    persistContribs(updated);

    // Target channel based on type
    let targetChId = 'c_proj_disc';
    if (data.type === 'good-first-issue') targetChId = 'c_good_first_issues';
    if (data.type === 'bug') targetChId = 'c_bug_reports';
    if (data.type === 'feature') targetChId = 'c_feat_ideas';

    // Broadcast new message with card attached
    const newMsg: ChannelMessage = {
      id: `m_contrib_${Date.now()}`,
      channelId: targetChId,
      author: currentUser,
      content: `Published a new **${newContrib.type}** card:`,
      timestamp: 'Just now',
      contribution: newContrib,
      isSelf: true,
      reactions: [{ emoji: '🚀', count: 1, users: [currentUser.id] }],
    };

    const targetList = messagesMap[targetChId] || [];
    persistMessages({
      ...messagesMap,
      [targetChId]: [...targetList, newMsg],
    });

    // Switch to that channel to show the created card!
    setActiveServerId('srv_opensource');
    setActiveChannelId(targetChId);
  };

  // Create Community Server
  const handleCreateServer = async (serverData: Partial<CommunityServer>) => {
    const created = await ApiClient.createServer(serverData);
    const updated = [...servers, created];
    persistServers(updated);
    setActiveServerId(created.id);
    setActiveChannelId(created.channels[0].id);
  };

  // Join Community Server
  const handleJoinServer = (server: CommunityServer) => {
    const exists = servers.find((s) => s.id === server.id);
    if (!exists) {
      const joinedServer: CommunityServer = {
        ...server,
        isJoined: true,
      };
      const updated = [...servers, joinedServer];
      persistServers(updated);
    }
    setActiveServerId(server.id);
    setActiveChannelId(server.channels[0]?.id || 'c_general');
    setIsDiscoverModalOpen(false);
  };

  // Leave Community Server
  const handleLeaveServer = (serverId: string) => {
    const updated = servers.filter((s) => s.id !== serverId);
    persistServers(updated);
    setActiveServerId('srv_opensource');
    setActiveChannelId('c_good_first_issues');
  };

  // AI Prompt shortcut trigger
  const handlePromptAi = (promptText: string) => {
    handleSendMessage(promptText);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090b10] text-[#f1f5f9] font-sans antialiased select-none">
      {/* Mobile Top App Bar (visible only on small screens) */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-[#090c14] border-b border-[#1b2234] z-30 flex items-center justify-between px-3">
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-2 rounded-lg bg-[#141926] text-slate-300 hover:text-white"
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            CC
          </div>
          <span className="font-bold text-sm tracking-tight">#{activeChannel.name}</span>
        </div>

        <button
          onClick={() => setIsAiDrawerOpen(true)}
          className="p-2 rounded-lg bg-purple-950/80 text-purple-300 border border-purple-700/60"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Server Navigation Rail (Desktop + Mobile Drawer) */}
      <div className={`fixed inset-y-0 left-0 z-40 md:static flex md:translate-x-0 transition-transform ${
        isMobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <ServerRail
          servers={servers}
          activeServerId={activeServerId}
          onSelectServer={handleSelectServer}
          onOpenCreateModal={() => setIsCreateServerModalOpen(true)}
          onOpenDiscoverModal={() => setIsDiscoverModalOpen(true)}
          onOpenSearchModal={() => setIsSearchModalOpen(true)}
          onOpenProfile={(u) => setSelectedProfileUser(u)}
          currentUser={currentUser}
          isAiDrawerOpen={isAiDrawerOpen}
          onToggleAiDrawer={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
        />

        {/* 2. Channel Sidebar (Attached to Rail) */}
        <ChannelSidebar
          activeServer={activeServer}
          activeChannelId={activeChannel.id}
          onSelectChannel={handleSelectChannel}
          currentUser={currentUser}
          onOpenProfile={(u) => setSelectedProfileUser(u)}
          onLogout={handleLogout}
          onOpenCreateContribution={() => setIsContributionModalOpen(true)}
        />
      </div>

      {/* Mobile Backdrop overlay when drawer is open */}
      {isMobileNavOpen && (
        <div
          onClick={() => setIsMobileNavOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* 3. Main Conversation Panel (Centerpiece) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden pt-14 md:pt-0 min-w-0">
        <ConversationPanel
          activeServer={activeServer}
          activeChannel={activeChannel}
          messages={activeChannelMessages}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          onAddReaction={handleAddReaction}
          onOpenProfile={(u) => setSelectedProfileUser(u)}
          onOpenCreateContribution={() => setIsContributionModalOpen(true)}
          onClaimContribution={handleClaimContribution}
          onUpvoteContribution={handleUpvoteContribution}
          onStatusChangeContribution={handleStatusChangeContribution}
          onPromptAi={handlePromptAi}
          isMemberSidebarOpen={isMemberSidebarOpen}
          onToggleMemberSidebar={() => setIsMemberSidebarOpen(!isMemberSidebarOpen)}
          onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
        />
      </div>

      {/* 4. Server Member Sidebar (Collapsible on Desktop) */}
      <div className="hidden lg:block">
        <MemberSidebar
          members={activeServerMembers}
          serverName={activeServer.name}
          onOpenProfile={(u) => setSelectedProfileUser(u)}
          isOpen={isMemberSidebarOpen}
        />
      </div>

      {/* 5. Slide-Out AI Copilot Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        currentUser={currentUser}
        onOpenProfile={(u) => setSelectedProfileUser(u)}
      />

      {/* 6. Discover Communities Explorer Modal */}
      <DiscoverCommunitiesModal
        isOpen={isDiscoverModalOpen}
        onClose={() => setIsDiscoverModalOpen(false)}
        discoverableServers={MOCK_DISCOVERABLE_COMMUNITIES}
        joinedServerIds={servers.map((s) => s.id)}
        onJoinServer={handleJoinServer}
        onLeaveServer={handleLeaveServer}
      />

      {/* 7. Create Community Server Modal */}
      <CreateCommunityModal
        isOpen={isCreateServerModalOpen}
        onClose={() => setIsCreateServerModalOpen(false)}
        onCreateServer={handleCreateServer}
      />

      {/* 8. Create Structured Contribution Modal */}
      <CreateContributionModal
        isOpen={isContributionModalOpen}
        onClose={() => setIsContributionModalOpen(false)}
        currentUser={currentUser}
        onSubmit={handleCreateContribution}
      />

      {/* 9. Student Profile & Karma Popover Modal */}
      <StudentProfileModal
        user={selectedProfileUser}
        onClose={() => setSelectedProfileUser(null)}
        onLogout={handleLogout}
        isCurrentUser={selectedProfileUser?.id === currentUser.id}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* 10. Global Command Palette & Search (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        servers={servers}
        contributions={contributions}
        resources={resources}
        onSelectChannel={(srvId, chId) => {
          setActiveServerId(srvId);
          setActiveChannelId(chId);
        }}
        onSelectUser={(u) => setSelectedProfileUser(u)}
        onAskAi={(q) => {
          setIsAiDrawerOpen(true);
        }}
      />
    </div>
  );
}
