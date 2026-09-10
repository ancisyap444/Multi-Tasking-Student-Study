import React from 'react';
import { BookOpen } from 'lucide-react';
import { NextClassBanner } from '@/components/dashboard/NextClassBanner';
import { TodayTasksList } from '@/components/dashboard/TodayTasksList';
import { StudyLoadProgressBar } from '@/components/dashboard/StudyLoadProgressBar';
import { QuickActionButtons } from '@/components/dashboard/QuickActionButtons';
import { CalendarEvent, TaskItem, Subject } from '@/types/database.types';
import { NavTab } from '@/components/layout/Sidebar';

interface DashboardProps {
  events: CalendarEvent[];
  tasks: TaskItem[];
  subjects: Subject[];
  onToggleTask: (task: TaskItem) => void;
  onNavigate: (tab: NavTab) => void;
  onOpenAddSubject: () => void;
  onOpenAddTask: () => void;
  onOpenAutoSchedule: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  events,
  tasks,
  subjects,
  onToggleTask,
  onNavigate,
  onOpenAddSubject,
  onOpenAddTask,
  onOpenAutoSchedule,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <NextClassBanner
        events={events}
        onOpenCalendar={() => onNavigate('calendar')}
      />

      <QuickActionButtons
        onAddSubject={onOpenAddSubject}
        onAddTask={onOpenAddTask}
        onAutoSchedule={onOpenAutoSchedule}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayTasksList
          tasks={tasks}
          onToggleTask={onToggleTask}
          onOpenTasks={() => onNavigate('tasks')}
        />

        <StudyLoadProgressBar completedHours={0} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Enrolled Course Roster ({subjects.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active lecture schedules and faculty contacts
            </p>
          </div>
          <button
            onClick={onOpenAddSubject}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            + Enroll Course
          </button>
        </div>

        {subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <BookOpen className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No courses enrolled yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Add your first subject to get started.</p>
            <button
              onClick={onOpenAddSubject}
              className="mt-2 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              Enroll a Course
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                onClick={() => onNavigate('calendar')}
                className="group cursor-pointer rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-blue-200 hover:bg-blue-50/30 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white">
                    {sub.code}
                  </span>
                  <span className="text-[11px] text-slate-400">{sub.location}</span>
                </div>
                <h4 className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {sub.name}
                </h4>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {sub.instructor || 'Faculty Staff'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
