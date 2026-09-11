import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Clock, CheckSquare, Sparkles } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { TaskItem, TaskStatus, TaskPriority } from '@/types/database.types';
import { getDeadlineCountdown } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

interface TaskKanbanProps {
  tasks: TaskItem[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onSelectTask: (task: TaskItem) => void;
  onOpenAutoScheduleForTask?: (task: TaskItem) => void;
}

const COLUMNS: { id: TaskStatus; label: string; bg: string; dot: string }[] = [
  { id: 'todo', label: 'To Do', bg: 'bg-slate-100 dark:bg-slate-800/60', dot: 'bg-slate-400' },
  { id: 'in_progress', label: 'In Progress', bg: 'bg-blue-50/70 dark:bg-blue-950/30', dot: 'bg-blue-500' },
  { id: 'done', label: 'Submitted / Done', bg: 'bg-emerald-50/70 dark:bg-emerald-950/30', dot: 'bg-emerald-500' },
];

const priorityStyles: Record<TaskPriority, { text: string; bg: string }> = {
  urgent: { text: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:border-rose-900/60' },
  high: { text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-900/60' },
  medium: { text: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-900/60' },
  low: { text: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700' },
};

export const TaskKanban: React.FC<TaskKanbanProps> = ({
  tasks,
  onStatusChange,
  onSelectTask,
  onOpenAutoScheduleForTask,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      onStatusChange(taskId, newStatus);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-3 sm:p-6">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <DroppableColumn
              key={col.id}
              column={col}
              tasks={colTasks}
              onSelectTask={onSelectTask}
              onOpenAutoScheduleForTask={onOpenAutoScheduleForTask}
            />
          );
        })}
      </div>
    </DndContext>
  );
};

interface DroppableColumnProps {
  column: { id: TaskStatus; label: string; bg: string; dot: string };
  tasks: TaskItem[];
  onSelectTask: (task: TaskItem) => void;
  onOpenAutoScheduleForTask?: (task: TaskItem) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  column,
  tasks,
  onSelectTask,
  onOpenAutoScheduleForTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all dark:border-slate-800 dark:bg-[#0B0F19]/40',
        isOver && 'ring-2 ring-blue-500/40 border-blue-300'
      )}
    >
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <span className={cn('h-2.5 w-2.5 rounded-full', column.dot)} />
          <h3 className="text-xs font-bold tracking-wider text-slate-800 uppercase dark:text-slate-200">
            {column.label}
          </h3>
        </div>
        <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto min-h-[400px]">
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            onSelect={() => onSelectTask(task)}
            onAutoSchedule={() => onOpenAutoScheduleForTask?.(task)}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-slate-800">
            Drag tasks here
          </div>
        )}
      </div>
    </div>
  );
};

interface DraggableTaskCardProps {
  task: TaskItem;
  onSelect: () => void;
  onAutoSchedule: () => void;
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
  task,
  onSelect,
  onAutoSchedule,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const isOverdue = task.due_at && isPast(parseISO(task.due_at)) && task.status !== 'done';
  const countdown = getDeadlineCountdown(task.due_at);
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const priorityInfo = priorityStyles[task.priority] || priorityStyles.medium;

  const style: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onSelect}
      className="group relative cursor-grab active:cursor-grabbing rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-card dark:border-slate-800 dark:bg-[#0F172A] dark:hover:border-slate-700"
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.subject && (
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              {task.subject.code}
            </span>
          )}
          <span
            className={cn(
              'rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              priorityInfo.bg,
              priorityInfo.text
            )}
          >
            {task.priority}
          </span>
        </div>

        {task.status !== 'done' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAutoSchedule();
            }}
            title="Auto-schedule study sessions for this task"
            className="opacity-0 group-hover:opacity-100 transition rounded-md p-1 text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <h4 className="mt-2 text-xs font-semibold text-slate-900 leading-snug line-clamp-2 dark:text-white">
        {task.title}
      </h4>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 pt-2 dark:border-slate-850">
        {task.due_at ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold',
              countdown.badgeClass
            )}
          >
            <Clock className="h-2.5 w-2.5" />
            {countdown.label}
          </span>
        ) : (
          <span className="text-slate-400">No deadline</span>
        )}

        <div className="flex items-center gap-3">
          {totalSubtasks > 0 && (
            <span className="flex items-center gap-1">
              <CheckSquare className="h-3 w-3 text-slate-400" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </span>
          )}
          {task.estimated_hours && (
            <span className="font-medium">{task.estimated_hours}h</span>
          )}
        </div>
      </div>
    </div>
  );
};
