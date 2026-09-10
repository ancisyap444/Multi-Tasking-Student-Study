import React, { useState } from 'react';
import { BookOpen, Sparkles, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface LoginProps {
  onGoToSignup: () => void;
  onGoToForgotPassword: () => void;
}

export const Login: React.FC<LoginProps> = ({ onGoToSignup, onGoToForgotPassword }) => {
  const { signIn, toggleDemoMode, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setErrorMsg(error.message || 'Invalid email or password');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    toggleDemoMode(true);
    signIn('alex.river@university.edu', 'demo123456');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFC] p-4 dark:bg-[#0B0F19]">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Multi-Tasking
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Student academic operating system & intelligent calendar
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-purple-200/80 bg-purple-50/70 p-3.5 text-center dark:border-purple-900/50 dark:bg-purple-950/30">
          <p className="text-xs font-semibold text-purple-900 dark:text-purple-200 flex items-center justify-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            Instant Preview Access
          </p>
          <p className="text-[11px] text-purple-700/80 dark:text-purple-300 mt-0.5 mb-2.5">
            Explore with pre-loaded courses, weekly timetable, and task board.
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full rounded-xl bg-purple-600 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-purple-700 active:scale-95"
          >
            Launch Guest Demo Workspace
          </button>
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            or sign in with credentials
          </span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              University Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={onGoToForgotPassword}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-50 active:scale-95"
          >
            {isLoading ? 'Signing in...' : 'Sign In to Multi-Tasking'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          <span>Don't have an account? </span>
          <button
            type="button"
            onClick={onGoToSignup}
            className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Create student profile
          </button>
        </div>
      </div>
    </div>
  );
};
