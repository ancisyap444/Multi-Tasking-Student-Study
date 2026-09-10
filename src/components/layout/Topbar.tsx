import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  LogOut,
  Settings,
  BookOpen,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { getCurrentSemester } from '@/utils/dateUtils';

interface TopbarProps {
  onOpenSearch: () => void;
  onOpenCreateEvent: () => void;
  onOpenSettings: (tab?: 'appearance' | 'account' | 'shortcuts') => void;
  onGoToDashboard?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenSearch,
  onOpenCreateEvent,
  onOpenSettings,
  onGoToDashboard,
}) => {
  const { profile, signOut } = useAuth();
  const { isDark, setMode } = useTheme();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="relative z-40 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 sm:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-[#0F172A]/80">
      <div className="flex flex-1 items-center max-w-md">
        <button
          onClick={onOpenSearch}
          className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-sm text-slate-500 transition hover:border-slate-300 hover:bg-slate-100/80 focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-slate-600"
        >
          <div className="flex items-center gap-2.5">
            <Search className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            <span className="text-slate-400 dark:text-slate-400">Search subjects, tasks, or notes...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 shadow-sm sm:inline-block dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              Ctrl+K
            </kbd>
            <kbd className="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 shadow-sm sm:inline-block dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              ⌘1
            </kbd>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onGoToDashboard}
          title="Multi-Tasking — Go to Dashboard"
          className="hidden items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100 hover:border-blue-300 active:scale-95 sm:flex dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
        >
          <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>{getCurrentSemester()}</span>
        </button>

        <button
          onClick={onOpenCreateEvent}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create</span>
        </button>

        <button
          onClick={() => setMode(isDark ? 'light' : 'dark')}
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen((prev) => !prev)}
            title="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Bell className="h-4 w-4" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-50 dark:border-slate-800 dark:bg-[#0F172A]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Upcoming Alerts</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                <Bell className="h-7 w-7 text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No alerts yet</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Upcoming deadlines and events will appear here.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full ring-2 ring-transparent transition hover:ring-blue-500/30"
          >
            <img
              src={
                profile?.avatar_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt="Avatar"
              className="h-9 w-9 rounded-full object-cover shadow-sm"
            />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl transition-all z-50 dark:border-slate-800 dark:bg-[#0F172A]">
              <div className="border-b border-slate-100 p-2 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {profile?.full_name || 'Alex River'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {profile?.year || 'Sophomore'} · {profile?.program || 'BS Computer Science'}
                </p>
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onGoToDashboard?.();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <LayoutDashboard className="h-4 w-4 text-slate-500" />
                  <span>Dashboard Home</span>
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onOpenSettings('account');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Settings className="h-4 w-4 text-slate-500" />
                  <span>Customize Profile & Settings</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    signOut();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
