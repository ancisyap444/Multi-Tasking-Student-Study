import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Calendar as CalendarIcon,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { EventType } from '@/types/database.types';
import { cn } from '@/lib/utils';

export type CalendarViewMode = 'week' | 'day' | 'month';

interface CalendarToolbarProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrevDate: () => void;
  onNextDate: () => void;
  onToday: () => void;
  selectedCategory: EventType | 'all';
  onSelectCategory: (cat: EventType | 'all') => void;
  onOpenAddEvent: () => void;
  onOpenAutoSchedule: () => void;
}

export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  currentDate,
  viewMode,
  onViewModeChange,
  onPrevDate,
  onNextDate,
  onToday,
  selectedCategory,
  onSelectCategory,
  onOpenAddEvent,
  onOpenAutoSchedule,
}) => {
  const categoryTabs: { id: EventType | 'all'; label: string }[] = [
    { id: 'all', label: 'All Events' },
    { id: 'class', label: 'Classes' },
    { id: 'study', label: 'Study Blocks' },
    { id: 'exam', label: 'Exams' },
    { id: 'project', label: 'Group Projects' },
  ];

  return (
    <div className="flex flex-col gap-4 border-b border-slate-200/80 bg-white/50 p-4 backdrop-blur-xs lg:flex-row lg:items-center lg:justify-between dark:border-slate-800 dark:bg-[#0F172A]/50">
      {/* Date Navigation & Month Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs dark:border-slate-700 dark:bg-slate-800">
          <button
            onClick={onPrevDate}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
            title="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onToday}
            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Today
          </button>
          <button
            onClick={onNextDate}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
            title="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
      </div>

      {/* Center: Category Filter Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
        {categoryTabs.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              'whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-medium transition',
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white shadow-2xs dark:bg-white dark:text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Right: View Mode Toggle & CTAs */}
      <div className="flex items-center gap-2">
        {/* View switcher: Week / Day / Month */}
        <div className="flex rounded-xl border border-slate-200 bg-slate-100/70 p-1 dark:border-slate-800 dark:bg-slate-900">
          {(['week', 'day', 'month'] as CalendarViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={cn(
                'capitalize rounded-lg px-2.5 py-1 text-xs font-medium transition',
                viewMode === mode
                  ? 'bg-white font-semibold text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Smart Auto-Schedule Button */}
        <button
          onClick={onOpenAutoSchedule}
          className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 shadow-2xs transition hover:bg-purple-100 dark:border-purple-800/60 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60"
          title="Auto-place study sessions into free gaps"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          <span className="hidden sm:inline">Auto-Schedule</span>
        </button>

        {/* + Create Event Button */}
        <button
          onClick={onOpenAddEvent}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add Event</span>
        </button>
      </div>
    </div>
  );
};
