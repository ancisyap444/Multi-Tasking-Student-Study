import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { TaskItem, TaskStatus, Subject } from '@/types/database.types';
import { mockTasks } from '@/lib/mockData';

const LOCAL_STORAGE_KEY = 'quicksuite_demo_tasks';

export function useTasks(subjects: Subject[] = []) {
  const { user, isDemo, isConfigured } = useAuth();
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['tasks', user?.id, isDemo, subjects.length],
    queryFn: async (): Promise<TaskItem[]> => {
      if (isDemo || !isConfigured || !user) {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        let items: TaskItem[];
        if (cached) {
          try {
            items = JSON.parse(cached);
          } catch {
            items = mockTasks;
          }
        } else {
          items = mockTasks;
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
        }

        return items.map((task) => ({
          ...task,
          subject: subjects.find((s) => s.id === task.subject_id),
        }));
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*, subject:subjects(*)')
        .order('due_at', { ascending: true });

      if (error) throw error;
      return (data || []) as TaskItem[];
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: async (newTask: Omit<TaskItem, 'id' | 'user_id' | 'created_at' | 'subject'>) => {
      if (isDemo || !isConfigured || !user) {
        const item: TaskItem = {
          ...newTask,
          id: `tsk-${Date.now()}`,
          user_id: user?.id || 'demo-student-uuid',
          created_at: new Date().toISOString(),
          subject: subjects.find((s) => s.id === newTask.subject_id),
        };
        const current = tasksQuery.data || [];
        const updated = [item, ...current];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return item;
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...newTask, user_id: user.id }])
        .select('*, subject:subjects(*)')
        .single();

      if (error) throw error;
      return data as TaskItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      if (isDemo || !isConfigured || !user) {
        const current = tasksQuery.data || [];
        const updated = current.map((t) => (t.id === id ? { ...t, status } : t));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return { id, status };
      }

      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TaskItem> }) => {
      if (isDemo || !isConfigured || !user) {
        const current = tasksQuery.data || [];
        const updated = current.map((t) => (t.id === id ? { ...t, ...updates } : t));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return { id, updates };
      }

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return { id, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isDemo || !isConfigured || !user) {
        const current = tasksQuery.data || [];
        const updated = current.filter((t) => t.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return id;
      }

      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    addTask: addTaskMutation.mutateAsync,
    updateTaskStatus: updateTaskStatusMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
  };
}
