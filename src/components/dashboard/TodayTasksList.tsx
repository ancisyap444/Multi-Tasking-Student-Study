import React, { useMemo } from 'react';
import { Clock, AlertCircle, CheckCircle2, ArrowRight, Check } from 'lucide-react';
import { differenceInHours, parseISO, isPast } from 'date-fns';
import { TaskItem } from '@/types/database.types';
import { cn } from '@/lib/utils';

interface TodayTasksListProps {
  tasks: TaskItem[];
  onToggleTask: (task: TaskItem) => void;
  onOpenTasks: () => void;
}

export const TodayTasksList: React.FC<TodayTasksListProps> = ({
  tasks,
  onToggleTask,
  onOpenTasks,
}) => {
  const now = new Date();

  // Tasks due within next 48 hours or overdue
  const urgentTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (t.status === 'done' || !t.due_at) return false;
        try {
          const due = parseISO(t.due_at);
          const hours = differenceInHours(due, now);
          return hours <= 48;
        } catch {
          return false;
        }
      })
      .sort((a, b) => {
        // Urgent priority first, then earliest due
        const pOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
        const diff = pOrder[a.priority] - pOrder[b.priority];
        if (diff !== 0) return diff;
        return (
          parseISO(a.due_at!).getTime() - parseISO(b.due_at!).getTime()
        );
      });
  }, [tasks, now]);

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Today's Tasks & Urgent Deadlines
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Due within the next 48 hours
          </p>
        </div>
        <button
          onClick={onOpenTasks}
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 flex-1 space-y-2.5 overflow-y-auto max-h-[300px]">
        {urgentTasks.length > 0 ? (
          urgentTasks.map((task) => {
            const isOverdue = isPast(parseISO(task.due_at!));

            return (
              <div
                key={task.id}
                className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition hover:border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleTask(task)}
                    className="flex h-4 w-4 items-center justify-center rounded border border-slate-300 bg-white hover:border-emerald-500 dark:border-slate-600 dark:bg-slate-800"
                  >
                    {task.status === 'done' && <Check className="h-3 w-3 text-emerald-600" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      {task.subject && (
                        <span className="rounded bg-blue-100/70 px-1.5 py-0.2 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          {task.subject.code}
                        </span>
                      )}
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {task.title}
                      </h4>
                    </div>

                    <div className="mt-0.5 flex items-center gap-3 text-[11px] text-slate-500">
                      <span
                        className={cn(
                          'flex items-center gap-1 font-medium',
                          isOverdue ? 'text-rose-600 font-semibold' : ''
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        {isOverdue ? 'Overdue' : 'Due soon'}
                      </span>
                      {task.estimated_hours && (
                        <span>~{task.estimated_hours}h required</span>
                      )}
                    </div>
                  </div>
                </div>

                <span
                  className={cn(
                    'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                    task.priority === 'urgent'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  )}
                >
                  {task.priority}
                </span>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No urgent deadlines today!
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              You're in great shape for the next 48 hours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
