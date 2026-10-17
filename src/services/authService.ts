import { User, Department, StudentRole } from '@/types';

const AUTH_STORAGE_KEY = 'cc_auth_session';

// Verified Standard Student Account for immediate evaluation without fake personas
export const DEMO_STUDENT_ACCOUNT: User & { password: string } = {
  id: 'usr_student',
  name: 'Student Member',
  handle: 'student_member',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
  email: 'student@ait.edu',
  password: 'password123',
  college: 'Apex Institute of Technology',
  department: 'Computer Science',
  year: 'Junior (3rd Yr)',
  isVerified: true,
  bio: 'Computer Science Student @ Apex Institute of Technology | Open Source Enthusiast',
  points: 150,
  achievements: ['Verified Student Member'],
  githubUrl: 'https://github.com',
};

export const INITIAL_STUDENT_ACCOUNTS: Array<User & { password: string }> = [
  DEMO_STUDENT_ACCOUNT,
];

export class AuthService {
  public static getAllAccounts(): Array<User & { password: string }> {
    if (typeof window === 'undefined') return INITIAL_STUDENT_ACCOUNTS;
    const stored = localStorage.getItem('cc_registered_users');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return [...INITIAL_STUDENT_ACCOUNTS, ...parsed];
      } catch (e) {}
    }
    return INITIAL_STUDENT_ACCOUNTS;
  }

  public static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const session = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!session) return null;
    try {
      return JSON.parse(session);
    } catch (e) {
      return null;
    }
  }

  public static login(email: string, password: string): { success: boolean; user?: User; error?: string } {
    const trimmedEmail = email.toLowerCase().trim();
    const accounts = this.getAllAccounts();
    const found = accounts.find(
      (acc) => acc.email.toLowerCase() === trimmedEmail && acc.password === password
    );

    if (found) {
      const { password: _, ...userWithoutPassword } = found;
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithoutPassword));
      }
      return { success: true, user: userWithoutPassword };
    }

    // Check if email domain is valid institutional format
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return { success: false, error: 'Please enter a valid campus email address (e.g. name@college.edu).' };
    }

    // If valid format and password is at least 6 characters, auto-provision user if they prefer seamless entry
    if (password.length >= 6) {
      const namePart = trimmedEmail.split('@')[0];
      const formattedName = namePart
        .split(/[._-]/)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');

      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: formattedName || 'Campus Student',
        handle: namePart.replace(/[^a-zA-Z0-9_]/g, '_'),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
        email: trimmedEmail,
        college: 'Apex Institute of Technology',
        department: 'Computer Science',
        year: 'Junior (3rd Yr)',
        isVerified: true,
        bio: `Student @ Apex Institute of Technology`,
        points: 100,
        achievements: ['Verified Student Member'],
      };

      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('cc_registered_users');
        const existing = stored ? JSON.parse(stored) : [];
        localStorage.setItem('cc_registered_users', JSON.stringify([...existing, { ...newUser, password }]));
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      }
      return { success: true, user: newUser };
    }

    return { success: false, error: 'Invalid university email or password. Password must be at least 6 characters.' };
  }

  public static register(data: {
    name: string;
    email: string;
    password: string;
    department: Department;
    year: StudentRole;
    college?: string;
  }): { success: boolean; user?: User; error?: string } {
    const trimmedEmail = data.email.toLowerCase().trim();
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return { success: false, error: 'Please provide a valid institutional email address.' };
    }

    if (data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const accounts = this.getAllAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === trimmedEmail)) {
      return { success: false, error: 'An account with this campus email already exists.' };
    }

    const handle = trimmedEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name.trim(),
      handle,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80`,
      email: trimmedEmail,
      college: data.college || 'Apex Institute of Technology',
      department: data.department,
      year: data.year,
      isVerified: true,
      bio: `${data.year} in ${data.department} @ ${data.college || 'Apex Institute of Technology'}`,
      points: 100,
      achievements: ['Verified Student Member'],
    };

    const newAccountWithPassword = { ...newUser, password: data.password };

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cc_registered_users');
      const existing = stored ? JSON.parse(stored) : [];
      localStorage.setItem('cc_registered_users', JSON.stringify([...existing, newAccountWithPassword]));
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    }

    return { success: true, user: newUser };
  }

  public static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  public static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}
