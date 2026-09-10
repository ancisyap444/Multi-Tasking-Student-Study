import React, { useState } from 'react';
import { Mail, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ForgotPasswordProps {
  onGoToLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onGoToLogin }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setErrorMessage(error.message);
        setStatus('error');
      } else {
        setStatus('success');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send reset email');
      setStatus('error');
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFC] p-4 dark:bg-[#0B0F19]">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-[#0F172A]">
        <button
          onClick={onGoToLogin}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-4 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sign In</span>
        </button>

        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Reset Student Password
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          We will send a password reset link to your university email address.
        </p>

        {status === 'success' ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
            <Check className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
            <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              Reset link sent!
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1">
              Check your inbox at <strong>{email}</strong> for instructions.
            </p>
            <button
              type="button"
              onClick={onGoToLogin}
              className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {status === 'error' && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                University Email Address
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

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-50 active:scale-95"
            >
              {status === 'loading' ? 'Sending Link...' : 'Send Password Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
