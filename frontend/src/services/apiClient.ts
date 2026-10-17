import { 
  CommunityServer, 
  Channel, 
  ChannelMessage, 
  StructuredContribution, 
  ServerMember, 
  User,
  ContributionStatus
} from '@/types';
import { 
  MOCK_SERVERS, 
  MOCK_DISCOVERABLE_COMMUNITIES, 
  INITIAL_CONTRIBUTIONS, 
  INITIAL_CHANNEL_MESSAGES, 
  SERVER_MEMBERS,
  CAMPUS_BOT_USER 
} from '@/data/communityData';

// API Environment configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// When no live backend is detected on mount, gracefully fall back to the robust client mock adapter
let isUsingMock = true;

export class ApiClient {
  public static getBaseUrl(): string {
    return API_BASE_URL;
  }

  public static isMockMode(): boolean {
    return isUsingMock;
  }

  public static setMockMode(val: boolean) {
    isUsingMock = val;
  }

  // ---- SERVERS / COMMUNITIES ----
  public static async getServers(): Promise<CommunityServer[]> {
    if (!isUsingMock) {
      try {
        const res = await fetch(`${API_BASE_URL}/servers`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('[ApiClient] Backend unreachable, using client adapter');
      }
    }
    // Return stored or initial servers
    const stored = typeof window !== 'undefined' ? localStorage.getItem('cc_servers') : null;
    return stored ? JSON.parse(stored) : MOCK_SERVERS;
  }

  public static async createServer(newServer: Partial<CommunityServer>): Promise<CommunityServer> {
    if (!isUsingMock) {
      try {
        const res = await fetch(`${API_BASE_URL}/servers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newServer),
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('[ApiClient] Backend unreachable, creating via client adapter');
      }
    }

    const created: CommunityServer = {
      id: `srv_${Date.now()}`,
      name: newServer.name || 'New Community',
      shortName: (newServer.name || 'NC').slice(0, 3).toUpperCase(),
      description: newServer.description || 'Student created campus community.',
      categoryType: newServer.categoryType || 'Clubs',
      badge: 'Club',
      memberCount: 1,
      isJoined: true,
      categories: [
        {
          id: `cat_${Date.now()}`,
          name: 'GENERAL',
          channelIds: [`c_gen_${Date.now()}`],
        },
      ],
      channels: [
        {
          id: `c_gen_${Date.now()}`,
          serverId: `srv_${Date.now()}`,
          name: 'general',
          topic: 'Welcome to your newly created community server!',
          type: 'text',
        },
      ],
    };

    return created;
  }

  // ---- DISCOVERY ----
  public static async getDiscoverableServers(): Promise<CommunityServer[]> {
    if (!isUsingMock) {
      try {
        const res = await fetch(`${API_BASE_URL}/discover`);
        if (res.ok) return await res.json();
      } catch (err) {}
    }
    return MOCK_DISCOVERABLE_COMMUNITIES;
  }

  // ---- CHANNELS ----
  public static async getChannels(serverId: string): Promise<Channel[]> {
    const servers = await this.getServers();
    const target = servers.find(s => s.id === serverId);
    return target?.channels || [];
  }

  // ---- MESSAGES ----
  public static async getMessages(channelId: string): Promise<ChannelMessage[]> {
    if (!isUsingMock) {
      try {
        const res = await fetch(`${API_BASE_URL}/channels/${channelId}/messages`);
        if (res.ok) return await res.json();
      } catch (err) {}
    }

    const stored = typeof window !== 'undefined' ? localStorage.getItem(`cc_msgs_${channelId}`) : null;
    if (stored) return JSON.parse(stored);

    return INITIAL_CHANNEL_MESSAGES[channelId] || [
      {
        id: `sys_welcome_${channelId}`,
        channelId,
        author: CAMPUS_BOT_USER,
        content: `👋 Welcome to the start of this channel! Feel free to send a message or start a discussion.`,
        timestamp: 'Just now',
        isSystem: true,
      },
    ];
  }

  public static async sendMessage(
    channelId: string, 
    content: string, 
    currentUser: User, 
    contribution?: StructuredContribution
  ): Promise<ChannelMessage> {
    if (!isUsingMock) {
      try {
        const res = await fetch(`${API_BASE_URL}/channels/${channelId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, contribution }),
        });
        if (res.ok) return await res.json();
      } catch (err) {}
    }

    const msg: ChannelMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      channelId,
      author: currentUser,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
      contribution,
      reactions: [],
    };

    return msg;
  }

  // ---- STRUCTURED CONTRIBUTIONS ----
  public static async getContributions(): Promise<StructuredContribution[]> {
    if (!isUsingMock) {
      try {
        const res = await fetch(`${API_BASE_URL}/contributions`);
        if (res.ok) return await res.json();
      } catch (err) {}
    }
    const stored = typeof window !== 'undefined' ? localStorage.getItem('cc_contributions') : null;
    return stored ? JSON.parse(stored) : INITIAL_CONTRIBUTIONS;
  }

  public static async createContribution(
    contribution: Omit<StructuredContribution, 'id' | 'createdAt'>
  ): Promise<StructuredContribution> {
    if (!isUsingMock) {
      try {
        const res = await fetch(`${API_BASE_URL}/contributions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contribution),
        });
        if (res.ok) return await res.json();
      } catch (err) {}
    }

    const created: StructuredContribution = {
      ...contribution,
      id: `${contribution.type}_${Date.now()}`,
      createdAt: 'Just now',
      upvotes: 0,
      hasUpvoted: false,
    };

    return created;
  }

  // ---- MEMBERS ----
  public static async getServerMembers(serverId: string): Promise<ServerMember[]> {
    if (!isUsingMock) {
      try {
        const res = await fetch(`${API_BASE_URL}/servers/${serverId}/members`);
        if (res.ok) return await res.json();
      } catch (err) {}
    }
    return SERVER_MEMBERS[serverId] || SERVER_MEMBERS['srv_opensource'] || [];
  }
}
