import React from 'react';
import { Target, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface StudyLoadProgressBarProps {
  completedHours?: number;
}

export const StudyLoadProgressBar: React.FC<StudyLoadProgressBarProps> = ({
  completedHours = 0,
}) => {
  const { profile } = useAuth();
  const targetHours = profile?.target_study_hours_week || 25;
  const percentage = Math.min(100, Math.round((completedHours / targetHours) * 100));
  const remaining = Math.max(0, targetHours - completedHours);
  const goalAchieved = completedHours >= targetHours;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Weekly Study Load Goal
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Focus target vs logged study blocks
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {completedHours.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ {targetHours} hrs completed</span>
          </div>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {percentage}%
          </span>
        </div>

        <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            style={{ width: `${percentage}%` }}
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-500 shadow-xs"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900/40 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <span>
            {goalAchieved
              ? 'Weekly goal achieved!'
              : 'Track study sessions via the calendar'}
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          {goalAchieved ? 'Great work!' : `${remaining.toFixed(1)} hrs left`}
        </span>
      </div>
    </div>
  );
};
