import React from 'react';
import { Plus, CheckSquare, Sparkles, BookOpen } from 'lucide-react';

interface QuickActionButtonsProps {
  onAddSubject: () => void;
  onAddTask: () => void;
  onAutoSchedule: () => void;
}

export const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({
  onAddSubject,
  onAddTask,
  onAutoSchedule,
}) => {
  const actions = [
    {
      title: 'Quick Add Task',
      desc: 'Assignment or reading due soon',
      icon: CheckSquare,
      onClick: onAddTask,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
      border: 'hover:border-blue-300 dark:hover:border-blue-800',
    },
    {
      title: 'Auto-Schedule Study',
      desc: 'Auto-place blocks in free calendar gaps',
      icon: Sparkles,
      onClick: onAutoSchedule,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
      border: 'hover:border-purple-300 dark:hover:border-purple-800',
    },
    {
      title: 'Add Enrolled Course',
      desc: 'Set recurring lecture timetable',
      icon: BookOpen,
      onClick: onAddSubject,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
      border: 'hover:border-emerald-300 dark:hover:border-emerald-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((act, idx) => {
        const Icon = act.icon;
        return (
          <button
            key={idx}
            onClick={act.onClick}
            className={`group flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xs transition hover:shadow-card dark:border-slate-800 dark:bg-[#0F172A] ${act.border}`}
          >
            <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${act.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {act.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {act.desc}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
