import React, { useState } from 'react';
import { X, Plus, Trash2, Calendar, BookOpen, Clock } from 'lucide-react';
import { Subject, SubjectColor, DayOfWeek, MeetingTime } from '@/types/database.types';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubject: (
    subject: Omit<Subject, 'id' | 'user_id' | 'created_at'>
  ) => Promise<Subject>;
  onAddRecurringClasses?: (
    subject: Subject,
    meetingSchedule: MeetingTime[]
  ) => Promise<any>;
}

const colorOptions: { id: SubjectColor; label: string; bg: string; border: string }[] = [
  { id: 'mint', label: 'Mint Green', bg: 'bg-emerald-500', border: 'border-emerald-400' },
  { id: 'lavender', label: 'Soft Lavender', bg: 'bg-purple-500', border: 'border-purple-400' },
  { id: 'amber', label: 'Warm Amber', bg: 'bg-amber-500', border: 'border-amber-400' },
  { id: 'sky', label: 'Sky Blue', bg: 'bg-sky-500', border: 'border-sky-400' },
  { id: 'rose', label: 'Soft Rose', bg: 'bg-rose-500', border: 'border-rose-400' },
];

const DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  onAddSubject,
  onAddRecurringClasses,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState<SubjectColor>('mint');
  const [instructor, setInstructor] = useState('');
  const [location, setLocation] = useState('');

  // Meeting times schedule
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['MON', 'WED', 'FRI']);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    setIsSubmitting(true);
    try {
      const meetingSchedule: MeetingTime[] = selectedDays.map((d) => ({
        day: d,
        start: startTime,
        end: endTime,
      }));

      const created = await onAddSubject({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        color,
        instructor: instructor.trim() || undefined,
        location: location.trim() || undefined,
        meeting_schedule: meetingSchedule,
      });

      if (onAddRecurringClasses && created) {
        await onAddRecurringClasses(created, meetingSchedule);
      }

      onClose();
      setName('');
      setCode('');
      setInstructor('');
      setLocation('');
    } catch (err) {
      console.error('Failed to create subject:', err);
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
              Enroll New Subject
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter course information and recurring lecture schedule
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CS 101"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Course Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Data Structures & Algorithms"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Professor / Instructor
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Vance"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Classroom / Room
              </label>
              <input
                type="text"
                placeholder="e.g. Turing Hall 302"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Color Badge Picker */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Course Pastel Badge Color
            </label>
            <div className="flex gap-2">
              {colorOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setColor(opt.id)}
                  className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
                    color === opt.id
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${opt.bg}`} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recurring Meeting Schedule */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3 dark:border-slate-800 dark:bg-slate-900/50">
            <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
              Recurring Lecture Schedule (Auto-locks onto weekly calendar)
            </span>

            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((day) => {
                const active = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      active
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>
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
              {isSubmitting ? 'Enrolling...' : 'Enroll & Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
