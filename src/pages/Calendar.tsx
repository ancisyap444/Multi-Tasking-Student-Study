import React, { useState } from 'react';
import { addWeeks, subWeeks, addDays, subDays, addMonths, subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { CalendarToolbar, CalendarViewMode } from '@/components/calendar/CalendarToolbar';
import { WeeklyGrid } from '@/components/calendar/WeeklyGrid';
import { EventCard } from '@/components/calendar/EventCard';
import { AddEventModal } from '@/components/calendar/AddEventModal';
import { AutoStudyModal } from '@/components/calendar/AutoStudyModal';
import { CalendarEvent, Subject, TaskItem, EventType } from '@/types/database.types';
import { cn } from '@/lib/utils';

interface CalendarPageProps {
  events: CalendarEvent[];
  subjects: Subject[];
  tasks: TaskItem[];
  selectedSubjectFilter: string | null;
  onAddEvent: (event: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'subject'>) => Promise<any>;
  onAddMultipleEvents: (events: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'subject'>[]) => Promise<any>;
  onDeleteEvent: (id: string) => void;
  isAddEventOpen: boolean;
  onOpenAddEvent: () => void;
  onCloseAddEvent: () => void;
  isAutoScheduleOpen: boolean;
  onOpenAutoSchedule: () => void;
  onCloseAutoSchedule: () => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  events,
  subjects,
  tasks,
  selectedSubjectFilter,
  onAddEvent,
  onAddMultipleEvents,
  onDeleteEvent,
  isAddEventOpen,
  onOpenAddEvent,
  onCloseAddEvent,
  isAutoScheduleOpen,
  onOpenAutoSchedule,
  onCloseAutoSchedule,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [selectedCategory, setSelectedCategory] = useState<EventType | 'all'>('all');

  const handlePrev = () => {
    if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month view calculations
  const monthDays = React.useMemo(() => {
    if (viewMode !== 'month') return [];
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate, viewMode]);

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-[#F8FAFC] dark:bg-[#0B0F19]">
      {/* Calendar Header Toolbar */}
      <CalendarToolbar
        currentDate={currentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrevDate={handlePrev}
        onNextDate={handleNext}
        onToday={handleToday}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenAddEvent={onOpenAddEvent}
        onOpenAutoSchedule={onOpenAutoSchedule}
      />

      {/* Main Calendar Viewport */}
      <div className="flex flex-1 overflow-hidden">
        {viewMode === 'week' && (
          <WeeklyGrid
            currentDate={currentDate}
            events={events}
            selectedCategory={selectedCategory}
            selectedSubjectFilter={selectedSubjectFilter}
            onDeleteEvent={onDeleteEvent}
          />
        )}

        {viewMode === 'day' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {format(currentDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <p className="text-xs text-slate-500">Daily focus agenda and schedule breakdown</p>
            </div>

            <div className="space-y-3">
              {events
                .filter((e) => {
                  try {
                    return isSameDay(parseISO(e.start_time), currentDate);
                  } catch {
                    return false;
                  }
                })
                .map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onDelete={onDeleteEvent}
                    styleMode="flow"
                  />
                ))}

              {events.filter((e) => {
                try {
                  return isSameDay(parseISO(e.start_time), currentDate);
                } catch {
                  return false;
                }
              }).length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  No classes or study sessions scheduled for this day.
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'month' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-400"
                >
                  {day}
                </div>
              ))}

              {monthDays.map((day) => {
                const dayEvents = events.filter((e) => {
                  try {
                    return isSameDay(parseISO(e.start_time), day);
                  } catch {
                    return false;
                  }
                });

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => {
                      setCurrentDate(day);
                      setViewMode('day');
                    }}
                    className="min-h-[100px] cursor-pointer rounded-xl border border-slate-200 bg-white p-2 transition hover:border-blue-400 dark:border-slate-800 dark:bg-[#0F172A]"
                  >
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {format(day, 'd')}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 3).map((e) => (
                        <div
                          key={e.id}
                          className="truncate rounded px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        >
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-semibold pl-1">
                          +{dayEvents.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isAddEventOpen}
        onClose={onCloseAddEvent}
        subjects={subjects}
        onAddEvent={onAddEvent}
      />

      {/* Smart Auto-Study Scheduler Modal */}
      <AutoStudyModal
        isOpen={isAutoScheduleOpen}
        onClose={onCloseAutoSchedule}
        tasks={tasks}
        events={events}
        onAddMultipleEvents={onAddMultipleEvents}
      />
    </div>
  );
};
