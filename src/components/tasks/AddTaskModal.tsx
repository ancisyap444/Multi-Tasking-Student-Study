import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { Subject, TaskItem, TaskPriority, TaskType } from '@/types/database.types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onAddTask: (
    task: Omit<TaskItem, 'id' | 'user_id' | 'created_at' | 'subject'>,
    autoSchedule: boolean
  ) => Promise<any>;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onAddTask,
}) => {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [dueAt, setDueAt] = useState(
    format(addDays(new Date(), 2), "yyyy-MM-dd'T'23:59")
  );
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [taskType, setTaskType] = useState<TaskType>('homework');
  const [estimatedHours, setEstimatedHours] = useState<number>(2);
  const [autoSchedule, setAutoSchedule] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let isoDue: string | undefined = undefined;
    if (dueAt) {
      const parsed = new Date(dueAt);
      if (!isNaN(parsed.getTime())) {
        isoDue = parsed.toISOString();
      }
    }

    setIsSubmitting(true);
    try {
      await onAddTask(
        {
          title: title.trim(),
          subject_id: subjectId || undefined,
          notes: notes.trim() || undefined,
          due_at: isoDue,
          priority,
          status: 'todo',
          task_type: taskType,
          estimated_hours: estimatedHours,
          subtasks: [],
        },
        autoSchedule
      );

      onClose();
      setTitle('');
      setNotes('');
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Create Assignment or Task
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track course deliverables and study commitments
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement Graph Search BFS/DFS"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Subject Course
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">None (General)</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}: {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Task Category
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="homework">Homework / Problem Set</option>
                <option value="reading">Assigned Reading</option>
                <option value="exam_prep">Exam Prep / Revision</option>
                <option value="project">Project Milestone</option>
                <option value="lab">Lab Report</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Due Date & Time
              </label>
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="40"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['urgent', 'high', 'medium', 'low'] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`rounded-xl border py-1.5 text-xs font-semibold capitalize transition ${
                    priority === p
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-purple-200/80 bg-purple-50/50 p-3 dark:border-purple-900/50 dark:bg-purple-950/20">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSchedule}
                onChange={(e) => setAutoSchedule(e.target.checked)}
                className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-purple-600" />
                  Auto-place study blocks into free calendar slots
                </span>
                <p className="text-[11px] text-purple-700/80 dark:text-purple-400">
                  Finds open time gaps before the due date and schedules revision sessions
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
