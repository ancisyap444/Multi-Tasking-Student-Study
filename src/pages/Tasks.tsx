import React, { useState } from 'react';
import {
  Kanban,
  List,
  Plus,
  Filter,
  CheckSquare,
  Search,
  Sparkles,
} from 'lucide-react';
import { TaskKanban } from '@/components/tasks/TaskKanban';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskDetailDrawer } from '@/components/tasks/TaskDetailDrawer';
import { AddTaskModal } from '@/components/tasks/AddTaskModal';
import { AutoStudyModal } from '@/components/calendar/AutoStudyModal';
import { TaskItem, TaskStatus, Subject, CalendarEvent, TaskPriority } from '@/types/database.types';
import { cn } from '@/lib/utils';

type ViewMode = 'kanban' | 'list';

interface TasksPageProps {
  tasks: TaskItem[];
  subjects: Subject[];
  events: CalendarEvent[];
  selectedSubjectFilter: string | null;
  onAddTask: (
    task: Omit<TaskItem, 'id' | 'user_id' | 'created_at' | 'subject'>,
    autoSchedule: boolean
  ) => Promise<any>;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => Promise<any>;
  onUpdateTask: (id: string, updates: Partial<TaskItem>) => Promise<any>;
  onDeleteTask: (id: string) => Promise<any>;
  onAddMultipleEvents: (
    events: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'subject'>[]
  ) => Promise<any>;
  isAddTaskOpen: boolean;
  onOpenAddTask: () => void;
  onCloseAddTask: () => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  tasks,
  subjects,
  events,
  selectedSubjectFilter,
  onAddTask,
  onUpdateTaskStatus,
  onUpdateTask,
  onDeleteTask,
  onAddMultipleEvents,
  isAddTaskOpen,
  onOpenAddTask,
  onCloseAddTask,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');
  const [autoScheduleTargetTask, setAutoScheduleTargetTask] = useState<TaskItem | null>(null);
  const [isAutoScheduleOpen, setIsAutoScheduleOpen] = useState(false);

  // Filter tasks based on subject filter, priority, and search
  const filteredTasks = tasks.filter((t) => {
    const matchSubject = !selectedSubjectFilter || t.subject_id === selectedSubjectFilter;
    const matchPriority = selectedPriority === 'all' || t.priority === selectedPriority;
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchPriority && matchSearch;
  });

  const handleOpenTask = (task: TaskItem) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const handleToggleTaskComplete = (task: TaskItem) => {
    const nextStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    onUpdateTaskStatus(task.id, nextStatus);
  };

  const handleTriggerAutoSchedule = (task: TaskItem) => {
    setAutoScheduleTargetTask(task);
    setIsAutoScheduleOpen(true);
  };

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-[#F8FAFC] dark:bg-[#0B0F19]">
      {/* Top Toolbar */}
      <div className="flex flex-col gap-3 border-b border-slate-200/80 bg-white/60 p-4 backdrop-blur-xs md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-[#0F172A]/60">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Assignments & Tasks ({filteredTasks.length})
          </h2>

          {/* Dual View Mode Toggle */}
          <div className="flex rounded-xl border border-slate-200 bg-slate-100/70 p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition',
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              )}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition',
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              )}
            >
              <List className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>

        {/* Search & Priority Filter & Add CTA */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-44 rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-1">
            {(['all', 'urgent', 'high'] as (TaskPriority | 'all')[]).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={cn(
                  'capitalize rounded-xl px-2.5 py-1 text-xs font-medium transition',
                  selectedPriority === p
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenAddTask}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'kanban' ? (
          <TaskKanban
            tasks={filteredTasks}
            onStatusChange={onUpdateTaskStatus}
            onSelectTask={handleOpenTask}
            onOpenAutoScheduleForTask={handleTriggerAutoSchedule}
          />
        ) : (
          <TaskList
            tasks={filteredTasks}
            onToggleComplete={handleToggleTaskComplete}
            onSelectTask={handleOpenTask}
            onDeleteTask={onDeleteTask}
            onAutoScheduleTask={handleTriggerAutoSchedule}
          />
        )}
      </div>

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTask(null);
        }}
        subjects={subjects}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        onAutoSchedule={handleTriggerAutoSchedule}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={onCloseAddTask}
        subjects={subjects}
        onAddTask={onAddTask}
      />

      {/* Auto-Schedule Modal */}
      <AutoStudyModal
        isOpen={isAutoScheduleOpen}
        onClose={() => {
          setIsAutoScheduleOpen(false);
          setAutoScheduleTargetTask(null);
        }}
        tasks={autoScheduleTargetTask ? [autoScheduleTargetTask] : tasks}
        events={events}
        onAddMultipleEvents={onAddMultipleEvents}
      />
    </div>
  );
};
