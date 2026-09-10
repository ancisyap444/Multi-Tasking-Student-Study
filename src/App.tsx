import React, { useState, useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Sidebar, NavTab } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { SettingsModal, SettingsTabKey } from '@/components/layout/SettingsModal';
import { GlobalSearchModal } from '@/components/layout/GlobalSearchModal';
import { AddSubjectModal } from '@/components/subjects/AddSubjectModal';

import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { Dashboard } from '@/pages/Dashboard';
import { CalendarPage } from '@/pages/Calendar';
import { TasksPage } from '@/pages/Tasks';
import { ProjectsPage } from '@/pages/Projects';
import { DocumentsPage } from '@/pages/Documents';

import { useSubjects } from '@/hooks/useSubjects';
import { useEvents } from '@/hooks/useEvents';
import { useTasks } from '@/hooks/useTasks';
import { useDocuments } from '@/hooks/useDocuments';
import { Subject, MeetingTime, CalendarEvent, TaskItem, TaskStatus } from '@/types/database.types';
import { generateAutoStudyBlocks } from '@/utils/studyBlockScheduler';
import { getWeekDays } from '@/utils/dateUtils';
import { setHours, setMinutes } from 'date-fns';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

type AuthView = 'login' | 'signup' | 'forgot_password';

function runOneTimeMigrations() {
  if (localStorage.getItem('quicksuite_migrated_v2')) return;
  ['quicksuite_demo_subjects', 'quicksuite_demo_tasks', 'quicksuite_demo_documents', 'quicksuite_demo_events', 'quicksuite_demo_projects', 'quicksuite_projects'].forEach((key) =>
    localStorage.removeItem(key)
  );
  localStorage.setItem('quicksuite_migrated_v2', 'true');
}

runOneTimeMigrations();

