import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle2, UserCheck, BookOpen, Save } from 'lucide-react';
import { Subject, TaskItem } from '@/types/database.types';
import { getSubjectMetric, saveSubjectMetric, computeSubjectTaskProgress, SubjectMetric } from '@/utils/subjectProgress';
import { cn } from '@/lib/utils';

interface CourseProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
  tasks: TaskItem[];
  onProgressUpdated?: () => void;
}

const colorBadgeStyles: Record<string, string> = {
  mint: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  lavender: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400',
  amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
  sky: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
  rose: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
};

const progressBarColors: Record<string, string> = {
  mint: 'bg-emerald-500',
  lavender: 'bg-purple-500',
  amber: 'bg-amber-500',
  sky: 'bg-blue-500',
  rose: 'bg-rose-500',
};

export const CourseProgressModal: React.FC<CourseProgressModalProps> = ({
  isOpen,
  onClose,
  subject,
  tasks,
  onProgressUpdated,
}) => {
  const [metric, setMetric] = useState<SubjectMetric>({ subjectId: '' });
  const [grade, setGrade] = useState('');
  const [targetGrade, setTargetGrade] = useState('A');
  const [attended, setAttended] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);

  useEffect(() => {
    if (subject) {
      const data = getSubjectMetric(subject.id);
      setMetric(data);
      setGrade(data.grade || '');
      setTargetGrade(data.targetGrade || 'A');
      setAttended(data.attendedClasses || 0);
      setTotalClasses(data.totalClasses || 0);
    }
  }, [subject, isOpen]);

  if (!isOpen || !subject) return null;

  const taskProgress = computeSubjectTaskProgress(subject.id, tasks);
  const calculatedAttendance = totalClasses > 0 ? Math.min(100, Math.round((attended / totalClasses) * 100)) : 100;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSubjectMetric(subject.id, {
      grade: grade.trim(),
      targetGrade: targetGrade.trim(),
      attendedClasses: attended,
      totalClasses: totalClasses,
      attendancePct: calculatedAttendance,
    });
    onProgressUpdated?.();
    onClose();
  };

  const colorClass = colorBadgeStyles[subject.color] || colorBadgeStyles.sky;
  const barClass = progressBarColors[subject.color] || progressBarColors.sky;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#0F172A] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className={cn('rounded-lg border px-2 py-0.5 text-xs font-bold uppercase', colorClass)}>
              {subject.code}
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                {subject.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Course Progress & Metrics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Task Completion Overview */}
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/50">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Task Completion
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {taskProgress.completed} / {taskProgress.total} ({taskProgress.percentage}%)
            </span>
          </div>
          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={cn('h-full transition-all duration-500 rounded-full', barClass)}
              style={{ width: `${taskProgress.percentage}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* Grade Tracker */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-blue-500" />
                Current Grade
              </label>
              <input
                type="text"
                placeholder="e.g. A, 92%"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Target Grade
              </label>
              <input
                type="text"
                placeholder="e.g. A"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Attendance Tracker */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800/60 dark:bg-slate-900/30">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                Lecture Attendance
              </label>
              <span className={cn(
                'text-xs font-bold px-2 py-0.5 rounded-md',
                calculatedAttendance >= 85 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
              )}>
                {calculatedAttendance}% Rate
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Classes Attended</span>
                <input
                  type="number"
                  min="0"
                  value={attended}
                  onChange={(e) => setAttended(Math.max(0, parseInt(e.target.value) || 0))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Total Held</span>
                <input
                  type="number"
                  min="0"
                  value={totalClasses}
                  onChange={(e) => setTotalClasses(Math.max(0, parseInt(e.target.value) || 0))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Quick Increment Buttons */}
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAttended((prev) => prev + 1);
                  setTotalClasses((prev) => prev + 1);
                }}
                className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                + Log Attended
              </button>
              <button
                type="button"
                onClick={() => setTotalClasses((prev) => prev + 1)}
                className="flex-1 rounded-lg border border-rose-200 bg-rose-50 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
              >
                + Missed Class
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition"
            >
              <Save className="h-3.5 w-3.5" />
              Save Metrics
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
