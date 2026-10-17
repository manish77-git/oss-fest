import { 
  StructuredContribution, 
  ResourceNote, 
  PlacementDebrief, 
  TeammateListing, 
  ChannelMessage 
} from '@/types';
import { 
  MOCK_RESOURCES, 
  MOCK_PLACEMENT_DEBRIEFS, 
  MOCK_TEAMMATE_LISTINGS 
} from '@/data/mockData';
import { 
  INITIAL_CONTRIBUTIONS, 
  CAMPUS_BOT_USER 
} from '@/data/communityData';

export interface AIResponse {
  replyText: string;
  payload?: {
    intent: 'issues' | 'resources' | 'debriefs' | 'teammates' | 'summary' | 'general';
    summaryText?: string;
    resources?: ResourceNote[];
    debriefs?: PlacementDebrief[];
    issues?: StructuredContribution[];
    teammates?: TeammateListing[];
    actionPrompt?: string;
  };
}

export class AIAssistantService {
  /**
   * Process a natural language query from the student,
   * intelligently extract intent and fetch relevant campus data.
   */
  public static async queryAssistant(
    query: string,
    currentChannelMessages: ChannelMessage[] = [],
    activeContributions: StructuredContribution[] = INITIAL_CONTRIBUTIONS,
    activeResources: ResourceNote[] = MOCK_RESOURCES
  ): Promise<AIResponse> {
    const q = query.toLowerCase().trim();

    // 1. GOOD FIRST ISSUES / BUGS / OPEN-SOURCE COLLABORATION
    if (
      q.includes('good first issue') || 
      q.includes('first issue') || 
      q.includes('beginner') || 
      q.includes('contribution') ||
      q.includes('open source') ||
      q.includes('bug report') ||
      q.includes('bugs') ||
      q.includes('issue')
    ) {
      let filtered = [...activeContributions];
      let titleMessage = 'Here are the active open-source tasks and good first issues I found across our campus repositories:';

      if (q.includes('beginner') || q.includes('good first')) {
        filtered = filtered.filter(c => c.type === 'good-first-issue');
        titleMessage = 'Found **' + filtered.length + ' beginner-friendly Good First Issues** curated by campus maintainers for your first PR:';
      } else if (q.includes('bug')) {
        filtered = filtered.filter(c => c.type === 'bug');
        titleMessage = 'Found **' + filtered.length + ' open bug reports** currently being tracked:';
      } else if (q.includes('feature')) {
        filtered = filtered.filter(c => c.type === 'feature');
        titleMessage = 'Found **' + filtered.length + ' active feature proposals and RFCs**:';
      }

      if (filtered.length === 0) {
        filtered = activeContributions.slice(0, 3);
      }

      return {
        replyText: `${titleMessage}\n\n*You can click any issue below to review the repository link, discuss in the channel, or claim it to earn Academic Karma!* ⚡`,
        payload: {
          intent: 'issues',
          issues: filtered,
          actionPrompt: 'Need help writing code or setting up the repo? Ask me anytime!',
        },
      };
    }

    // 2. ACADEMIC NOTES, PYQs & CHEAT SHEETS
    if (
      q.includes('note') || 
      q.includes('pyq') || 
      q.includes('paper') || 
      q.includes('exam') || 
      q.includes('resource') ||
      q.includes('os') ||
      q.includes('dbms') ||
      q.includes('operating system') ||
      q.includes('algorithm') ||
      q.includes('daa') ||
      q.includes('sem')
    ) {
      let matching = activeResources;

      if (q.includes('os') || q.includes('operating system')) {
        matching = matching.filter(r => 
          r.title.toLowerCase().includes('operating') || 
          r.courseName.toLowerCase().includes('operating') ||
          r.courseCode.includes('CS501')
        );
      } else if (q.includes('dbms') || q.includes('database')) {
        matching = matching.filter(r => 
          r.title.toLowerCase().includes('dbms') || 
          r.courseName.toLowerCase().includes('database') ||
          r.courseCode.includes('CS502')
        );
      } else if (q.includes('daa') || q.includes('algorithm')) {
        matching = matching.filter(r => 
          r.title.toLowerCase().includes('daa') || 
          r.courseName.toLowerCase().includes('algorithm') ||
          r.courseCode.includes('CS401')
        );
      } else if (q.includes('sem 5') || q.includes('5th sem')) {
        matching = matching.filter(r => r.semester === 5);
      } else if (q.includes('pyq') || q.includes('exam')) {
        matching = matching.filter(r => r.category === 'PYQ (Exam Papers)');
      }

      if (matching.length === 0) {
        matching = activeResources.slice(0, 3);
      }

      return {
        replyText: `📚 I searched the **Apex Academic Resource Vault** and retrieved **${matching.length} verified study materials** matching your request:\n\n*All files have been verified by faculty or department CRs with top peer upvotes.*`,
        payload: {
          intent: 'resources',
          resources: matching,
          actionPrompt: 'Click download to view notes, or ask me for specific topic breakdowns.',
        },
      };
    }

    // 3. SENIOR PLACEMENT DEBRIEFS & INTERVIEW PREP
    if (
      q.includes('placement') || 
      q.includes('interview') || 
      q.includes('microsoft') || 
      q.includes('amazon') || 
      q.includes('morgan') ||
      q.includes('debrief') || 
      q.includes('senior') ||
      q.includes('oa') ||
      q.includes('salary') ||
      q.includes('package')
    ) {
      let matchingDebriefs = MOCK_PLACEMENT_DEBRIEFS;

      if (q.includes('microsoft')) {
        matchingDebriefs = matchingDebriefs.filter(d => d.companyName.toLowerCase().includes('microsoft'));
      } else if (q.includes('amazon')) {
        matchingDebriefs = matchingDebriefs.filter(d => d.companyName.toLowerCase().includes('amazon'));
      } else if (q.includes('morgan')) {
        matchingDebriefs = matchingDebriefs.filter(d => d.companyName.toLowerCase().includes('morgan'));
      }

      if (matchingDebriefs.length === 0) {
        matchingDebriefs = MOCK_PLACEMENT_DEBRIEFS;
      }

      return {
        replyText: `💼 Found **${matchingDebriefs.length} verified Senior Placement Debriefs** from recent on-campus & off-campus hiring drives.\n\n*Includes round-by-round breakdown, coding questions asked, and preparation roadmaps directly from placed seniors:*`,
        payload: {
          intent: 'debriefs',
          debriefs: matchingDebriefs,
          actionPrompt: 'You can request a 1-on-1 mock interview with any senior via Senior Connect!',
        },
      };
    }

    // 4. HACKATHONS & TEAMMATE SQUADS
    if (
      q.includes('teammate') || 
      q.includes('hackathon') || 
      q.includes('sih') || 
      q.includes('team') || 
      q.includes('squad') ||
      q.includes('partner') ||
      q.includes('competitions')
    ) {
      return {
        replyText: `🚀 Here are the active **Hackathon & Project Squads** looking for members right now at Apex Institute:`,
        payload: {
          intent: 'teammates',
          teammates: MOCK_TEAMMATE_LISTINGS,
          actionPrompt: 'Click "Request to Join Squad" on any listing to apply with your profile & GitHub!',
        },
      };
    }

    // 5. CHANNEL OR BUG SUMMARY
    if (q.includes('summarize') || q.includes('summary') || q.includes('what happened') || q.includes('overview')) {
      const bugCount = activeContributions.filter(c => c.type === 'bug' && c.status === 'open').length;
      const gfiCount = activeContributions.filter(c => c.type === 'good-first-issue' && c.status === 'open').length;
      const recentAuthors = Array.from(new Set(currentChannelMessages.map(m => m.author.name))).slice(0, 4);

      const summary = `📊 **Channel Intelligence Summary**:\n` +
        `• **Active Open Bugs:** ${bugCount} pending resolution (High priority: MedVision WebGL slice leak)\n` +
        `• **Good First Issues:** ${gfiCount} available for beginner contributors (Zod email regex, Vault pagination)\n` +
        `• **Recent Key Contributors:** ${recentAuthors.join(', ') || 'Priya, Vikram, Devansh, Aarav'}\n` +
        `• **Latest Milestones:** MedVision AI v1.2 quantized to INT8 with 82ms inference on edge devices.\n` +
        `• **Next Steps:** Complete Turbopack verification and resolve iOS Safari bundle downloads.`;

      return {
        replyText: summary,
        payload: {
          intent: 'summary',
          summaryText: summary,
          actionPrompt: 'Would you like me to fetch the specific issue cards for any of these?',
        },
      };
    }

    // 6. DEFAULT / GENERAL AI CAMPUS ASSISTANCE
    return {
      replyText: `I am your **CampusAI Assistant** 🤖. I can directly fetch live data from anywhere across CampusConnect.\n\nHere are some things you can ask me to do right now:\n\n` +
        `• *"Show me all Good First Issues in the Open-Source Lab"*\n` +
        `• *"Find Semester 5 Operating Systems or DBMS notes"*\n` +
        `• *"Show Microsoft & Amazon senior placement debriefs"*\n` +
        `• *"Find teammates for Smart India Hackathon"*\n` +
        `• *"Summarize open bug reports"*\n\n` +
        `What would you like me to pull up for you?`,
      payload: {
        intent: 'general',
        actionPrompt: 'Try one of the quick action pills below or type your query!',
      },
    };
  }
}
