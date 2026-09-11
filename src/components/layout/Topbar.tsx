import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Menu,
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  LogOut,
  Settings,
  BookOpen,
  LayoutDashboard,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { getCurrentSemester, getDeadlineCountdown, parseISO, isPast, isToday, differenceInHours, differenceInMinutes, formatEventTimeRange } from '@/utils/dateUtils';
import { TaskItem, CalendarEvent } from '@/types/database.types';
import { NavTab } from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';

export interface TopbarProps {
  onOpenSearch: () => void;
  onOpenCreateEvent: () => void;
  onOpenSettings: (tab?: 'appearance' | 'account' | 'shortcuts') => void;
  onGoToDashboard?: () => void;
  tasks?: TaskItem[];
  events?: CalendarEvent[];
  onNavigate?: (tab: NavTab) => void;
  onToggleMobileMenu?: () => void;
}

interface AlertItem {
  id: string;
  type: 'overdue' | 'due_today' | 'due_soon' | 'exam' | 'class';
  title: string;
  subtitle: string;
  badge: string;
  timeLabel: string;
  targetTab: NavTab;
  urgency: 'high' | 'medium' | 'info';
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenSearch,
  onOpenCreateEvent,
  onOpenSettings,
  onGoToDashboard,
  tasks = [],
  events = [],
  onNavigate,
  onToggleMobileMenu,
}) => {
  const { profile, signOut } = useAuth();
  const { isDark, setMode } = useTheme();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('quicksuite_dismissed_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Compute live real alerts
  const alerts = useMemo<AlertItem[]>(() => {
    const list: AlertItem[] = [];
    const now = new Date();

    // 1. Process Tasks
    for (const t of tasks) {
      if (t.status === 'done' || !t.due_at) continue;
      const countdown = getDeadlineCountdown(t.due_at);

      if (countdown.urgency === 'overdue') {
        list.push({
          id: `task-overdue-${t.id}`,
          type: 'overdue',
          title: t.title,
          subtitle: t.subject?.code ? `${t.subject.code} · ${t.priority.toUpperCase()} priority` : `${t.priority.toUpperCase()} priority`,
          badge: countdown.label,
          timeLabel: 'Needs immediate action',
          targetTab: 'tasks',
          urgency: 'high',
        });
      } else if (countdown.urgency === 'today') {
        list.push({
          id: `task-today-${t.id}`,
          type: 'due_today',
          title: t.title,
          subtitle: t.subject?.code ? `${t.subject.code} assignment` : 'Task deadline',
          badge: countdown.label,
          timeLabel: 'Due before midnight',
          targetTab: 'tasks',
          urgency: 'medium',
        });
      } else if (countdown.urgency === 'tomorrow') {
        list.push({
          id: `task-soon-${t.id}`,
          type: 'due_soon',
          title: t.title,
          subtitle: t.subject?.code ? `${t.subject.code} assignment` : 'Task deadline',
          badge: 'Due tomorrow',
          timeLabel: 'Prepare today',
          targetTab: 'tasks',
          urgency: 'medium',
        });
      }
    }

    // 2. Process Events (Exams & Classes today or starting in next 2 hours)
    for (const e of events) {
      try {
        const start = parseISO(e.start_time);
        const end = parseISO(e.end_time);

        if (e.type === 'exam' && isToday(start)) {
          list.push({
            id: `event-exam-${e.id}`,
            type: 'exam',
            title: e.title,
            subtitle: e.subject?.code ? `${e.subject.code} · ${e.location || 'Campus'}` : e.location || 'Campus',
            badge: 'Exam Today',
            timeLabel: formatEventTimeRange(e.start_time, e.end_time),
            targetTab: 'calendar',
            urgency: 'high',
          });
        } else if (e.type === 'class') {
          const minsToStart = differenceInMinutes(start, now);
          const isOngoing = now >= start && now <= end;

          if (isOngoing || (minsToStart > 0 && minsToStart <= 120)) {
            list.push({
              id: `event-class-${e.id}`,
              type: 'class',
              title: e.title,
              subtitle: e.location || 'Lecture Hall',
              badge: isOngoing ? 'In Progress' : `In ${minsToStart} mins`,
              timeLabel: formatEventTimeRange(e.start_time, e.end_time),
              targetTab: 'calendar',
              urgency: 'info',
            });
          }
        }
      } catch {
        // Ignore date parse issues
      }
    }

    return list.filter((a) => !dismissedIds.includes(a.id));
  }, [tasks, events, dismissedIds]);

  const handleDismissAll = () => {
    const allIds = alerts.map((a) => a.id);
    const updated = [...dismissedIds, ...allIds];
    setDismissedIds(updated);
    try {
      localStorage.setItem('quicksuite_dismissed_alerts', JSON.stringify(updated));
    } catch {}
  };

  const handleAlertClick = (alert: AlertItem) => {
    if (onNavigate) {
      onNavigate(alert.targetTab);
    }
    setNotificationsOpen(false);
  };

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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-3.5 sm:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-[#0F172A]/80">
      <div className="flex items-center gap-2 sm:gap-4">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 md:hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            title="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Desktop / tablet search button */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex h-10 w-44 md:w-64 items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs text-slate-500 shadow-2xs transition hover:border-slate-300 hover:bg-slate-100/70 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-400 dark:hover:border-slate-600"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Search subjects, tasks...</span>
          </div>
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 shadow-2xs dark:border-slate-700 dark:bg-slate-800">
              ctrl+k
            </kbd>
          </div>
        </button>

        {/* Mobile search icon button */}
        <button
          onClick={onOpenSearch}
          className="flex sm:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          title="Search subjects, tasks, or notes"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onGoToDashboard}
          className="hidden md:flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/60 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100/60 transition dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300"
          title="Return to Dashboard"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>{getCurrentSemester()}</span>
        </button>

        <button
          onClick={onOpenCreateEvent}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 sm:px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create</span>
        </button>

        <button
          onClick={() => setMode(isDark ? 'light' : 'dark')}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        {/* Real Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen((prev) => !prev)}
            title="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Bell className="h-4 w-4" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {alerts.length}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] max-w-sm sm:w-96 origin-top-right rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-50 dark:border-slate-800 dark:bg-[#0F172A] animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-1 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Upcoming Alerts
                  </span>
                  {alerts.length > 0 && (
                    <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                      {alerts.length} new
                    </span>
                  )}
                </div>
                {alerts.length > 0 && (
                  <button
                    onClick={handleDismissAll}
                    className="text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear all
                  </button>
                )}
              </div>

              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    No urgent deadlines or events scheduled in the next 24 hours.
                  </p>
                </div>
              ) : (
                <div className="mt-2.5 max-h-80 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100/60 dark:divide-slate-800/60">
                  {alerts.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleAlertClick(item)}
                      className="group flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <div className={cn(
                        'mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg',
                        item.type === 'overdue' && 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
                        item.type === 'due_today' && 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
                        item.type === 'due_soon' && 'bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400',
                        item.type === 'exam' && 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
                        item.type === 'class' && 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                      )}>
                        {item.type === 'overdue' ? <AlertTriangle className="h-3.5 w-3.5" /> :
                         item.type === 'exam' ? <Calendar className="h-3.5 w-3.5" /> :
                         item.type === 'class' ? <BookOpen className="h-3.5 w-3.5" /> :
                         <Clock className="h-3.5 w-3.5" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {item.title}
                          </h4>
                          <span className={cn(
                            'rounded-md px-1.5 py-0.5 text-[10px] font-bold flex-shrink-0',
                            item.urgency === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                            item.urgency === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          )}>
                            {item.badge}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {item.subtitle}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                          {item.timeLabel}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
            <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl transition-all z-50 dark:border-slate-800 dark:bg-[#0F172A]">
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
