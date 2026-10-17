import { 
  User, 
  CommunityServer, 
  Channel, 
  StructuredContribution, 
  ChannelMessage, 
  ServerMember,
  ResourceNote,
  PlacementDebrief,
  TeammateListing
} from '@/types';
import { 
  MOCK_RESOURCES, 
  MOCK_PLACEMENT_DEBRIEFS, 
  MOCK_TEAMMATE_LISTINGS 
} from './mockData';

// ─── 1. The Major Campus AI Bot ───
export const CAMPUS_BOT_USER: User = {
  id: 'usr_campus_ai',
  name: 'CampusAI',
  handle: 'campusbot',
  avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=250&q=80',
  email: 'ai@ait.edu',
  college: 'Apex Institute of Technology',
  department: 'Computer Science',
  year: 'Alumni',
  isVerified: true,
  bio: 'The unified CampusConnect AI intelligence layer. Query study resources, open-source issues, senior placement archives, and student collaborators.',
  points: 9999,
  achievements: ['Campus AI Core v2.4', 'Vault Indexed', '100% Uptime'],
  githubUrl: 'https://github.com/manish77-git/oss-fest',
};

// ─── 2. Community Contributor (No fake personas or leads) ───
export const COMMUNITY_CONTRIBUTOR_USER: User = {
  id: 'usr_contributor',
  name: 'Community Contributor',
  handle: 'contributor',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  email: 'contributor@campus.edu',
  college: 'Apex Institute of Technology',
  department: 'Computer Science',
  year: 'Junior (3rd Yr)',
  isVerified: true,
  bio: 'Open-Source Contributor & Student Developer @ CampusConnect Lab',
  points: 650,
  achievements: ['Open-Source Contributor', 'Verified Student'],
  githubUrl: 'https://github.com/manish77-git/oss-fest',
};

// Aliased for seamless internal compatibility
export const CAMPUS_MAINTAINER_USER: User = COMMUNITY_CONTRIBUTOR_USER;

export const CAMPUS_ADMIN_USER: User = {
  id: 'usr_dean',
  name: 'Dean of Academics Office',
  handle: 'academic_cell',
  avatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=250&q=80',
  email: 'dean.acad@ait.edu',
  college: 'Apex Institute of Technology',
  department: 'Computer Science',
  year: 'Alumni',
  isVerified: true,
  bio: 'Official academic notices & examination schedules',
  points: 5000,
};

// Clean reference object without fake student personas
export const MOCK_STUDENTS: Record<string, User> = {
  ai: CAMPUS_BOT_USER,
  contributor: COMMUNITY_CONTRIBUTOR_USER,
  maintainer: COMMUNITY_CONTRIBUTOR_USER,
};

