'use client';

import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  Terminal, 
  Bot, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Building, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { User, Department, StudentRole } from '@/types';
import { AuthService, DEMO_STUDENT_ACCOUNT } from '@/services/authService';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration fields
  const [name, setName] = useState('');
  const [department, setDepartment] = useState<Department>('Computer Science');
  const [year, setYear] = useState<StudentRole>('Junior (3rd Yr)');
  const [college, setCollege] = useState('Apex Institute of Technology');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please provide your university email and password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = AuthService.login(email, password);
      setIsLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Login failed. Please verify credentials.');
      }
    }, 300);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your university email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = AuthService.register({
        name,
        email,
        password,
        department,
        year,
        college,
      });
      setIsLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Registration failed.');
      }
    }, 300);
  };

  const handleFillDemoStudent = () => {
    setEmail(DEMO_STUDENT_ACCOUNT.email);
    setPassword(DEMO_STUDENT_ACCOUNT.password);
    setError(null);
  };

  return (
    <div className="min-h-screen w-screen bg-[#07090e] text-[#f1f5f9] flex flex-col justify-between relative overflow-x-hidden font-sans select-none">
      {/* Background ambient decorative glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="h-16 border-b border-[#161c2b] px-6 flex items-center justify-between bg-[#080b12]/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              CampusConnect
            </span>
            <span className="text-[10px] text-slate-400 font-medium ml-2 px-2 py-0.5 rounded-full bg-[#151a28] border border-[#232c44]">
              Open-Source &amp; AI-Powered Campus Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4" />
          <span>Institutional Domain Gated</span>
        </div>
      </header>

      {/* Main Login / Register Area */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md bg-[#0f131e] border border-[#20283d] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
          {/* Form Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#171d2c] border border-[#28334e] flex items-center justify-center mx-auto mb-3 text-indigo-400 shadow-inner">
              <Bot className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {isRegistering ? 'Create Student Account' : 'Sign in to CampusConnect'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isRegistering
                ? 'Join your college exclusive network with your institutional email'
                : 'Access community channels, open-source repositories & CampusAI Copilot'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-rose-950/70 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={isRegistering ? handleRegister : handleSignIn} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full bg-[#161c2b] border border-[#252f47] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                University Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu or student@ait.edu"
                  className="w-full bg-[#161c2b] border border-[#252f47] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (min 6 characters)"
                  className="w-full bg-[#161c2b] border border-[#252f47] rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegistering && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value as Department)}
                      className="w-full bg-[#161c2b] border border-[#252f47] rounded-xl px-2.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Electronics & Comm.">Electronics &amp; Comm.</option>
                      <option value="Information Tech">Information Tech</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Civil">Civil</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Year / Level
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value as StudentRole)}
                      className="w-full bg-[#161c2b] border border-[#252f47] rounded-xl px-2.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Fresher (1st Yr)">Fresher (1st Yr)</option>
                      <option value="Sophomore (2nd Yr)">Sophomore (2nd Yr)</option>
                      <option value="Junior (3rd Yr)">Junior (3rd Yr)</option>
                      <option value="Senior (4th Yr)">Senior (4th Yr)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    College / University Name
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="Apex Institute of Technology"
                    className="w-full bg-[#161c2b] border border-[#252f47] rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{isLoading ? 'Authenticating...' : isRegistering ? 'Register Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Helper */}
          {!isRegistering && (
            <div className="mt-4 pt-3 border-t border-[#1d2538] flex items-center justify-between text-[11px] text-slate-400">
              <span>Quick evaluation?</span>
              <button
                type="button"
                onClick={handleFillDemoStudent}
                className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline flex items-center gap-1"
              >
                <span>Fill Demo Credentials</span>
              </button>
            </div>
          )}

          {/* Toggle Login / Register */}
          <div className="mt-4 text-center text-xs text-slate-400">
            {isRegistering ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setError(null);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                New to CampusConnect?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    setError(null);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline"
                >
                  Create Student Account
                </button>
              </span>
            )}
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="py-4 border-t border-[#161c2b] bg-[#080b12] text-center text-[11px] text-slate-500 z-10">
        CampusConnect — Open-Source College Platform powered by CampusAI
      </footer>
    </div>
  );
};
