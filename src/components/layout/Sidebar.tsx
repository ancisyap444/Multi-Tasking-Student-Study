import React from 'react';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  CheckSquare,
  FolderKanban,
  FileText,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Subject, SubjectColor } from '@/types/database.types';
import { cn } from '@/lib/utils';

export type NavTab = 'dashboard' | 'calendar' | 'tasks' | 'projects' | 'documents';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  subjects: Subject[];
  selectedSubjectFilter: string | null;
  onSelectSubjectFilter: (subjectId: string | null) => void;
  onOpenAddSubject: () => void;
  onOpenSettings: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

const colorBadgeStyles: Record<SubjectColor, { dot: string; bg: string; text: string }> = {
  mint: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', text: 'text-emerald-600' },
  lavender: { dot: 'bg-purple-500', bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300', text: 'text-purple-600' },
  amber: { dot: 'bg-amber-500', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', text: 'text-amber-600' },
  sky: { dot: 'bg-sky-500', bg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300', text: 'text-sky-600' },
  rose: { dot: 'bg-rose-500', bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300', text: 'text-rose-600' },
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  subjects,
  selectedSubjectFilter,
  onSelectSubjectFilter,
  onOpenAddSubject,
  onOpenSettings,
  collapsed,
  onToggleCollapsed,
}) => {
  const { profile, isDemo, isConfigured } = useAuth();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar' as NavTab, label: 'Calendar', icon: CalendarIcon, badge: 'Active' },
    { id: 'tasks' as NavTab, label: 'My Tasks', icon: CheckSquare, count: 4 },
    { id: 'projects' as NavTab, label: 'Projects', icon: FolderKanban },
    { id: 'documents' as NavTab, label: 'Documents', icon: FileText },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-slate-200/80 bg-white transition-all duration-300 select-none dark:border-slate-800 dark:bg-[#0F172A]',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand & Student Workspace Header */}
      <div className="flex flex-col border-b border-slate-100 p-3.5 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-2.5">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/30">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                Multi-Tasking
              </span>
            </div>
          ) : (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/30">
              <BookOpen className="h-4 w-4" />
            </div>
          )}

          <button
            onClick={onToggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-xs transition hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700',
              collapsed && 'hidden'
            )}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Student Workspace Pill */}
        {!collapsed && (
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-50/80 p-2 border border-slate-100 dark:bg-slate-900/40 dark:border-slate-800">
            <div className="relative flex-shrink-0">
              <img
                src={
                  profile?.avatar_url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt="Avatar"
                className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500/20"
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
            </div>
            <div className="flex flex-col truncate">
              <span className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                {profile?.full_name || 'Alex River'}
              </span>
              <span className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                {profile?.program || 'BS Computer Science'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 dark:bg-blue-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200',
                  collapsed && 'justify-center px-0'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105',
                    isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                  )}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.count && (
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-semibold',
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        )}
                      >
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Enrolled Subjects / Favorites Filter */}
        {!collapsed && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Enrolled Subjects
              </span>
              <button
                onClick={onOpenAddSubject}
                className="flex items-center gap-1 rounded-md p-1 text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                title="Add new subject"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => onSelectSubjectFilter(null)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition',
                  selectedSubjectFilter === null
                    ? 'bg-slate-100 font-semibold text-slate-900 dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-slate-400" />
                  <span>All Courses</span>
                </div>
                <span className="text-[11px] text-slate-400">{subjects.length}</span>
              </button>

              {subjects.map((sub) => {
                const colorTokens = colorBadgeStyles[sub.color] || colorBadgeStyles.mint;
                const isSelected = selectedSubjectFilter === sub.id;

                return (
                  <button
                    key={sub.id}
                    onClick={() => onSelectSubjectFilter(sub.id)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition group',
                      isSelected
                        ? 'bg-slate-100 font-semibold text-slate-900 dark:bg-slate-800 dark:text-white'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={cn('h-2 w-2 flex-shrink-0 rounded-full', colorTokens.dot)} />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {sub.code}
                      </span>
                      <span className="truncate text-slate-400 text-[11px]">{sub.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Settings & Mode Indicator */}
      <div className="border-t border-slate-100 p-3 dark:border-slate-800/80 space-y-2">
        {/* Supabase status badge */}
        {!collapsed && (
          <div
            className={cn(
              'flex items-center justify-between rounded-xl px-3 py-2 text-xs border',
              isConfigured && !isDemo
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800/50 dark:text-emerald-300'
                : 'bg-blue-50/70 border-blue-200/60 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800/50 dark:text-blue-300'
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'h-2 w-2 rounded-full animate-pulse',
                  isConfigured && !isDemo ? 'bg-emerald-500' : 'bg-blue-500'
                )}
              />
              <span className="font-medium">
                {isConfigured && !isDemo ? 'Cloud RLS Connected' : 'Multi-Tasking Demo'}
              </span>
            </div>
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          </div>
        )}

        <button
          onClick={onOpenSettings}
          title={collapsed ? 'Settings' : undefined}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
            collapsed && 'justify-center px-0'
          )}
        >
          <Settings className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          {!collapsed && <span>Settings & Shortcuts</span>}
        </button>

        {collapsed && (
          <button
            onClick={onToggleCollapsed}
            className="flex w-full items-center justify-center rounded-xl py-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </aside>
  );
};