// Initial Structured Contributions (Open-Source Lab)
export const INITIAL_CONTRIBUTIONS: StructuredContribution[] = [
  {
    id: 'gfi_1',
    type: 'good-first-issue',
    title: 'Add Dark Mode toggle to MedVision AI Edge viewer',
    description: 'The canvas viewport needs a high-contrast dark theme toggle for radiology darkrooms. Straightforward React Tailwind CSS state hook and Lucide Moon/Sun icon toggle.',
    status: 'open',
    difficulty: 'Beginner Friendly',
    repoUrl: 'https://github.com/manish77-git/oss-fest',
    issueUrl: 'https://github.com/manish77-git/oss-fest/issues/1',
    tags: ['React', 'TailwindCSS', 'GoodFirstIssue', 'Accessibility'],
    author: CAMPUS_MAINTAINER_USER,
    createdAt: 'Today at 10:15 AM',
    upvotes: 18,
    hasUpvoted: true,
  },
  {
    id: 'gfi_2',
    type: 'good-first-issue',
    title: 'Implement Pagination & Branch Filter for Resource Vault API',
    description: 'When students query Sem 3 to 8 notes, the endpoint currently dumps all JSON. Add limit, offset, and department query parameters to the response builder.',
    status: 'open',
    difficulty: 'Beginner Friendly',
    repoUrl: 'https://github.com/manish77-git/oss-fest',
    issueUrl: 'https://github.com/manish77-git/oss-fest/issues/2',
    tags: ['TypeScript', 'Next.js', 'REST API', 'GoodFirstIssue'],
    author: CAMPUS_MAINTAINER_USER,
    createdAt: 'Yesterday at 4:30 PM',
    upvotes: 12,
  },
  {
    id: 'gfi_3',
    type: 'good-first-issue',
    title: 'Enforce institutional email domain validation (@ait.edu)',
    description: 'Add Zod string regex validation on user registration to only allow legitimate @*.edu and @ait.edu university domain prefixes with friendly error feedback.',
    status: 'open',
    difficulty: 'Beginner Friendly',
    repoUrl: 'https://github.com/manish77-git/oss-fest',
    issueUrl: 'https://github.com/manish77-git/oss-fest/issues/3',
    tags: ['Zod', 'Regex', 'Authentication', 'GoodFirstIssue'],
    author: CAMPUS_MAINTAINER_USER,
    createdAt: 'Yesterday at 7:15 PM',
    upvotes: 9,
  },
  {
    id: 'bug_1',
    type: 'bug',
    title: 'Memory leak when rapidly switching DICOM retinal scan slices',
    description: 'WebGL canvas context is not being released when ImageSlices unmounts, causing Chrome tab to consume 1.8GB RAM after viewing 15 scans in succession.',
    status: 'open',
    severity: 'High',
    repoUrl: 'https://github.com/manish77-git/oss-fest',
    issueUrl: 'https://github.com/manish77-git/oss-fest/issues/4',
    tags: ['MemoryLeak', 'WebGL', 'ThreeJS', 'Bug'],
    author: CAMPUS_MAINTAINER_USER,
    createdAt: 'Today at 11:20 AM',
    upvotes: 7,
  },
  {
    id: 'bug_2',
    type: 'bug',
    title: 'PDF preview download fails silently on iOS Safari for ZIP bundles',
    description: 'Safari blocks programmatic Blob URL download anchors without user gesture binding. Need to show a direct fallback view link.',
    status: 'resolved',
    severity: 'Medium',
    repoUrl: 'https://github.com/manish77-git/oss-fest',
    issueUrl: 'https://github.com/manish77-git/oss-fest/issues/5',
    tags: ['Safari', 'iOS', 'Blob', 'BugFix'],
    author: CAMPUS_MAINTAINER_USER,
    createdAt: '2 days ago',
    upvotes: 15,
  },
  {
    id: 'feat_1',
    type: 'feature',
    title: 'Semantic PYQ Question Similarity & Exam Frequency Heatmaps',
    description: 'Use local embeddings (e.g. transformers.js or ONNX) to index previous 5-year exam questions. Show students which recurring topics appear with >80% frequency in end-sems.',
    status: 'open',
    difficulty: 'Intermediate',
    repoUrl: 'https://github.com/manish77-git/oss-fest',
    issueUrl: 'https://github.com/manish77-git/oss-fest/issues/6',
    tags: ['AI/ML', 'Embeddings', 'Academics', 'RFC'],
    author: CAMPUS_MAINTAINER_USER,
    createdAt: 'Yesterday at 2:00 PM',
    upvotes: 34,
    hasUpvoted: true,
  },
  {
    id: 'feat_2',
    type: 'feature',
    title: 'Automated Discord & Telegram Webhook Bot for Placement Alerts',
    description: 'Trigger instant push webhooks whenever the college placement cell posts an eligible drive notice for 3rd/4th year engineering students.',
    status: 'open',
    difficulty: 'Intermediate',
    repoUrl: 'https://github.com/manish77-git/oss-fest',
    issueUrl: 'https://github.com/manish77-git/oss-fest/issues/7',
    tags: ['Webhook', 'Node.js', 'Bot', 'Placements'],
    author: CAMPUS_MAINTAINER_USER,
    createdAt: '3 days ago',
    upvotes: 27,
  },
  {
    id: 'proj_1',
    type: 'project-update',
    title: 'CampusConnect v1.0 Released — Discord-inspired Open-Source Workspace',
    description: 'Full open-source college community platform integrated with our central CampusAI intelligence bot, structured issue cards, and academic vault.',
    status: 'resolved',
    repoUrl: 'https://github.com/manish77-git/oss-fest',
    tags: ['Release', 'Next.js', 'React', 'CampusAI'],
    author: CAMPUS_MAINTAINER_USER,
    createdAt: 'Yesterday at 9:00 PM',
    upvotes: 45,
  },
];

