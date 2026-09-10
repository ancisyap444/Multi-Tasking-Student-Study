import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Subject } from '@/types/database.types';

const LOCAL_STORAGE_KEY = 'quicksuite_demo_subjects';

function getStoredSubjects(): Subject[] {
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      return [];
    }
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
  return [];
}

function saveStoredSubjects(subjects: Subject[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(subjects));
}

export function useSubjects() {
  const { user, isDemo, isConfigured } = useAuth();
  const queryClient = useQueryClient();

  const subjectsQuery = useQuery({
    queryKey: ['subjects', user?.id, isDemo],
    queryFn: async (): Promise<Subject[]> => {
      if (isDemo || !isConfigured || !user) {
        return getStoredSubjects();
      }

      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as Subject[];
    },
  });

  const addSubjectMutation = useMutation({
    mutationFn: async (newSubject: Omit<Subject, 'id' | 'user_id' | 'created_at'>) => {
      if (isDemo || !isConfigured || !user) {
        const item: Subject = {
          ...newSubject,
          id: `sub-${Date.now()}`,
          user_id: user?.id || 'demo-student-uuid',
          created_at: new Date().toISOString(),
        };
        const current = getStoredSubjects();
        saveStoredSubjects([...current, item]);
        return item;
      }

      const { data, error } = await supabase
        .from('subjects')
        .insert([{ ...newSubject, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data as Subject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isDemo || !isConfigured || !user) {
        const current = getStoredSubjects();
        const updated = current.filter((s) => s.id !== id);
        saveStoredSubjects(updated);
        return id;
      }

      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    subjects: subjectsQuery.data || [],
    isLoading: subjectsQuery.isLoading,
    error: subjectsQuery.error,
    addSubject: addSubjectMutation.mutateAsync,
    deleteSubject: deleteSubjectMutation.mutateAsync,
  };
}
