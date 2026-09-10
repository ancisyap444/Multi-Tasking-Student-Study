import { CalendarEvent, TaskItem } from '@/types/database.types';
import {
  addDays,
  isBefore,
  parseISO,
  setHours,
  setMinutes,
  addMinutes,
  isSameDay,
  isAfter,
} from 'date-fns';

export interface ProposedStudyBlock {
  id: string;
  task_id: string;
  subject_id?: string;
  title: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

/**
 * Smart Study Load Auto-Placement:
 * Finds unoccupied gaps between 8:00 AM and 8:00 PM prior to the task deadline
 * and generates focused 60-90 minute study blocks.
 */
export function generateAutoStudyBlocks(
  task: TaskItem,
  existingEvents: CalendarEvent[],
  preferredDurationMinutes: number = 90
): ProposedStudyBlock[] {
  if (!task.due_at) return [];

  const dueDate = parseISO(task.due_at);
  const now = new Date();

  // If due date is already in the past, cannot schedule
  if (isBefore(dueDate, now)) return [];

  const totalMinutesNeeded = Math.round((task.estimated_hours || 2) * 60);
  let remainingMinutes = totalMinutesNeeded;
  const proposedBlocks: ProposedStudyBlock[] = [];

  // Consider each day from today up to the due date
  let dayCursor = new Date(now);

  while (isBefore(dayCursor, dueDate) && remainingMinutes > 0) {
    const isCurrentDay = isSameDay(dayCursor, now);
    // Find events on this day
    const dayEvents = existingEvents
      .filter((e) => isSameDay(parseISO(e.start_time), dayCursor))
      .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());

    // Evaluate potential slot candidates on this day (e.g. 9:00, 11:30, 14:00, 16:30, 18:30)
    const candidateHours = [9, 11, 14, 16, 18];

    for (const hour of candidateHours) {
      if (remainingMinutes <= 0) break;

      const slotStart = setMinutes(setHours(new Date(dayCursor), hour), 0);
      const sessionDuration = Math.min(preferredDurationMinutes, remainingMinutes);
      const slotEnd = addMinutes(slotStart, sessionDuration);

      // Don't schedule in the past on today
      if (isCurrentDay && isBefore(slotStart, addMinutes(now, 30))) {
        continue;
      }

      // Don't schedule after the deadline
      if (isAfter(slotEnd, dueDate)) {
        continue;
      }

      // Check collision with existing events or previously proposed blocks
      const hasEventCollision = dayEvents.some((evt) => {
        const evtStart = parseISO(evt.start_time);
        const evtEnd = parseISO(evt.end_time);
        return (
          (isAfter(slotStart, evtStart) && isBefore(slotStart, evtEnd)) ||
          (isAfter(slotEnd, evtStart) && isBefore(slotEnd, evtEnd)) ||
          (isBefore(slotStart, evtStart) && isAfter(slotEnd, evtEnd)) ||
          slotStart.getTime() === evtStart.getTime()
        );
      });

      const hasProposedCollision = proposedBlocks.some((blk) => {
        const blkStart = parseISO(blk.start_time);
        const blkEnd = parseISO(blk.end_time);
        return (
          (isAfter(slotStart, blkStart) && isBefore(slotStart, blkEnd)) ||
          (isAfter(slotEnd, blkStart) && isBefore(slotEnd, blkEnd)) ||
          slotStart.getTime() === blkStart.getTime()
        );
      });

      if (!hasEventCollision && !hasProposedCollision) {
        proposedBlocks.push({
          id: `auto-study-${Date.now()}-${proposedBlocks.length}`,
          task_id: task.id,
          subject_id: task.subject_id,
          title: `Focus Study: ${task.title.length > 25 ? task.title.slice(0, 25) + '…' : task.title}`,
          start_time: slotStart.toISOString(),
          end_time: slotEnd.toISOString(),
          duration_minutes: sessionDuration,
        });

        remainingMinutes -= sessionDuration;
      }
    }

    dayCursor = addDays(dayCursor, 1);
  }

  return proposedBlocks;
}
