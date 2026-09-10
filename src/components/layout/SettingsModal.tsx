import React, { useState } from 'react';
import {
  X,
  Palette,
  User,
  Keyboard,
  Database,
  Trash2,
  Check,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { AcademicYear } from '@/types/database.types';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'appearance' | 'account' | 'shortcuts' | 'supabase';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, deleteAccount, isDemo, isConfigured, toggleDemoMode } = useAuth();
  const { mode, setMode, accent, setAccent } = useTheme();

  const [activeTab, setActiveTab] = useState<TabKey>('appearance');
  const [fullName, setFullName] = useState(profile?.full_name || 'Alex River');
  const [program, setProgram] = useState(profile?.program || 'BS Computer Science');
  const [year, setYear] = useState<AcademicYear>(profile?.year || 'Sophomore');
  const [targetHours, setTargetHours] = useState(profile?.target_study_hours_week || 25);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({
      full_name: fullName,
      program,
      year,
      target_study_hours_week: targetHours,
    });
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
    onClose();
  };

  const years: AcademicYear[] = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
  const accents: { id: 'blue' | 'indigo' | 'violet' | 'emerald' | 'rose'; name: string; bg: string }[] = [
    { id: 'blue', name: 'Multi-Tasking Blue', bg: 'bg-blue-600' },
    { id: 'indigo', name: 'Deep Indigo', bg: 'bg-indigo-600' },
    { id: 'violet', name: 'Royal Violet', bg: 'bg-purple-600' },
    { id: 'emerald', name: 'Focus Emerald', bg: 'bg-emerald-600' },
    { id: 'rose', name: 'Warm Rose', bg: 'bg-rose-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="relative flex h-[620px] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-[#0F172A]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Settings & Preferences</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure your study workspace and student profile</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body with Side Navigation Tabs */}
        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 border-r border-slate-100 p-3 space-y-1 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <button
              onClick={() => setActiveTab('appearance')}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition',
                activeTab === 'appearance'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
            >
              <Palette className="h-4 w-4" />
              <span>Appearance</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition',
                activeTab === 'account'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
            >
              <User className="h-4 w-4" />
              <span>Student Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('shortcuts')}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition',
                activeTab === 'shortcuts'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
            >
              <Keyboard className="h-4 w-4" />
              <span>Shortcuts</span>
            </button>

            <button
              onClick={() => setActiveTab('supabase')}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition',
                activeTab === 'supabase'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
            >
              <Database className="h-4 w-4" />
              <span>Cloud & Database</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* 1. Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Interface Theme</h3>
                  <p className="text-xs text-slate-500 mb-3">Choose the visual mode for the application</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setMode('light')}
                      className={cn(
                        'flex flex-col items-center justify-center rounded-xl border p-4 text-xs font-medium transition',
                        mode === 'light'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      )}
                    >
                      <div className="h-8 w-12 rounded border border-slate-300 bg-[#F8FAFC] shadow-sm mb-2" />
                      <span>Light (Multi-Tasking)</span>
                    </button>

                    <button
                      onClick={() => setMode('dark')}
                      className={cn(
                        'flex flex-col items-center justify-center rounded-xl border p-4 text-xs font-medium transition',
                        mode === 'dark'
                          ? 'border-blue-600 bg-blue-950/40 text-blue-400 ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      )}
                    >
                      <div className="h-8 w-12 rounded border border-slate-700 bg-[#0F172A] shadow-sm mb-2" />
                      <span>Deep Slate Dark</span>
                    </button>

                    <button
                      onClick={() => setMode('system')}
                      className={cn(
                        'flex flex-col items-center justify-center rounded-xl border p-4 text-xs font-medium transition',
                        mode === 'system'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      )}
                    >
                      <div className="h-8 w-12 rounded border border-slate-400 bg-gradient-to-r from-white to-slate-900 shadow-sm mb-2" />
                      <span>System Match</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Accent Palette</h3>
                  <p className="text-xs text-slate-500 mb-3">Primary brand highlight throughout the interface</p>
                  <div className="flex flex-wrap gap-2">
                    {accents.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => setAccent(acc.id)}
                        className={cn(
                          'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition',
                          accent === acc.id
                            ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                        )}
                      >
                        <span className={cn('h-3 w-3 rounded-full', acc.bg)} />
                        <span>{acc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Account / Profile Tab */}
            {activeTab === 'account' && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Degree Program / Major
                  </label>
                  <input
                    type="text"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    placeholder="e.g. BS Computer Science"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Academic Standing
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value as AcademicYear)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Target Study Hours / Wk
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={80}
                      value={targetHours}
                      onChange={(e) => setTargetHours(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Saved Successfully</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>

                {/* Danger Zone: Delete Account */}
                <div className="mt-8 rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
                  <h4 className="text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Danger Zone: Delete Account</span>
                  </h4>
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    Permanently delete your student profile, enrolled subjects, assignments, and calendar events. This action is irreversible.
                  </p>

                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="mt-3 flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 shadow-sm hover:bg-rose-50 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete my account & data</span>
                    </button>
                  ) : (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 shadow-sm"
                      >
                        Yes, permanently delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </form>
            )}

            {/* 3. Keyboard Shortcuts Guide */}
            {activeTab === 'shortcuts' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Keyboard Navigation</h3>
                  <p className="text-xs text-slate-500 mb-3">Power-user shortcuts for frictionless navigation</p>
                </div>

                <div className="space-y-2">
                  {[
                    { key: '⌘1 / Ctrl+K', desc: 'Open global quick-search palette' },
                    { key: 'C', desc: 'Quick-create new calendar event or study session' },
                    { key: 'T', desc: 'Add new assignment / task' },
                    { key: 'Esc', desc: 'Close any active modal or drawer' },
                    { key: 'W', desc: 'Jump to current week on calendar' },
                  ].map((sc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-850"
                    >
                      <span className="text-slate-700 dark:text-slate-300">{sc.desc}</span>
                      <kbd className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        {sc.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Supabase Cloud Connection Tab */}
            {activeTab === 'supabase' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Cloud Database & Auth</h3>
                    <p className="text-xs text-slate-500">Supabase Postgres, Storage, and Row Level Security</p>
                  </div>
                  <span
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                      isConfigured && !isDemo
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    )}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {isConfigured && !isDemo ? 'Live Supabase Cloud' : 'Demo Offline Mode'}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs dark:border-slate-800 dark:bg-slate-900">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    To connect to your own Supabase project:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
                    <li>Create project on Supabase.com</li>
                    <li>Run the SQL script from <code className="text-blue-600">supabase/schema.sql</code></li>
                    <li>Add your project URL & public anon key to <code className="text-blue-600">.env.local</code></li>
                    <li>Restart the Vite server (<code className="text-blue-600">npm run dev</code>)</li>
                  </ol>
                </div>

                {isConfigured && (
                  <div className="pt-2">
                    <button
                      onClick={() => toggleDemoMode(!isDemo)}
                      className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                      <span>{isDemo ? 'Switch to Live Cloud Data' : 'Switch to Demo Mock Data'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
