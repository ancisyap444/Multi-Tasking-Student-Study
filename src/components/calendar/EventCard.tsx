import React from 'react';
import { Clock, MapPin, Trash2, Sparkles } from 'lucide-react';
import { CalendarEvent, EventType } from '@/types/database.types';
import { formatEventTimeRange, calculateEventPosition } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: CalendarEvent;
  onDelete?: (id: string) => void;
  styleMode?: 'absolute' | 'flow';
}

interface EventStyleTokens {
  bg: string;
  border: string;
  text: string;
  badge: string;
  dot: string;
}

const eventTypeStyles: Record<EventType, EventStyleTokens> = {
  class: {
    bg: 'bg-emerald-50/95 dark:bg-emerald-950/40',
    border: 'border-emerald-200/90 dark:border-emerald-800/60',
    text: 'text-emerald-950 dark:text-emerald-100',
    badge: 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
    dot: 'bg-emerald-500',
  },
  study: {
    bg: 'bg-purple-50/95 dark:bg-purple-950/40',
    border: 'border-purple-200/90 dark:border-purple-800/60',
    text: 'text-purple-950 dark:text-purple-100',
    badge: 'bg-purple-100/90 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200',
    dot: 'bg-purple-500',
  },
  exam: {
    bg: 'bg-rose-50/95 dark:bg-rose-950/40',
    border: 'border-rose-200/90 dark:border-rose-800/60',
    text: 'text-rose-950 dark:text-rose-100',
    badge: 'bg-rose-100/90 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
    dot: 'bg-rose-500',
  },
  project: {
    bg: 'bg-sky-50/95 dark:bg-sky-950/40',
    border: 'border-sky-200/90 dark:border-sky-800/60',
    text: 'text-sky-950 dark:text-sky-100',
    badge: 'bg-sky-100/90 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200',
    dot: 'bg-sky-500',
  },
  office_hours: {
    bg: 'bg-amber-50/95 dark:bg-amber-950/40',
    border: 'border-amber-200/90 dark:border-amber-800/60',
    text: 'text-amber-950 dark:text-amber-100',
    badge: 'bg-amber-100/90 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
    dot: 'bg-amber-500',
  },
};

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onDelete,
  styleMode = 'absolute',
}) => {
  const styles = eventTypeStyles[event.type] || eventTypeStyles.study;
  const timeLabel = formatEventTimeRange(event.start_time, event.end_time);
  const isAutoStudy = event.notes?.includes('Auto-placed');

  if (styleMode === 'flow') {
    return (
      <div
        className={cn(
          'group relative flex flex-col rounded-xl border p-3 transition-all hover:shadow-card',
          styles.bg,
          styles.border
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className={cn('h-2 w-2 rounded-full', styles.dot)} />
            <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase', styles.badge)}>
              {event.type}
            </span>
            {event.subject && (
              <span className="rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 shadow-2xs dark:bg-slate-800/80 dark:text-slate-300">
                {event.subject.code}
              </span>
            )}
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(event.id)}
              className="opacity-0 group-hover:opacity-100 transition p-1 text-slate-400 hover:text-rose-500"
              title="Delete event"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <h4 className={cn('mt-1.5 font-semibold text-xs truncate', styles.text)}>
          {event.title}
        </h4>

        <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeLabel}
          </span>
          {event.location && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3" />
              {event.location}
            </span>
          )}
        </div>
      </div>
    );
  }

  const { topPct, heightPct } = calculateEventPosition(event.start_time, event.end_time);

  return (
    <div
      style={{
        top: `${topPct}%`,
        height: `${heightPct}%`,
        minHeight: '38px',
      }}
      className={cn(
        'group absolute inset-x-1 z-10 flex flex-col justify-between overflow-hidden rounded-xl border p-2 transition-all hover:z-20 hover:shadow-card',
        styles.bg,
        styles.border
      )}
    >
      <div className="flex items-start justify-between gap-1 overflow-hidden">
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center gap-1.5">
            <span className={cn('h-1.5 w-1.5 flex-shrink-0 rounded-full', styles.dot)} />
            {event.subject && (
              <span className="text-[10px] font-bold tracking-tight text-slate-700 dark:text-slate-300">
                {event.subject.code}
              </span>
            )}
            {isAutoStudy && (
              <span className="flex items-center gap-0.5 text-[9px] font-semibold text-purple-600 dark:text-purple-400">
                <Sparkles className="h-2.5 w-2.5" />
                Auto
              </span>
            )}
          </div>
          <h5 className={cn('truncate text-xs font-semibold leading-tight mt-0.5', styles.text)}>
            {event.title}
          </h5>
        </div>

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(event.id);
            }}
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition p-0.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
            title="Delete event"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 leading-none pt-1">
        <span className="truncate">{timeLabel}</span>
        {event.location && (
          <span className="hidden xl:inline truncate max-w-[80px] text-right font-medium">
            {event.location}
          </span>
        )}
      </div>
    </div>
  );
};