// Initial Servers
export const MOCK_SERVERS: CommunityServer[] = [
  {
    id: 'srv_opensource',
    name: 'Open-Source Lab',
    shortName: 'OSL',
    description: 'The campus open-source headquarters. Real code, bug reports, feature proposals, and beginner-friendly good first issues.',
    badge: 'Hub',
    isVerified: true,
    categoryType: 'Open Source',
    memberCount: 284,
    unreadCount: 3,
    hasAlert: true,
    isJoined: true,
    categories: [
      {
        id: 'cat_collab',
        name: 'COLLABORATION & BUGS',
        channelIds: ['c_proj_disc', 'c_bug_reports', 'c_feat_ideas', 'c_good_first_issues', 'c_dev'],
      },
      {
        id: 'cat_ai',
        name: 'AI COPILOT',
        channelIds: ['c_campus_ai'],
      },
      {
        id: 'cat_general',
        name: 'COMMUNITY',
        channelIds: ['c_os_general'],
      },
    ],
    channels: [
      {
        id: 'c_proj_disc',
        serverId: 'srv_opensource',
        name: 'project-discussions',
        topic: 'Architecture debates, repo releases, and open-source project showcases',
        type: 'opensource',
        unreadCount: 0,
      },
      {
        id: 'c_bug_reports',
        serverId: 'srv_opensource',
        name: 'bug-reports',
        topic: 'Track and report reproducible software bugs across campus open-source repositories',
        type: 'opensource',
        unreadCount: 2,
      },
      {
        id: 'c_feat_ideas',
        serverId: 'srv_opensource',
        name: 'feature-ideas',
        topic: 'Brainstorm, propose and vote on product enhancements and feature RFCs',
        type: 'opensource',
        unreadCount: 0,
      },
      {
        id: 'c_good_first_issues',
        serverId: 'srv_opensource',
        name: 'good-first-issues',
        topic: 'Curated beginner-friendly tasks for students making their first open-source PRs',
        type: 'opensource',
        unreadCount: 1,
      },
      {
        id: 'c_dev',
        serverId: 'srv_opensource',
        name: 'development',
        topic: 'Code snippets, PR reviews, CI/CD pipeline debugs and git workflows',
        type: 'opensource',
        unreadCount: 0,
      },
      {
        id: 'c_campus_ai',
        serverId: 'srv_opensource',
        name: 'campus-ai-assistant',
        topic: 'Autonomous Campus AI Copilot: query issues, find PYQs, fetch senior debriefs & summarize channels',
        type: 'ai-assistant',
        unreadCount: 0,
      },
      {
        id: 'c_os_general',
        serverId: 'srv_opensource',
        name: 'general-chat',
        topic: 'Watercooler chat, open-source tech news, Linux distros, and developer tooling',
        type: 'text',
        unreadCount: 0,
      },
    ],
  },
  {
    id: 'srv_campus',
    name: 'CampusConnect Apex Hub',
    shortName: 'AIT',
    description: 'Official verified student and faculty community server for Apex Institute of Technology.',
    badge: 'Official',
    isVerified: true,
    categoryType: 'Official College',
    memberCount: 1420,
    unreadCount: 1,
    isJoined: true,
    categories: [
      {
        id: 'cat_main',
        name: 'CAMPUS DIRECTORY',
        channelIds: ['c_announcements', 'c_general', 'c_introductions'],
      },
      {
        id: 'cat_lounge',
        name: 'STUDENT LOUNGE',
        channelIds: ['c_cafeteria'],
      },
    ],
    channels: [
      {
        id: 'c_announcements',
        serverId: 'srv_campus',
        name: 'announcements',
        topic: 'Official institutional notifications, exam date sheets, holiday advisories & placement drives',
        type: 'text',
        unreadCount: 1,
      },
      {
        id: 'c_general',
        serverId: 'srv_campus',
        name: 'general',
        topic: 'Main campus lobby: converse with peers across all engineering and science departments',
        type: 'text',
        unreadCount: 0,
      },
      {
        id: 'c_introductions',
        serverId: 'srv_campus',
        name: 'introductions',
        topic: 'Say hello! Share your batch, department, tech interests and GitHub handles',
        type: 'text',
        unreadCount: 0,
      },
      {
        id: 'c_cafeteria',
        serverId: 'srv_campus',
        name: 'cafeteria-chatter',
        topic: 'Casual conversations, hostel banter, sports tournament discussions',
        type: 'text',
        unreadCount: 0,
      },
    ],
  },
  {
    id: 'srv_cse',
    name: 'CSE Community',
    shortName: 'CSE',
    description: 'Department of Computer Science & Engineering academic knowledge base & resources.',
    badge: 'Dept',
    isVerified: true,
    categoryType: 'Department',
    memberCount: 540,
    unreadCount: 0,
    isJoined: true,
    categories: [
      {
        id: 'cat_cse_acad',
        name: 'ACADEMICS & NOTES',
        channelIds: ['c_cse_academics', 'c_cse_resources', 'c_cse_showcase'],
      },
    ],
    channels: [
      {
        id: 'c_cse_academics',
        serverId: 'srv_cse',
        name: 'academics',
        topic: 'Curriculum syllabus questions, lab viva prep, professor consultation schedules',
        type: 'academic',
        unreadCount: 0,
      },
      {
        id: 'c_cse_resources',
        serverId: 'srv_cse',
        name: 'resources-vault',
        topic: 'Subject lecture notes, previous year exam papers (PYQs), formula cheat sheets',
        type: 'academic',
        unreadCount: 0,
      },
      {
        id: 'c_cse_showcase',
        serverId: 'srv_cse',
        name: 'project-showcase',
        topic: 'Semester capstones, web/mobile projects, research papers & live demos',
        type: 'academic',
        unreadCount: 0,
      },
    ],
  },
  {
    id: 'srv_sih',
    name: 'SIH & Hackathons Guild',
    shortName: 'SIH',
    description: 'Inter-college hackathon squad formation, ideation reviews, pitch practice & mentor Q&A.',
    badge: 'Guild',
    isVerified: true,
    categoryType: 'Hackathons',
    memberCount: 380,
    unreadCount: 0,
    isJoined: true,
    categories: [
      {
        id: 'cat_sih_ops',
        name: 'HACKATHON SQUADS',
        channelIds: ['c_team_formation', 'c_ideation', 'c_pitch_review'],
      },
    ],
    channels: [
      {
        id: 'c_team_formation',
        serverId: 'srv_sih',
        name: 'team-formation',
        topic: 'Find complementary teammates (Frontend, AI/ML, Hardware, Pitchers) for upcoming hackathons',
        type: 'opensource',
        unreadCount: 0,
      },
      {
        id: 'c_ideation',
        serverId: 'srv_sih',
        name: 'ideation-brainstorm',
        topic: 'Problem statement selection, feasibility feedback and hardware architecture brainstorming',
        type: 'text',
        unreadCount: 0,
      },
      {
        id: 'c_pitch_review',
        serverId: 'srv_sih',
        name: 'pitch-review',
        topic: 'Get feedback on pitch decks, 3-minute video demos and mentor presentation dry-runs',
        type: 'text',
        unreadCount: 0,
      },
    ],
  },
];

