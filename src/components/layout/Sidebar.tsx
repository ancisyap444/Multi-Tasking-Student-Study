import React from 'react';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  CheckSquare,
  FolderKanban,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  BookOpen,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Subject, SubjectColor } from '@/types/database.types';
import { cn } from '@/lib/utils';

export type NavTab = 'dashboard' | 'calendar' | 'tasks' | 'projects' | 'documents';

export interface TaskUrgencyCounts {
  total: number;
  overdue: number;
  dueToday: number;
}

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  subjects: Subject[];
  selectedSubjectFilter: string | null;
  onSelectSubjectFilter: (subjectId: string | null) => void;
  onOpenAddSubject: () => void;
  onDeleteSubject?: (id: string) => void;
  onOpenSettings: (tab?: 'appearance' | 'account' | 'shortcuts') => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  activeTaskCount?: number;
  taskUrgency?: TaskUrgencyCounts;
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
  onDeleteSubject,
  onOpenSettings,
  collapsed,
  onToggleCollapsed,
  activeTaskCount = 0,
  taskUrgency,
}) => {
  const { profile } = useAuth();

  const effectiveTaskCount = taskUrgency?.total ?? activeTaskCount;

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar' as NavTab, label: 'Calendar', icon: CalendarIcon, badge: 'Active' },
    {
      id: 'tasks' as NavTab,
      label: 'My Tasks',
      icon: CheckSquare,
      count: effectiveTaskCount || undefined,
      urgency: taskUrgency,
    },
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
      <div className="flex flex-col border-b border-slate-100 p-3.5 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-2.5">
          {!collapsed ? (
            <button
              onClick={() => onSelectTab('dashboard')}
              title="Multi-Tasking — Go to Dashboard"
              className="group flex items-center gap-2 rounded-xl text-left transition hover:opacity-80 focus:outline-none"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/30 transition-transform group-hover:scale-105">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                Multi-Tasking
              </span>
            </button>
          ) : (
            <button
              onClick={() => onSelectTab('dashboard')}
              title="Multi-Tasking — Go to Dashboard"
              className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/30 transition-transform hover:scale-105 focus:outline-none"
            >
              <BookOpen className="h-4 w-4" />
            </button>
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

        {!collapsed && (
          <div
            onClick={() => onOpenSettings('account')}
            className="group flex cursor-pointer items-center gap-2.5 rounded-xl bg-slate-50/80 p-2 border border-slate-100 transition hover:bg-slate-100/80 dark:bg-slate-900/40 dark:border-slate-800 dark:hover:bg-slate-800/80"
            title="Customize student profile & photo"
          >
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
              <span className="truncate text-xs font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                {profile?.full_name || 'Alex River'}
              </span>
              <span className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                {profile?.program || 'BS Computer Science'}
              </span>
            </div>
          </div>
        )}
      </div>

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

                {collapsed && item.id === 'tasks' && item.urgency && (
                  item.urgency.overdue > 0 ? (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse ring-2 ring-white dark:ring-slate-900" title={`${item.urgency.overdue} overdue`} />
                  ) : item.urgency.dueToday > 0 ? (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" title={`${item.urgency.dueToday} due today`} />
                  ) : null
                )}

                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.count && (
                      item.id === 'tasks' && item.urgency?.overdue && item.urgency.overdue > 0 ? (
                        <span
                          title={`${item.urgency.overdue} overdue task${item.urgency.overdue > 1 ? 's' : ''}`}
                          className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white shadow-xs animate-pulse"
                        >
                          {item.count}
                        </span>
                      ) : item.id === 'tasks' && item.urgency?.dueToday && item.urgency.dueToday > 0 ? (
                        <span
                          title={`${item.urgency.dueToday} task${item.urgency.dueToday > 1 ? 's' : ''} due today`}
                          className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white shadow-xs"
                        >
                          {item.count}
                        </span>
                      ) : (
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
                      )
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

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
                  <div
                    key={sub.id}
                    className={cn(
                      'group flex w-full items-center rounded-lg text-xs font-medium transition',
                      isSelected
                        ? 'bg-slate-100 dark:bg-slate-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    )}
                  >
                    <button
                      onClick={() => onSelectSubjectFilter(sub.id)}
                      className="flex flex-1 items-center gap-2 truncate px-2.5 py-1.5"
                    >
                      <span className={cn('h-2 w-2 flex-shrink-0 rounded-full', colorTokens.dot)} />
                      <span className={cn('font-medium', isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300')}>
                        {sub.code}
                      </span>
                      <span className="truncate text-slate-400 text-[11px]">{sub.name}</span>
                    </button>
                    {onDeleteSubject && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSubject(sub.id);
                        }}
                        title={`Remove ${sub.code}`}
                        className="mr-1.5 flex-shrink-0 rounded p-0.5 opacity-0 transition hover:bg-rose-100 hover:text-rose-600 group-hover:opacity-100 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 p-3 dark:border-slate-800/80 space-y-2">
        <button
          onClick={() => onOpenSettings('appearance')}
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
            title="Expand sidebar"
            className="flex w-full items-center justify-center rounded-xl py-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </aside>
  );
};
