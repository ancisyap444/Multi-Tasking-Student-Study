import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  parseISO,
  differenceInMinutes,
  getHours,
  getMinutes,
} from 'date-fns';

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

export { isSameDay, isToday, format, parseISO, differenceInMinutes };