// Additional Discoverable Communities
export const MOCK_DISCOVERABLE_COMMUNITIES: CommunityServer[] = [
  {
    id: 'srv_ai_robotics',
    name: 'AI & Robotics Guild',
    shortName: 'AIR',
    description: 'Autonomous rovers, computer vision models, ROS2, and embedded microcontrollers research group.',
    badge: 'Club',
    isVerified: true,
    categoryType: 'Clubs',
    memberCount: 215,
    isJoined: false,
    categories: [
      { id: 'cat_air', name: 'ROBOTICS LAB', channelIds: ['c_air_general', 'c_hardware_builds'] }
    ],
    channels: [
      { id: 'c_air_general', serverId: 'srv_ai_robotics', name: 'general', topic: 'Robotics news & project updates', type: 'text' },
      { id: 'c_hardware_builds', serverId: 'srv_ai_robotics', name: 'hardware-builds', topic: 'Motor controllers, PCB schematics, LiDAR sensors', type: 'opensource' },
    ],
  },
  {
    id: 'srv_cp',
    name: 'Competitive Programming Elite',
    shortName: 'CPE',
    description: 'Codeforces Div 2/1 contest debriefs, LeetCode daily grind, and ICPC regional practice sessions.',
    badge: 'Guild',
    isVerified: true,
    categoryType: 'Clubs',
    memberCount: 310,
    isJoined: false,
    categories: [
      { id: 'cat_cp', name: 'CONTEST ARENA', channelIds: ['c_cp_debriefs', 'c_graph_dp'] }
    ],
    channels: [
      { id: 'c_cp_debriefs', serverId: 'srv_cp', name: 'contest-debriefs', topic: 'Editorial discussions after Codeforces and AtCoder rounds', type: 'text' },
      { id: 'c_graph_dp', serverId: 'srv_cp', name: 'hard-problems', topic: 'Heavy-light decomposition, segment trees & DP with bitmask', type: 'academic' },
    ],
  },
];

