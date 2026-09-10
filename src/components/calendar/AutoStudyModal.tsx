import React, { useState, useMemo } from 'react';
import { Sparkles, Calendar, Clock, Check, X, ArrowRight, BookOpen } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TaskItem, CalendarEvent } from '@/types/database.types';
import { generateAutoStudyBlocks, ProposedStudyBlock } from '@/utils/studyBlockScheduler';

interface AutoStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskItem[];
  events: CalendarEvent[];
  onAddMultipleEvents: (
    events: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'subject'>[]
  ) => Promise<any>;
}

export const AutoStudyModal: React.FC<AutoStudyModalProps> = ({
  isOpen,
  onClose,
  tasks,
  events,
  onAddMultipleEvents,
}) => {
  // Only non-done tasks with due dates
  const eligibleTasks = useMemo(() => {
    return tasks.filter((t) => t.status !== 'done' && Boolean(t.due_at));
  }, [tasks]);

  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    eligibleTasks[0]?.id || ''
  );
  const [preferredDuration, setPreferredDuration] = useState<number>(90);
  const [isInserting, setIsInserting] = useState(false);

  const selectedTask = useMemo(() => {
    return eligibleTasks.find((t) => t.id === selectedTaskId);
  }, [eligibleTasks, selectedTaskId]);

  // Compute proposed study blocks
  const proposedBlocks = useMemo(() => {
    if (!selectedTask) return [];
    return generateAutoStudyBlocks(selectedTask, events, preferredDuration);
  }, [selectedTask, events, preferredDuration]);

  if (!isOpen) return null;

  const handleApplyBlocks = async () => {
    if (proposedBlocks.length === 0) return;

    setIsInserting(true);
    try {
      const newEvents = proposedBlocks.map((blk) => ({
        title: blk.title,
        type: 'study' as const,
        subject_id: blk.subject_id,
        start_time: blk.start_time,
        end_time: blk.end_time,
        notes: 'Auto-placed by Multi-Tasking Study Scheduler',
        related_task_id: blk.task_id,
        is_recurring: false,
      }));

      await onAddMultipleEvents(newEvents);
      onClose();
    } catch (err) {
      console.error('Failed to add auto study blocks:', err);
    } finally {
      setIsInserting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#0F172A]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Smart Study Load Auto-Placement
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automatically schedule focused study sessions in free calendar gaps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Task Selection */}
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Assignment or Exam Deadline
            </label>
            {eligibleTasks.length > 0 ? (
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {eligibleTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} (Est: {t.estimated_hours}h) · Due:{' '}
                    {t.due_at ? format(parseISO(t.due_at), 'MMM d, h:mm a') : 'N/A'}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500 dark:border-slate-800">
                No active tasks with upcoming due dates found. Add a task first!
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Session Chunk Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '45 mins', val: 45 },
                  { label: '60 mins', val: 60 },
                  { label: '90 mins', val: 90 },
                ].map((dur) => (
                  <button
                    key={dur.val}
                    type="button"
                    onClick={() => setPreferredDuration(dur.val)}
                    className={`rounded-xl border py-1.5 text-xs font-medium transition ${
                      preferredDuration === dur.val
                        ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generated Proposals Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Proposed Calendar Slots ({proposedBlocks.length})
              </span>
              <span className="text-xs text-purple-600 font-medium dark:text-purple-400">
                Avoids class conflicts
              </span>
            </div>

            <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/50 p-2 space-y-2 dark:border-slate-800 dark:bg-slate-900/40">
              {proposedBlocks.length > 0 ? (
                proposedBlocks.map((blk, idx) => {
                  const start = parseISO(blk.start_time);
                  const end = parseISO(blk.end_time);
                  return (
                    <div
                      key={blk.id}
                      className="flex items-center justify-between rounded-lg border border-purple-200/80 bg-white p-2.5 text-xs shadow-2xs dark:border-purple-900/60 dark:bg-slate-800"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-100 font-semibold text-purple-700 text-[10px] dark:bg-purple-950 dark:text-purple-300">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {format(start, 'EEEE, MMM d')}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {format(start, 'h:mm a')} – {format(end, 'h:mm a')} ({blk.duration_minutes} mins)
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        Unoccupied Slot
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  {selectedTask
                    ? 'No open slots found before deadline or task is already completed.'
                    : 'Select a task to preview study placement.'}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={proposedBlocks.length === 0 || isInserting}
              onClick={handleApplyBlocks}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>
                {isInserting
                  ? 'Placing on Calendar...'
                  : `Confirm & Add ${proposedBlocks.length} Blocks`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
