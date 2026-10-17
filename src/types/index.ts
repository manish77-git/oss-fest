import { Request } from 'express';

export type CommunityRole = 'OWNER' | 'MODERATOR' | 'MEMBER';

export type ChannelType = 'GENERAL' | 'ANNOUNCEMENTS' | 'PROJECT_DISCUSSION';

export interface AuthTokenPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export interface CommunityMembershipContext {
  role: CommunityRole;
  communityId: string;
  userId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  communityMembership?: CommunityMembershipContext;
}

export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}
