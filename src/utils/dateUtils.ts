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

export const CALENDAR_START_HOUR = 8; // 8:00 AM
export const CALENDAR_END_HOUR = 20;  // 8:00 PM
export const TOTAL_HOURS = CALENDAR_END_HOUR - CALENDAR_START_HOUR;

export function getWeekDays(currentDate: Date = new Date()): Date[] {
  const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });     // Sunday
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

/**
 * Calculates top offset (in percent) and height (in percent) relative to 8 AM - 8 PM
 */
export function calculateEventPosition(startIso: string, endIso: string): { topPct: number; heightPct: number } {
  try {
    const start = parseISO(startIso);
    const end = parseISO(endIso);

    const startH = getHours(start) + getMinutes(start) / 60;
    const endH = getHours(end) + getMinutes(end) / 60;

    // Constrain to grid 8 AM - 8 PM
    const clampedStart = Math.max(CALENDAR_START_HOUR, Math.min(CALENDAR_END_HOUR, startH));
    const clampedEnd = Math.max(CALENDAR_START_HOUR, Math.min(CALENDAR_END_HOUR, endH));

    const topPct = ((clampedStart - CALENDAR_START_HOUR) / TOTAL_HOURS) * 100;
    const durationHours = Math.max(0.4, clampedEnd - clampedStart);
    const heightPct = (durationHours / TOTAL_HOURS) * 100;

    return { topPct, heightPct };
  } catch {
    return { topPct: 0, heightPct: 5 };
  }
}

/**
 * Returns current time indicator position in percent from top of the grid
 */
export function getCurrentTimePosition(): number | null {
  const now = new Date();
  const currentHour = getHours(now) + getMinutes(now) / 60;

  if (currentHour < CALENDAR_START_HOUR || currentHour > CALENDAR_END_HOUR) {
    return null;
  }

  return ((currentHour - CALENDAR_START_HOUR) / TOTAL_HOURS) * 100;
}

export { isSameDay, isToday, format, parseISO, differenceInMinutes };
