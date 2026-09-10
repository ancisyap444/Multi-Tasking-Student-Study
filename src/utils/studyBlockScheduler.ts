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

export function generateAutoStudyBlocks(
  task: TaskItem,
  existingEvents: CalendarEvent[],
  preferredDurationMinutes: number = 90
): ProposedStudyBlock[] {
  if (!task.due_at) return [];

  const dueDate = parseISO(task.due_at);
  const now = new Date();

  if (isBefore(dueDate, now)) return [];

  const totalMinutesNeeded = Math.round((task.estimated_hours || 2) * 60);
  let remainingMinutes = totalMinutesNeeded;
  const proposedBlocks: ProposedStudyBlock[] = [];

  let dayCursor = new Date(now);

  while (isBefore(dayCursor, dueDate) && remainingMinutes > 0) {
    const isCurrentDay = isSameDay(dayCursor, now);
    const dayEvents = existingEvents
      .filter((e) => {
        try {
          return isSameDay(parseISO(e.start_time), dayCursor);
        } catch {
          return false;
        }
      })
      .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());

    const candidateHours = [9, 11, 14, 16, 18];

    for (const hour of candidateHours) {
      if (remainingMinutes <= 0) break;

      const slotStart = setMinutes(setHours(new Date(dayCursor), hour), 0);
      const sessionDuration = Math.min(preferredDurationMinutes, remainingMinutes);
      const slotEnd = addMinutes(slotStart, sessionDuration);

      if (isCurrentDay && isBefore(slotStart, addMinutes(now, 30))) {
        continue;
      }

      if (isAfter(slotEnd, dueDate)) {
        continue;
      }

      const slotStartMs = slotStart.getTime();
      const slotEndMs = slotEnd.getTime();

      const hasEventCollision = dayEvents.some((evt) => {
        try {
          const evtStartMs = parseISO(evt.start_time).getTime();
          const evtEndMs = parseISO(evt.end_time).getTime();
          return slotStartMs < evtEndMs && slotEndMs > evtStartMs;
        } catch {
          return false;
        }
      });

      const hasProposedCollision = proposedBlocks.some((blk) => {
        try {
          const blkStartMs = parseISO(blk.start_time).getTime();
          const blkEndMs = parseISO(blk.end_time).getTime();
          return slotStartMs < blkEndMs && slotEndMs > blkStartMs;
        } catch {
          return false;
        }
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
