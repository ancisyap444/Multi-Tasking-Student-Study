import React, { useState } from 'react';
import { BookOpen, Award, UserCheck, CheckCircle2, Sliders } from 'lucide-react';
import { NextClassBanner } from '@/components/dashboard/NextClassBanner';
import { TodayTasksList } from '@/components/dashboard/TodayTasksList';
import { StudyLoadProgressBar } from '@/components/dashboard/StudyLoadProgressBar';
import { QuickActionButtons } from '@/components/dashboard/QuickActionButtons';
import { CourseProgressModal } from '@/components/subjects/CourseProgressModal';
import { CalendarEvent, TaskItem, Subject, SubjectColor } from '@/types/database.types';
import { NavTab } from '@/components/layout/Sidebar';
import { getSubjectMetric, computeSubjectTaskProgress } from '@/utils/subjectProgress';
import { cn } from '@/lib/utils';

interface DashboardProps {
  events: CalendarEvent[];
  tasks: TaskItem[];
  subjects: Subject[];
  completedStudyHours?: number;
  onToggleTask: (task: TaskItem) => void;
  onNavigate: (tab: NavTab) => void;
  onOpenAddSubject: () => void;
  onOpenAddTask: () => void;
  onOpenAutoSchedule: () => void;
}

const colorBadgeStyles: Record<SubjectColor, { bg: string; bar: string }> = {
  mint: { bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300', bar: 'bg-emerald-500' },
  lavender: { bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300', bar: 'bg-purple-500' },
  amber: { bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300', bar: 'bg-amber-500' },
  sky: { bg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300', bar: 'bg-blue-500' },
  rose: { bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300', bar: 'bg-rose-500' },
};

export const Dashboard: React.FC<DashboardProps> = ({
  events,
  tasks,
  subjects,
  completedStudyHours = 0,
  onToggleTask,
  onNavigate,
  onOpenAddSubject,
  onOpenAddTask,
  onOpenAutoSchedule,
}) => {
  const [selectedSubjectForProgress, setSelectedSubjectForProgress] = useState<Subject | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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

        <StudyLoadProgressBar completedHours={completedStudyHours} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Enrolled Course Roster & Progress ({subjects.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active lecture schedules, task completion, and academic performance
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
            <p className="text-xs text-slate-400 dark:text-slate-500">Add your first subject to track attendance and task completion.</p>
            <button
              onClick={onOpenAddSubject}
              className="mt-2 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              Enroll a Course
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {subjects.map((sub) => {
              const taskProgress = computeSubjectTaskProgress(sub.id, tasks);
              const metric = getSubjectMetric(sub.id);
              const style = colorBadgeStyles[sub.color] || colorBadgeStyles.sky;

              return (
                <div
                  key={sub.id}
                  onClick={() => onNavigate('calendar')}
                  className="group cursor-pointer rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <span className={cn('rounded-lg px-2 py-0.5 text-xs font-bold shadow-2xs', style.bg)}>
                      {sub.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSubjectForProgress(sub);
                        }}
                        title="Adjust Grade & Attendance"
                        className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
                      >
                        <Sliders className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-[11px] text-slate-400 truncate max-w-[100px]">{sub.location || 'Lecture'}</span>
                    </div>
                  </div>

                  <h4 className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {sub.name}
                  </h4>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {sub.instructor || 'Faculty Staff'}
                  </p>

                  {/* Task Completion Mini Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                      <span>Tasks Done</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {taskProgress.completed}/{taskProgress.total} ({taskProgress.percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className={cn('h-full rounded-full transition-all duration-300', style.bar)}
                        style={{ width: `${taskProgress.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Mini Grade & Attendance Chips */}
                  <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                      <Award className="h-3 w-3 text-amber-500" />
                      Grade: <span className="font-bold text-slate-800 dark:text-slate-200">{metric.grade || metric.targetGrade || 'A'}</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                      <UserCheck className="h-3 w-3 text-emerald-500" />
                      Att: <span className="font-bold text-slate-800 dark:text-slate-200">{metric.attendancePct ?? 100}%</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CourseProgressModal
        isOpen={Boolean(selectedSubjectForProgress)}
        subject={selectedSubjectForProgress}
        tasks={tasks}
        onClose={() => setSelectedSubjectForProgress(null)}
        onProgressUpdated={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
};
