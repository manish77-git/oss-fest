import { z } from 'zod';
import { config } from '../config';

/**
 * Validates whether an email matches configured college domains.
 * If no domains are configured (ALLOWED_EMAIL_DOMAINS is empty), all syntactically valid emails are permitted.
 * Exact domain matching or subdomain matching (e.g. cs.college.edu for college.edu) is enforced;
 * lookalikes such as attacker-college.edu are strictly rejected.
 */
export function isAllowedEmailDomain(email: string): boolean {
  if (config.allowedEmailDomains.length === 0) {
    return true;
  }
  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return config.allowedEmailDomains.some(
    (allowed) => domain === allowed || domain.endsWith(`.${allowed}`),
  );
}

export const registerSchema = z
  .object({
    displayName: z
      .string({ required_error: 'Display name is required' })
      .trim()
      .min(1, 'Display name cannot be empty')
      .max(60, 'Display name must not exceed 60 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .toLowerCase()
      .email('Invalid email address format')
      .refine(
        (email) => isAllowedEmailDomain(email),
        () => ({
          message: `Email domain is not authorized. Permitted college domains: ${config.allowedEmailDomains.join(', ')}`,
        }),
      ),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters long')
      .max(100, 'Password must not exceed 100 characters'),
    avatarUrl: z.string().trim().url('Invalid avatar URL').optional().or(z.literal('')),
    bio: z.string().trim().max(300, 'Bio must not exceed 300 characters').optional(),
    department: z.string().trim().max(100, 'Department must not exceed 100 characters').optional(),
    academicYear: z.string().trim().max(20, 'Academic year must not exceed 20 characters').optional(),
    skills: z.union([z.string(), z.array(z.string())]).optional(),
    interests: z.union([z.string(), z.array(z.string())]).optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .toLowerCase()
      .email('Invalid email address format'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password is required'),
  })
  .strict();


export const updateUserSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, 'Display name cannot be empty')
      .max(60, 'Display name must not exceed 60 characters')
      .optional(),
    avatarUrl: z
      .string()
      .trim()
      .url('Invalid avatar URL format')
      .refine(
        (url) => url.startsWith('http://') || url.startsWith('https://'),
        'Avatar URL must use http or https protocol',
      )
      .optional()
      .nullable()
      .or(z.literal('')),
    bio: z.string().trim().max(300, 'Bio must not exceed 300 characters').optional().nullable(),
    department: z.string().trim().max(100, 'Department must not exceed 100 characters').optional().nullable(),
    academicYear: z
      .union([
        z.string().trim().min(1, 'Academic year cannot be empty').max(20, 'Academic year must not exceed 20 characters'),
        z.number().int().min(1, 'Academic year must be between 1 and 10').max(10, 'Academic year must be between 1 and 10').transform((n) => n.toString()),
      ])
      .optional()
      .nullable(),
    skills: z
      .array(
        z
          .string()
          .trim()
          .min(1, 'Skill item cannot be empty')
          .max(50, 'Skill item cannot exceed 50 characters'),
      )
      .max(30, 'Cannot exceed 30 skills')
      .optional()
      .nullable(),
    interests: z
      .array(
        z
          .string()
          .trim()
          .min(1, 'Interest item cannot be empty')
          .max(50, 'Interest item cannot exceed 50 characters'),
      )
      .max(30, 'Cannot exceed 30 interests')
      .optional()
      .nullable(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one editable profile field must be provided' },
  );


export const createCommunitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Community name must be at least 3 characters')
    .max(60, 'Community name must not exceed 60 characters')
    .regex(/^[a-zA-Z0-9 _-]+$/, 'Community name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z.string().trim().max(500, 'Description must not exceed 500 characters').optional().default(''),
});

export const updateCommunitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Community name must be at least 3 characters')
    .max(60, 'Community name must not exceed 60 characters')
    .regex(/^[a-zA-Z0-9 _-]+$/, 'Community name can only contain letters, numbers, spaces, hyphens, and underscores')
    .optional(),
  description: z.string().trim().max(500, 'Description must not exceed 500 characters').optional(),
});

export const createChannelSchema = z.object({
  name: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, 'Channel name must be at least 2 characters')
    .max(40, 'Channel name must not exceed 40 characters')
    .regex(/^[a-z0-9-]+$/, 'Channel name must be lowercase alphanumeric and hyphens only (e.g. general-chat)'),
  description: z.string().trim().max(300, 'Description must not exceed 300 characters').optional().default(''),
  type: z
    .enum(['GENERAL', 'ANNOUNCEMENTS', 'PROJECT_DISCUSSION'])
    .optional()
    .default('GENERAL'),
});

export const createMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Message content cannot be empty')
    .max(4000, 'Message cannot exceed 4000 characters'),
});

export const updateMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Message content cannot be empty')
    .max(4000, 'Message cannot exceed 4000 characters'),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['MODERATOR', 'MEMBER'], {
    errorMap: () => ({ message: "Role must be 'MODERATOR' or 'MEMBER'" }),
  }),
});

export const messageQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 100, {
      message: 'Limit must be a number between 1 and 100',
    }),
  before: z.string().optional(),
  cursor: z.string().optional(),
});