// Preloaded Channel Messages
export const INITIAL_CHANNEL_MESSAGES: Record<string, ChannelMessage[]> = {
  // OPEN-SOURCE LAB: good-first-issues
  c_good_first_issues: [
    {
      id: 'msg_gfi_sys',
      channelId: 'c_good_first_issues',
      author: CAMPUS_BOT_USER,
      content: '👋 Welcome to **#good-first-issues**! All tasks posted here are curated for students making their first open-source pull requests. Claim an issue, submit your PR, and earn Academic Karma points! 🌟',
      timestamp: 'Today at 9:00 AM',
      isSystem: true,
    },
    {
      id: 'msg_gfi_1',
      channelId: 'c_good_first_issues',
      author: CAMPUS_MAINTAINER_USER,
      content: 'New frontend task available on the repository! Ready for claiming:',
      timestamp: 'Today at 10:15 AM',
      contribution: INITIAL_CONTRIBUTIONS[0],
      reactions: [{ emoji: '🔥', count: 4, users: ['usr_campus_ai'] }],
    },
    {
      id: 'msg_gfi_2',
      channelId: 'c_good_first_issues',
      author: CAMPUS_MAINTAINER_USER,
      content: 'Backend task: Typed query parameter filtering for Resource Vault:',
      timestamp: 'Today at 11:30 AM',
      contribution: INITIAL_CONTRIBUTIONS[1],
      reactions: [{ emoji: '🚀', count: 3, users: ['usr_campus_ai'] }],
    },
    {
      id: 'msg_gfi_3',
      channelId: 'c_good_first_issues',
      author: CAMPUS_MAINTAINER_USER,
      content: 'Authentication validation ticket for institutional student registrations:',
      timestamp: 'Today at 12:15 PM',
      contribution: INITIAL_CONTRIBUTIONS[2],
    },
  ],

  // OPEN-SOURCE LAB: bug-reports
  c_bug_reports: [
    {
      id: 'msg_bug_sys',
      channelId: 'c_bug_reports',
      author: CAMPUS_BOT_USER,
      content: '🚨 **#bug-reports**: Report software defects with reproducible steps, environment details, and GitHub issue URLs. Maintainers review submissions daily.',
      timestamp: 'Yesterday at 8:00 AM',
      isSystem: true,
    },
    {
      id: 'msg_bug_1',
      channelId: 'c_bug_reports',
      author: CAMPUS_MAINTAINER_USER,
      content: 'Tracked WebGL canvas context release issue:',
      timestamp: 'Today at 11:20 AM',
      contribution: INITIAL_CONTRIBUTIONS[3],
      reactions: [{ emoji: '👀', count: 2, users: ['usr_campus_ai'] }],
    },
    {
      id: 'msg_bug_2',
      channelId: 'c_bug_reports',
      author: CAMPUS_MAINTAINER_USER,
      content: 'Resolved the iOS Safari blob download issue:',
      timestamp: '2 days ago',
      contribution: INITIAL_CONTRIBUTIONS[4],
    },
  ],

  // OPEN-SOURCE LAB: feature-ideas
  c_feat_ideas: [
    {
      id: 'msg_feat_1',
      channelId: 'c_feat_ideas',
      author: CAMPUS_MAINTAINER_USER,
      content: 'Proposing an AI feature for our Academic Vault! Check out this RFC and vote with reactions:',
      timestamp: 'Yesterday at 2:00 PM',
      contribution: INITIAL_CONTRIBUTIONS[5],
      reactions: [
        { emoji: '💡', count: 8, users: ['usr_campus_ai'] },
        { emoji: '🙌', count: 5, users: ['usr_contributor'] }
      ],
    },
    {
      id: 'msg_feat_2',
      channelId: 'c_feat_ideas',
      author: CAMPUS_MAINTAINER_USER,
      content: 'Placement notice push alerts integration:',
      timestamp: '3 days ago',
      contribution: INITIAL_CONTRIBUTIONS[6],
      reactions: [{ emoji: '🔥', count: 6, users: ['usr_campus_ai'] }],
    },
  ],

  // OPEN-SOURCE LAB: project-discussions
  c_proj_disc: [
    {
      id: 'msg_proj_1',
      channelId: 'c_proj_disc',
      author: CAMPUS_MAINTAINER_USER,
      content: 'Major milestone update for CampusConnect open-source platform:',
      timestamp: 'Yesterday at 9:00 PM',
      contribution: INITIAL_CONTRIBUTIONS[7],
      reactions: [{ emoji: '🎉', count: 12, users: ['usr_campus_ai'] }],
    },
  ],

  // OPEN-SOURCE LAB: development
  c_dev: [
    {
      id: 'msg_dev_1',
      channelId: 'c_dev',
      author: CAMPUS_MAINTAINER_USER,
      content: '```bash\n# Reminder for anyone pushing PRs to CampusConnect:\nnpm run build\nnpm run lint\n```\nPlease make sure Next.js Turbopack build succeeds locally before opening a pull request!',
      timestamp: 'Today at 9:00 AM',
    },
  ],

  // OPEN-SOURCE LAB: campus-ai-assistant
  c_campus_ai: [
    {
      id: 'msg_ai_welcome',
      channelId: 'c_campus_ai',
      author: CAMPUS_BOT_USER,
      content: 'Hello! 👋 I am **CampusAI Copilot** — your autonomous intelligence layer for CampusConnect.\n\nI am connected in real-time to our **Open-Source Lab, Academic Resource Vault, Senior Placement Debriefs, and Hackathon Squads**.\n\nHow can I accelerate your campus work today?',
      timestamp: 'Today at 8:00 AM',
      aiPayload: {
        intent: 'general',
        actionPrompt: 'Click a quick action or ask in natural language:',
      },
    },
  ],

  // CAMPUS HUB: announcements
  c_announcements: [
    {
      id: 'msg_ann_1',
      channelId: 'c_announcements',
      author: CAMPUS_ADMIN_USER,
      content: '📢 **OFFICIAL NOTICE — END SEMESTER SCHEDULE (NOV 2026)**\n\nThe final timetable for 3rd, 5th, and 7th Semester B.Tech examinations has been ratified. The Central Library reading room on Level 2 will stay open 24/7 starting Monday. Hall tickets available on the university ERP.',
      timestamp: 'Yesterday at 3:00 PM',
      reactions: [{ emoji: '📚', count: 24, users: ['usr_campus_ai'] }],
    },
  ],

  // CAMPUS HUB: general
  c_general: [
    {
      id: 'msg_gen_1',
      channelId: 'c_general',
      author: CAMPUS_MAINTAINER_USER,
      content: 'Welcome to the CampusConnect Community Lobby! Feel free to connect, ask questions, and collaborate with peers across campus.',
      timestamp: 'Today at 10:00 AM',
    },
  ],

  // CSE COMMUNITY: resources-vault
  c_cse_resources: [
    {
      id: 'msg_res_sys',
      channelId: 'c_cse_resources',
      author: CAMPUS_BOT_USER,
      content: '📚 **#resources-vault**: Subject lecture notes, previous year question papers (PYQs), and formula cheat sheets verified by top faculty and department toppers.',
      timestamp: '2 days ago',
      isSystem: true,
    },
  ],

  // SIH & HACKATHONS: team-formation
  c_team_formation: [
    {
      id: 'msg_team_1',
      channelId: 'c_team_formation',
      author: CAMPUS_MAINTAINER_USER,
      content: '🚀 **Smart India Hackathon (SIH 2026)** squad coordination channel is open! Post your project idea and complementary skills needed to form your team.',
      timestamp: 'Today at 10:00 AM',
      reactions: [{ emoji: '🤝', count: 5, users: ['usr_campus_ai'] }],
    },
  ],
};

