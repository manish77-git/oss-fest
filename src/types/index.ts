export type Department = 'Computer Science' | 'Electronics & Comm.' | 'Mechanical' | 'Information Tech' | 'Electrical' | 'Civil';

export type Semester = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type StudentRole = 'Fresher (1st Yr)' | 'Sophomore (2nd Yr)' | 'Junior (3rd Yr)' | 'Senior (4th Yr)' | 'Alumni' | 'Class Representative';

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  email: string;
  college: string;
  department: Department;
  year: StudentRole;
  isVerified: boolean;
  bio: string;
  points: number; // Academic karma points for sharing notes
  achievements?: string[];
  company?: string; // For seniors/alumni
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface Post {
  id: string;
  author: User;
  type: 'social' | 'project' | 'event' | 'question';
  content: string;
  images?: string[];
  tags: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  hasLiked?: boolean;
  hasSaved?: boolean;
  createdAt: string;
  projectMeta?: {
    demoUrl?: string;
    repoUrl?: string;
    techStack: string[];
  };
  eventMeta?: {
    date: string;
    venue: string;
    organizer: string;
  };
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  likesCount: number;
}

export type ResourceCategory = 'PYQ (Exam Papers)' | 'Lecture Notes' | 'Lab Manuals' | 'Cheat Sheets' | 'Textbooks';

export interface ResourceNote {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  department: Department;
  semester: Semester;
  category: ResourceCategory;
  fileSize: string;
  fileType: 'pdf' | 'zip' | 'docx';
  uploader: User;
  upvotes: number;
  downloads: number;
  hasUpvoted?: boolean;
  verifiedByFacultyOrCR: boolean;
  downloadUrl: string;
  createdAt: string;
  description: string;
}

export interface Mentor {
  id: string;
  user: User;
  domains: string[];
  companyOffers?: string[]; // e.g. ["Amazon", "Uber", "Qualcomm"]
  currentRole?: string;
  adviceTopics: string[];
  rating: number;
  sessionsConducted: number;
  availability: 'Available this week' | 'Busy' | 'Async Q&A only';
}

export interface PlacementDebrief {
  id: string;
  senior: User;
  companyName: string;
  companyLogo?: string;
  role: string;
  type: 'On-Campus Internship' | 'On-Campus Full-time' | 'Off-Campus';
  stipendOrPackage: string;
  roundsCount: number;
  difficulty: 'Moderate' | 'Hard' | 'Very Challenging';
  rounds: {
    roundName: string;
    description: string;
    questionsAsked: string[];
  }[];
  prepTips: string[];
  createdAt: string;
}

export interface TeammateListing {
  id: string;
  author: User;
  title: string;
  competitionOrGoal: string; // e.g. "Smart India Hackathon 2026", "Final Year Capstone"
  description: string;
  rolesNeeded: string[];
  skillsRequired: string[];
  currentTeamSize: number;
  maxTeamSize: number;
  deadline: string;
  createdAt: string;
}

export interface CampusStory {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorBadge: string;
  hasUnseenStory: boolean;
  storyImage: string;
  caption: string;
  timeAgo: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
  attachmentName?: string;
}

export interface ChatConversation {
  id: string;
  participantName: string;
  participantAvatar: string;
  participantRole: string;
  isVerified: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  messages: ChatMessage[];
}

export interface CampusNotification {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  type: 'like' | 'upvote' | 'mentorship' | 'teammate' | 'announcement';
  read: boolean;
  avatar?: string;
}

export type ChannelType = 'text' | 'opensource' | 'academic' | 'ai-assistant';

export interface Channel {
  id: string;
  serverId: string;
  name: string;
  topic: string;
  type: ChannelType;
  unreadCount?: number;
  isPrivate?: boolean;
}

export interface ChannelCategory {
  id: string;
  name: string;
  channelIds: string[];
}

export interface CommunityServer {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon?: string;
  badge?: string;
  isVerified?: boolean;
  categoryType: 'Official College' | 'Open Source' | 'Department' | 'Clubs' | 'Hackathons';
  memberCount: number;
  unreadCount?: number;
  hasAlert?: boolean;
  isJoined: boolean;
  channels: Channel[];
  categories: ChannelCategory[];
}

export type ContributionType = 'bug' | 'feature' | 'good-first-issue' | 'project-update';
export type ContributionStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type ContributionDifficulty = 'Beginner Friendly' | 'Intermediate' | 'Advanced';
export type ContributionSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface StructuredContribution {
  id: string;
  type: ContributionType;
  title: string;
  description: string;
  status: ContributionStatus;
  difficulty?: ContributionDifficulty;
  severity?: ContributionSeverity;
  repoUrl?: string;
  issueUrl?: string;
  tags: string[];
  author: User;
  createdAt: string;
  claimedBy?: User;
  upvotes?: number;
  hasUpvoted?: boolean;
}

export interface ChannelMessage {
  id: string;
  channelId: string;
  author: User;
  content: string;
  timestamp: string;
  isSelf?: boolean;
  edited?: boolean;
  isSystem?: boolean;
  contribution?: StructuredContribution;
  aiPayload?: {
    intent: 'issues' | 'resources' | 'debriefs' | 'teammates' | 'summary' | 'general';
    summaryText?: string;
    resources?: ResourceNote[];
    debriefs?: PlacementDebrief[];
    issues?: StructuredContribution[];
    teammates?: TeammateListing[];
    actionPrompt?: string;
  };
  reactions?: { emoji: string; count: number; users: string[] }[];
}

export interface ServerMember {
  user: User;
  roleName: string;
  roleCategory: 'Core Maintainers' | 'Mentors & Seniors' | 'Student Contributors' | 'AI & Automation';
  presence: 'online' | 'idle' | 'dnd' | 'offline';
  customStatus?: string;
}

