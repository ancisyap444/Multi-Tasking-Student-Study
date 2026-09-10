import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckSquare,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Clock,
  Check,
  Calendar,
} from 'lucide-react';
import { Subject, TaskItem, AcademicYear, SubjectColor, DayOfWeek, MeetingTime, TaskPriority, TaskType } from '@/types/database.types';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { addDays, setHours, setMinutes } from 'date-fns';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubject: (subject: Omit<Subject, 'id' | 'user_id' | 'created_at'>) => Promise<Subject | null>;
  onAddTask: (task: Omit<TaskItem, 'id' | 'user_id' | 'created_at' | 'subject'>, autoSchedule: boolean) => Promise<any>;
}

const PRESET_COURSES = [
  {
    code: 'CS 101',
    name: 'Introduction to Computer Science',
    color: 'sky' as SubjectColor,
    instructor: 'Prof. Alan Turing',
    location: 'Turing Hall 301',
    days: ['MON', 'WED', 'FRI'] as DayOfWeek[],
    start: '10:00',
    end: '11:30',
  },
  {
    code: 'MATH 201',
    name: 'Linear Algebra & Calculus',
    color: 'amber' as SubjectColor,
    instructor: 'Dr. Emmy Noether',
    location: 'Math Building 105',
    days: ['TUE', 'THU'] as DayOfWeek[],
    start: '09:00',
    end: '10:30',
  },
  {
    code: 'BIO 110',
    name: 'General Biology & Lab',
    color: 'mint' as SubjectColor,
    instructor: 'Dr. Rosalind Franklin',
    location: 'BioScience Lab 2',
    days: ['MON', 'WED'] as DayOfWeek[],
    start: '13:00',
    end: '14:30',
  },
  {
    code: 'STAT 220',
    name: 'Applied Statistical Methods',
    color: 'lavender' as SubjectColor,
    instructor: 'Prof. Thomas Bayes',
    location: 'Science Quad B12',
    days: ['TUE', 'THU'] as DayOfWeek[],
    start: '14:00',
    end: '15:30',
  },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onAddSubject,
  onAddTask,
}) => {
  const { profile, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1 State: Academic Profile
  const [fullName, setFullName] = useState(profile?.full_name || 'Student');
  const [program, setProgram] = useState(profile?.program || 'BS Computer Science');
  const [year, setYear] = useState<AcademicYear>(profile?.year || 'Sophomore');
  const [targetHours, setTargetHours] = useState(profile?.target_study_hours_week || 25);

  // Step 2 State: Course Setup
  const [courseCode, setCourseCode] = useState('CS 101');
  const [courseName, setCourseName] = useState('Introduction to Computer Science');
  const [courseColor, setCourseColor] = useState<SubjectColor>('sky');
  const [courseInstructor, setCourseInstructor] = useState('Prof. Alan Turing');
  const [courseLocation, setCourseLocation] = useState('Turing Hall 301');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['MON', 'WED', 'FRI']);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:30');

  // Step 3 State: First Task
  const [taskTitle, setTaskTitle] = useState('Read Syllabus & Chapter 1 Overview');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('high');
  const [taskType, setTaskType] = useState<TaskType>('reading');
  const [taskDueDays, setTaskDueDays] = useState<number>(3);
  const [taskEstHours, setTaskEstHours] = useState<number>(2);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESET_COURSES[0]) => {
    setCourseCode(preset.code);
    setCourseName(preset.name);
    setCourseColor(preset.color);
    setCourseInstructor(preset.instructor);
    setCourseLocation(preset.location);
    setSelectedDays(preset.days);
    setStartTime(preset.start);
    setEndTime(preset.end);
  };

  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      // 1. Update Profile Goals
      await updateProfile({
        full_name: fullName,
        program,
        year,
        target_study_hours_week: targetHours,
      });

      // 2. Create First Subject
      const meetingSchedule: MeetingTime[] = selectedDays.map((d) => ({
        day: d,
        start: startTime,
        end: endTime,
      }));

      const createdSubject = await onAddSubject({
        code: courseCode.trim().toUpperCase() || 'CS 101',
        name: courseName.trim() || 'General Lecture',
        color: courseColor,
        instructor: courseInstructor.trim() || undefined,
        location: courseLocation.trim() || undefined,
        meeting_schedule: meetingSchedule,
      });

      // 3. Create First Task
      const dueTarget = setMinutes(setHours(addDays(new Date(), taskDueDays), 23), 59);
      await onAddTask(
        {
          title: taskTitle.trim() || 'First Assignment',
          subject_id: createdSubject?.id,
          priority: taskPriority,
          task_type: taskType,
          status: 'todo',
          estimated_hours: taskEstHours,
          due_at: dueTarget.toISOString(),
          subtasks: [
            { id: '1', title: 'Review lecture notes', completed: false },
            { id: '2', title: 'Draft outline / key takeaways', completed: false },
          ],
        },
        false
      );

      // Save onboarding completion in localStorage
      localStorage.setItem('quicksuite_onboarding_completed', 'true');
      onClose();
    } catch (err) {
      console.error('Error completing onboarding:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('quicksuite_onboarding_completed', 'true');
    onClose();
  };

  const days: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const years: AcademicYear[] = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
  const colors: SubjectColor[] = ['mint', 'lavender', 'amber', 'sky', 'rose'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl dark:border-slate-800 dark:bg-[#0F172A] animate-in fade-in zoom-in-95 duration-200">
        {/* Wizard Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Welcome to Multi-Tasking
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Step {currentStep} of 4: {
                  currentStep === 1 ? 'Academic Goals' :
                  currentStep === 2 ? 'Enroll First Course' :
                  currentStep === 3 ? 'Add First Task' : 'Launch Workspace'
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            Skip Setup
          </button>
        </div>

        {/* Step Indicators */}
        <div className="mt-4 flex items-center gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all duration-300',
                step === currentStep
                  ? 'bg-blue-600'
                  : step < currentStep
                  ? 'bg-emerald-500'
                  : 'bg-slate-200 dark:bg-slate-800'
              )}
            />
          ))}
        </div>

        {/* Step 1: Profile & Target Hours */}
        {currentStep === 1 && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Student Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex River"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Major / Program
                </label>
                <input
                  type="text"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  placeholder="e.g. BS Computer Science"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value as AcademicYear)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Weekly Target Study Hours
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {targetHours} hrs / week
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={targetHours}
                onChange={(e) => setTargetHours(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                <span>Light (10h)</span>
                <span>Balanced (25h)</span>
                <span>Intense (50h)</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Course Setup */}
        {currentStep === 2 && (
          <div className="mt-6 space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                ⚡ Quick Presets (Click to Auto-Fill):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_COURSES.map((preset) => (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={cn(
                      'text-left rounded-xl border p-2.5 transition text-xs',
                      courseCode === preset.code
                        ? 'border-blue-500 bg-blue-50/50 text-blue-900 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-200'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                    )}
                  >
                    <div className="font-bold">{preset.code}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{preset.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Course Name *
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Days Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Meeting Days
              </label>
              <div className="flex gap-1.5">
                {days.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={cn(
                      'flex-1 rounded-lg py-1.5 text-[11px] font-bold transition',
                      selectedDays.includes(d)
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: First Task */}
        {currentStep === 3 && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Task / Assignment Title *
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Read Syllabus & Chapter 1"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Due In (Days)
                </label>
                <select
                  value={taskDueDays}
                  onChange={(e) => setTaskDueDays(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value={1}>Tomorrow (1 day)</option>
                  <option value={3}>In 3 Days</option>
                  <option value={7}>Next Week (7 days)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 dark:border-purple-900/40 dark:bg-purple-950/20">
              <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5 mb-1">
                <Sparkles className="h-4 w-4 text-purple-600" />
                Intelligent Subtasks Auto-Generated:
              </span>
              <ul className="text-xs text-purple-800 dark:text-purple-300/90 space-y-1 list-disc list-inside">
                <li>Review lecture notes & syllabus</li>
                <li>Draft outline & complete deliverables</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 4: Summary & Launch */}
        {currentStep === 4 && (
          <div className="mt-6 space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Check className="h-7 w-7 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                You're Ready to Excel!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Here's a quick summary of what will be configured in your workspace:
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left space-y-2.5 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Student Profile:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{fullName} ({year})</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Enrolled Subject:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{courseCode} — {courseName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Schedule:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedDays.join(', ')} ({startTime} – {endTime})</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">First Task:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{taskTitle}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Weekly Study Target:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{targetHours} hrs / week</span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-medium text-slate-400 hover:text-slate-600"
            >
              Set up later
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition"
            >
              Next Step
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinishOnboarding}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Launching...' : 'Launch Workspace'}
              <Sparkles className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
