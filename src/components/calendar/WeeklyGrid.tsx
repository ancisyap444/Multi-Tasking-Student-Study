import React, { useMemo } from 'react';
import { format, isSameDay, isToday, parseISO } from 'date-fns';
import { CalendarEvent, EventType } from '@/types/database.types';
import {
  getWeekDays,
  formatHourLabel,
  CALENDAR_START_HOUR,
  CALENDAR_END_HOUR,
  getCurrentTimePosition,
} from '@/utils/dateUtils';
import { EventCard } from './EventCard';
import { cn } from '@/lib/utils';

interface WeeklyGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedCategory: EventType | 'all';
  selectedSubjectFilter: string | null;
  onDeleteEvent: (id: string) => void;
}

export const WeeklyGrid: React.FC<WeeklyGridProps> = ({
  currentDate,
  events,
  selectedCategory,
  selectedSubjectFilter,
  onDeleteEvent,
}) => {
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  // Generate 8:00 AM to 8:00 PM hours (12 slots)
  const hourSlots = useMemo(() => {
    const slots = [];
    for (let h = CALENDAR_START_HOUR; h <= CALENDAR_END_HOUR; h++) {
      slots.push(h);
    }
    return slots;
  }, []);

  // Filter events based on active category & subject filter
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchCategory = selectedCategory === 'all' || e.type === selectedCategory;
      const matchSubject = !selectedSubjectFilter || e.subject_id === selectedSubjectFilter;
      return matchCategory && matchSubject;
    });
  }, [events, selectedCategory, selectedSubjectFilter]);

  const currentTimeTop = getCurrentTimePosition();

  return (
    <div className="flex flex-1 flex-col overflow-x-auto select-none">
      {/* Week Header: Mon - Sun */}
      <div className="sticky top-0 z-30 grid grid-cols-[70px_repeat(7,minmax(130px,1fr))] border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-[#0F172A]/95">
        {/* Empty corner cell for timezone/hour header */}
        <div className="flex items-center justify-center border-r border-slate-100 p-2 text-[10px] font-semibold text-slate-400 dark:border-slate-800">
          TIME
        </div>

        {weekDays.map((day) => {
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'flex flex-col items-center justify-center border-r border-slate-100 py-3 transition dark:border-slate-800',
                today && 'bg-blue-50/40 dark:bg-blue-950/20'
              )}
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-400">
                {format(day, 'EEE')}
              </span>
              <div
                className={cn(
                  'mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition',
                  today
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                )}
              >
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Timetable Body (8 AM - 8 PM) */}
      <div className="relative grid flex-1 grid-cols-[70px_repeat(7,minmax(130px,1fr))] overflow-y-auto">
        {/* Left Hours Column */}
        <div className="relative border-r border-slate-100 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/20">
          {hourSlots.map((hour) => (
            <div
              key={hour}
              className="relative h-16 border-b border-slate-100 pr-2 text-right text-[11px] font-medium text-slate-400 dark:border-slate-800/80 dark:text-slate-400"
            >
              <span className="-top-2.5 relative block">
                {formatHourLabel(hour)}
              </span>
            </div>
          ))}
        </div>

        {/* 7 Days Columns */}
        {weekDays.map((day) => {
          const today = isToday(day);
          const dayEvents = filteredEvents.filter((e) => {
            try {
              return isSameDay(parseISO(e.start_time), day);
            } catch {
              return false;
            }
          });

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'relative border-r border-slate-100 dark:border-slate-800/80',
                today && 'bg-blue-50/20 dark:bg-blue-950/10'
              )}
            >
              {/* Hour Grid Lines */}
              {hourSlots.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b border-slate-100/90 dark:border-slate-800/60"
                />
              ))}

              {/* Current Time Indicator Line (shown only on today) */}
              {today && currentTimeTop !== null && (
                <div
                  style={{ top: `${currentTimeTop}%` }}
                  className="pointer-events-none absolute inset-x-0 z-30 flex items-center"
                >
                  <div className="-left-1.5 absolute h-3 w-3 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
                  <div className="h-0.5 w-full bg-blue-600 shadow-sm" />
                </div>
              )}

              {/* Events positioned in column */}
              <div className="absolute inset-0 p-1">
                {dayEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onDelete={onDeleteEvent}
                    styleMode="absolute"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
