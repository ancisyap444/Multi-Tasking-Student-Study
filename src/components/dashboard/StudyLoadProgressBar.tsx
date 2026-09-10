import React from 'react';
import { Target, Flame, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface StudyLoadProgressBarProps {
  completedHours?: number;
}

export const StudyLoadProgressBar: React.FC<StudyLoadProgressBarProps> = ({
  completedHours = 18.5,
}) => {
  const { profile } = useAuth();
  const targetHours = profile?.target_study_hours_week || 25;
  const percentage = Math.min(100, Math.round((completedHours / targetHours) * 100));

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
      <div>
        <div className="flex items-center justify-between">
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
          <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span>4-day streak</span>
          </div>
        </div>

        {/* Big numbers */}
        <div className="mt-5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {completedHours}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ {targetHours} hrs completed</span>
          </div>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {percentage}%
          </span>
        </div>

        {/* Progress bar container */}
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
          <span>Ahead of schedule by 2.5 hrs</span>
        </div>
        <span className="text-[11px] text-slate-400">
          {targetHours - completedHours > 0
            ? `${(targetHours - completedHours).toFixed(1)} hrs left this week`
            : 'Goal achieved!'}
        </span>
      </div>
    </div>
  );
};