export const MainLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('login');

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTabKey>('appearance');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAutoScheduleOpen, setIsAutoScheduleOpen] = useState(false);

  const handleOpenSettings = (tab: SettingsTabKey = 'appearance') => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  const { subjects, addSubject, deleteSubject } = useSubjects();
  const { events, addEvent, addMultipleEvents, deleteEvent } = useEvents(subjects);
  const { tasks, addTask, updateTaskStatus, updateTask, deleteTask } = useTasks(subjects);
  const { documents } = useDocuments(subjects);

  const activeTaskCount = tasks.filter((t) => t.status !== 'done').length;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsSearchOpen(false);
        setIsAddSubjectOpen(false);
        setIsAddEventOpen(false);
        setIsAddTaskOpen(false);
        setIsAutoScheduleOpen(false);
        return;
      }

      const target = e.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === '1')) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      if (!isInput && !e.ctrlKey && !e.metaKey && !e.altKey && user) {
        if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          setIsAddEventOpen(true);
        } else if (e.key === 't' || e.key === 'T') {
          e.preventDefault();
          setIsAddTaskOpen(true);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  const handleAddRecurringClasses = useCallback(
    async (newSubject: Subject, schedules: MeetingTime[]) => {
      const weekDays = getWeekDays(new Date());
      const dayMap: Record<string, number> = {
        MON: 0,
        TUE: 1,
        WED: 2,
        THU: 3,
        FRI: 4,
        SAT: 5,
        SUN: 6,
      };

      const generatedEvents: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'subject'>[] = [];

      for (const item of schedules) {
        const dayIdx = dayMap[item.day];
        if (dayIdx !== undefined && weekDays[dayIdx]) {
          const targetDay = weekDays[dayIdx];
          const [startH, startM] = item.start.split(':').map(Number);
          const [endH, endM] = item.end.split(':').map(Number);

          if (!isNaN(startH) && !isNaN(startM) && !isNaN(endH) && !isNaN(endM)) {
            const startIso = setMinutes(setHours(targetDay, startH), startM).toISOString();
            const endIso = setMinutes(setHours(targetDay, endH), endM).toISOString();

            generatedEvents.push({
              title: `${newSubject.code}: Lecture`,
              type: 'class',
              subject_id: newSubject.id,
              start_time: startIso,
              end_time: endIso,
              location: newSubject.location,
              is_recurring: true,
            });
          }
        }
      }

      if (generatedEvents.length > 0) {
        await addMultipleEvents(generatedEvents);
      }
    },
    [addMultipleEvents]
  );

  const handleAddTaskWithAutoSchedule = async (
    newTaskData: Omit<TaskItem, 'id' | 'user_id' | 'created_at' | 'subject'>,
    autoSchedule: boolean
  ) => {
    const createdTask = await addTask(newTaskData);

    if (autoSchedule && createdTask && createdTask.due_at) {
      const proposed = generateAutoStudyBlocks(createdTask, events, 90);
      if (proposed.length > 0) {
        const studyEvents = proposed.map((p) => ({
          title: p.title,
          type: 'study' as const,
          subject_id: p.subject_id,
          start_time: p.start_time,
          end_time: p.end_time,
          notes: 'Auto-placed for task: ' + createdTask.title,
          related_task_id: createdTask.id,
        }));
        await addMultipleEvents(studyEvents);
      }
    }
  };

  const handleToggleTaskStatus = async (task: TaskItem) => {
    const nextStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTaskStatus({ id: task.id, status: nextStatus });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          <span className="text-xs font-semibold text-slate-500">
            Initializing Multi-Tasking...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authView === 'signup') {
      return <Signup onGoToLogin={() => setAuthView('login')} />;
    }
    if (authView === 'forgot_password') {
      return <ForgotPassword onGoToLogin={() => setAuthView('login')} />;
    }
    return (
      <Login
        onGoToSignup={() => setAuthView('signup')}
        onGoToForgotPassword={() => setAuthView('forgot_password')}
      />
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC] dark:bg-[#0B0F19]">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        subjects={subjects}
        selectedSubjectFilter={selectedSubjectFilter}
        onSelectSubjectFilter={setSelectedSubjectFilter}
        onOpenAddSubject={() => setIsAddSubjectOpen(true)}
        onDeleteSubject={deleteSubject}
        onOpenSettings={handleOpenSettings}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeTaskCount={activeTaskCount}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenCreateEvent={() => setIsAddEventOpen(true)}
          onOpenSettings={handleOpenSettings}
          onGoToDashboard={() => setCurrentTab('dashboard')}
        />

        <main className="flex flex-1 overflow-hidden">
          {currentTab === 'dashboard' && (
            <Dashboard
              events={events}
              tasks={tasks}
              subjects={subjects}
              onToggleTask={handleToggleTaskStatus}
              onNavigate={setCurrentTab}
              onOpenAddSubject={() => setIsAddSubjectOpen(true)}
              onOpenAddTask={() => setIsAddTaskOpen(true)}
              onOpenAutoSchedule={() => setIsAutoScheduleOpen(true)}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarPage
              events={events}
              subjects={subjects}
              tasks={tasks}
              selectedSubjectFilter={selectedSubjectFilter}
              onAddEvent={addEvent}
              onAddMultipleEvents={addMultipleEvents}
              onDeleteEvent={deleteEvent}
              isAddEventOpen={isAddEventOpen}
              onOpenAddEvent={() => setIsAddEventOpen(true)}
              onCloseAddEvent={() => setIsAddEventOpen(false)}
              isAutoScheduleOpen={isAutoScheduleOpen}
              onOpenAutoSchedule={() => setIsAutoScheduleOpen(true)}
              onCloseAutoSchedule={() => setIsAutoScheduleOpen(false)}
            />
          )}

          {currentTab === 'tasks' && (
            <TasksPage
              tasks={tasks}
              subjects={subjects}
              events={events}
              selectedSubjectFilter={selectedSubjectFilter}
              onAddTask={handleAddTaskWithAutoSchedule}
              onUpdateTaskStatus={async (id, status) => {
                await updateTaskStatus({ id, status });
              }}
              onUpdateTask={async (id, updates) => {
                await updateTask({ id, updates });
              }}
              onDeleteTask={deleteTask}
              onAddMultipleEvents={addMultipleEvents}
              isAddTaskOpen={isAddTaskOpen}
              onOpenAddTask={() => setIsAddTaskOpen(true)}
              onCloseAddTask={() => setIsAddTaskOpen(false)}
            />
          )}

          {currentTab === 'projects' && <ProjectsPage subjects={subjects} />}

          {currentTab === 'documents' && <DocumentsPage subjects={subjects} />}
        </main>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsTab}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        subjects={subjects}
        tasks={tasks}
        documents={documents}
        onNavigate={setCurrentTab}
      />

      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onAddSubject={addSubject}
        onAddRecurringClasses={handleAddRecurringClasses}
      />
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
