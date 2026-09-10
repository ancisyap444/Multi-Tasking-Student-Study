import React, { useMemo } from 'react';
import {
  Clock,
  MapPin,
  Video,
  FileText,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { differenceInMinutes, parseISO, isAfter, isBefore, addHours } from 'date-fns';
import { CalendarEvent } from '@/types/database.types';
import { formatEventTimeRange } from '@/utils/dateUtils';

interface NextClassBannerProps {
  events: CalendarEvent[];
  onOpenCalendar: () => void;
}

export const NextClassBanner: React.FC<NextClassBannerProps> = ({
  events,
  onOpenCalendar,
}) => {
  const now = new Date();

  // Find the next upcoming or currently active class/event
  const imminentEvent = useMemo(() => {
    const futureEvents = events
      .filter((e) => {
        try {
          const end = parseISO(e.end_time);
          return isAfter(end, now);
        } catch {
          return false;
        }
      })
      .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());

    return futureEvents[0] || null;
  }, [events, now]);

  if (!imminentEvent) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-card">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-xs">
              <CheckCircle2 className="h-3.5 w-3.5" />
              All Clear for Today
            </span>
            <h2 className="text-xl font-bold">No Upcoming Classes Scheduled</h2>
            <p className="text-xs text-blue-100 max-w-md">
              You are all caught up! Use your free block to review assignment problem sets or relax.
            </p>
          </div>
          <button
            onClick={onOpenCalendar}
            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
          >
            <span>View Full Calendar</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const start = parseISO(imminentEvent.start_time);
  const end = parseISO(imminentEvent.end_time);
  const isOngoing = isBefore(start, now) && isAfter(end, now);
  const minutesUntil = differenceInMinutes(start, now);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-card dark:border-blue-900/40">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {isOngoing ? 'Class In Progress Now' : `Next Up · Starts in ${minutesUntil} mins`}
            </span>
            {imminentEvent.subject && (
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium backdrop-blur-xs">
                {imminentEvent.subject.code}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight">
            {imminentEvent.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-blue-100">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="h-4 w-4 text-blue-200" />
              <span>{formatEventTimeRange(imminentEvent.start_time, imminentEvent.end_time)}</span>
            </div>

            {imminentEvent.location && (
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin className="h-4 w-4 text-blue-200" />
                <span>{imminentEvent.location}</span>
              </div>
            )}

            {imminentEvent.subject?.instructor && (
              <div className="flex items-center gap-1.5 font-medium">
                <BookOpen className="h-4 w-4 text-blue-200" />
                <span>{imminentEvent.subject.instructor}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick lecture action buttons */}
        <div className="flex items-center gap-2">
          {imminentEvent.location?.toLowerCase().includes('zoom') ? (
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              <Video className="h-4 w-4" />
              <span>Join Zoom Lecture</span>
            </a>
          ) : (
            <button
              onClick={onOpenCalendar}
              className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              <span>View Timetable</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
