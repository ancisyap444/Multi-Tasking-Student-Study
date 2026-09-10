import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  isTomorrow,
  isPast,
  parseISO,
  differenceInMinutes,
  differenceInHours,
  differenceInCalendarDays,
  getHours,
  getMinutes,
} from 'date-fns';
import { CalendarEvent } from '@/types/database.types';

export const CALENDAR_START_HOUR = 7;
export const CALENDAR_END_HOUR = 21;
export const TOTAL_GRID_HOURS = CALENDAR_END_HOUR - CALENDAR_START_HOUR + 1;
export const TOTAL_HOURS = TOTAL_GRID_HOURS;

export function getWeekDays(currentDate: Date = new Date()): Date[] {
  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function formatHourLabel(hour: number): string {
  if (hour === 12) return '12 PM';
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
}

export function formatEventTimeRange(startIso: string, endIso: string): string {
  try {
    const start = parseISO(startIso);
    const end = parseISO(endIso);
    return `${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`;
  } catch {
    return '';
  }
}

export function calculateEventPosition(startIso: string, endIso: string): { topPct: number; heightPct: number } {
  try {
    const start = parseISO(startIso);
    const end = parseISO(endIso);

    const startH = getHours(start) + getMinutes(start) / 60;
    const endH = getHours(end) + getMinutes(end) / 60;

    const clampedStart = Math.max(CALENDAR_START_HOUR, Math.min(CALENDAR_END_HOUR + 1, startH));
    const clampedEnd = Math.max(CALENDAR_START_HOUR, Math.min(CALENDAR_END_HOUR + 1, endH));

    const topPct = ((clampedStart - CALENDAR_START_HOUR) / TOTAL_HOURS) * 100;
    const durationHours = Math.max(0.4, clampedEnd - clampedStart);
    const heightPct = (durationHours / TOTAL_HOURS) * 100;

    return { topPct, heightPct };
  } catch {
    return { topPct: 0, heightPct: 5 };
  }
}

export function getCurrentTimePosition(): number | null {
  const now = new Date();
  const currentHour = getHours(now) + getMinutes(now) / 60;

  if (currentHour < CALENDAR_START_HOUR || currentHour > CALENDAR_END_HOUR + 1) {
    return null;
  }

  return ((currentHour - CALENDAR_START_HOUR) / TOTAL_HOURS) * 100;
}

export function getCurrentSemester(date: Date = new Date()): string {
  const month = date.getMonth();
  const year = date.getFullYear();

  let term: string;
  if (month >= 0 && month <= 4) {
    term = 'Spring';
  } else if (month >= 5 && month <= 6) {
    term = 'Summer';
  } else {
    term = 'Fall';
  }

  return `${term} ${year} Semester`;
}

export interface DeadlineCountdown {
  label: string;
  urgency: 'overdue' | 'today' | 'tomorrow' | 'soon' | 'later' | 'none';
  badgeClass: string;
  isPast: boolean;
}

export function getDeadlineCountdown(dueIso?: string | null): DeadlineCountdown {
  if (!dueIso) {
    return {
      label: 'No deadline',
      urgency: 'none',
      badgeClass: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
      isPast: false,
    };
  }

  try {
    const due = parseISO(dueIso);
    const now = new Date();
    const isPastDue = isPast(due);
    const minsDiff = differenceInMinutes(due, now);
    const hoursDiff = differenceInHours(due, now);
    const daysDiff = differenceInCalendarDays(due, now);

    if (isPastDue) {
      const absHours = Math.abs(hoursDiff);
      const absDays = Math.abs(daysDiff);
      let label = 'Overdue';
      if (absDays >= 1) {
        label = `Overdue by ${absDays}d`;
      } else if (absHours >= 1) {
        label = `Overdue by ${absHours}h`;
      } else {
        label = `Overdue by ${Math.abs(minsDiff)}m`;
      }
      return {
        label,
        urgency: 'overdue',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900',
        isPast: true,
      };
    }

    if (isToday(due)) {
      let label = 'Due today';
      if (hoursDiff > 0) {
        label = `Due today (${hoursDiff}h left)`;
      } else if (minsDiff > 0) {
        label = `Due in ${minsDiff}m`;
      }
      return {
        label,
        urgency: 'today',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900',
        isPast: false,
      };
    }

    if (isTomorrow(due)) {
      return {
        label: 'Due tomorrow',
        urgency: 'tomorrow',
        badgeClass: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-900',
        isPast: false,
      };
    }

    if (daysDiff >= 2 && daysDiff <= 7) {
      return {
        label: `${daysDiff} days left`,
        urgency: 'soon',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900',
        isPast: false,
      };
    }

    return {
      label: `In ${daysDiff} days`,
      urgency: 'later',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
      isPast: false,
    };
  } catch {
    return {
      label: 'Invalid date',
      urgency: 'none',
      badgeClass: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
      isPast: false,
    };
  }
}

export function getWeeklyStudyHours(events: CalendarEvent[], referenceDate: Date = new Date()): number {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });

  let totalMinutes = 0;

  for (const event of events) {
    if (event.type !== 'study') continue;

    try {
      const start = parseISO(event.start_time);
      const end = parseISO(event.end_time);

      if (start >= weekStart && start <= weekEnd) {
        const duration = Math.max(0, differenceInMinutes(end, start));
        totalMinutes += duration;
      }
    } catch {
      // Ignore parse errors
    }
  }

  const hours = totalMinutes / 60;
  return Math.round(hours * 10) / 10;
}

export { isSameDay, isToday, isTomorrow, isPast, format, parseISO, differenceInMinutes, differenceInHours, differenceInCalendarDays };