// Server Member Roster (Authentic Maintainers + CampusAI; logged-in user dynamically appended)
export const SERVER_MEMBERS: Record<string, ServerMember[]> = {
  srv_opensource: [
    {
      user: CAMPUS_BOT_USER,
      roleName: 'Campus AI',
      roleCategory: 'AI & Automation',
      presence: 'online',
      customStatus: 'Autonomous real-time intelligence active',
    },
    {
      user: COMMUNITY_CONTRIBUTOR_USER,
      roleName: 'Contributor',
      roleCategory: 'Student Contributors',
      presence: 'online',
      customStatus: 'Contributing open-source PRs & issues',
    },
  ],
  srv_campus: [
    {
      user: CAMPUS_BOT_USER,
      roleName: 'Campus AI',
      roleCategory: 'AI & Automation',
      presence: 'online',
    },
    {
      user: CAMPUS_ADMIN_USER,
      roleName: 'Administration',
      roleCategory: 'Mentors & Seniors',
      presence: 'online',
    },
  ],
  srv_cse: [
    {
      user: CAMPUS_BOT_USER,
      roleName: 'Campus AI',
      roleCategory: 'AI & Automation',
      presence: 'online',
    },
    {
      user: COMMUNITY_CONTRIBUTOR_USER,
      roleName: 'Contributor',
      roleCategory: 'Student Contributors',
      presence: 'online',
    },
  ],
  srv_sih: [
    {
      user: CAMPUS_BOT_USER,
      roleName: 'Campus AI',
      roleCategory: 'AI & Automation',
      presence: 'online',
    },
    {
      user: COMMUNITY_CONTRIBUTOR_USER,
      roleName: 'Contributor',
      roleCategory: 'Student Contributors',
      presence: 'online',
    },
  ],
};
