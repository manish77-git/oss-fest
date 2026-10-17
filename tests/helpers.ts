import { prisma } from '../src/db';
import { signToken } from '../src/middleware/auth';
import bcrypt from 'bcryptjs';

export async function clearDatabase(): Promise<void> {
  // Clear in child-to-parent order to respect foreign key cascades
  await prisma.message.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.communityMember.deleteMany();
  await prisma.community.deleteMany();
  await prisma.user.deleteMany();
}

export async function createTestUser(suffix = '1') {
  const passwordHash = await bcrypt.hash('password123', 8);
  const user = await prisma.user.create({
    data: {
      email: `student${suffix}@university.edu`,
      passwordHash,
      displayName: `Student ${suffix}`,
      department: 'Computer Science',
      academicYear: 'Senior',
      skills: 'TypeScript, React, Python',
      interests: 'Open Source, Web Development',
    },
  });

  const token = signToken({ userId: user.id, email: user.email });
  return { user, token };
}
