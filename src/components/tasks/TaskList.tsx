import React from 'react';
import { Check, Clock, Trash2, Edit2, Sparkles } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { TaskItem, TaskPriority } from '@/types/database.types';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: TaskItem[];
  onToggleComplete: (task: TaskItem) => void;
  onSelectTask: (task: TaskItem) => void;
  onDeleteTask: (id: string) => void;
  onAutoScheduleTask: (task: TaskItem) => void;
}

const priorityBadges: Record<TaskPriority, string> = {
  urgent: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
  high: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
  medium: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
  low: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onSelectTask,
  onDeleteTask,
  onAutoScheduleTask,
}) => {
  return (
    <div className="overflow-x-auto p-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
            <tr>
              <th className="w-10 px-4 py-3 text-center">Done</th>
              <th className="px-4 py-3">Task Title & Course</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Est. Hours</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.map((task) => {
              const isDone = task.status === 'done';
              const isOverdue = task.due_at && isPast(parseISO(task.due_at)) && !isDone;

              return (
                <tr
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="group cursor-pointer transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                >
                  <td
                    className="px-4 py-3 text-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleComplete(task);
                    }}
                  >
                    <div
                      className={cn(
                        'mx-auto flex h-4 w-4 items-center justify-center rounded border transition',
                        isDone
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 hover:border-blue-500 dark:border-slate-600'
                      )}
                    >
                      {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {task.subject && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {task.subject.code}
                        </span>
                      )}
                      <span
                        className={cn(
                          'font-semibold text-slate-900 dark:text-white',
                          isDone && 'line-through text-slate-400 dark:text-slate-500'
                        )}
                      >
                        {task.title}
                      </span>
                    </div>
                    {task.notes && (
                      <p className="mt-0.5 max-w-md truncate text-[11px] text-slate-400">
                        {task.notes}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase',
                        priorityBadges[task.priority]
                      )}
                    >
                      {task.priority}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {task.due_at ? (
                      <div
                        className={cn(
                          'flex items-center gap-1.5',
                          isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600 dark:text-slate-400'
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        <span>{format(parseISO(task.due_at), 'MMM d, h:mm a')}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    {task.estimated_hours ? `${task.estimated_hours} hrs` : '—'}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!isDone && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAutoScheduleTask(task);
                          }}
                          className="rounded-lg p-1 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                          title="Auto-schedule study block"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTask(task);
                        }}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                        title="Edit details"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTask(task.id);
                        }}
                        className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                        title="Delete task"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
