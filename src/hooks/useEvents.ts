import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { CalendarEvent, Subject } from '@/types/database.types';
import { generateMockEvents } from '@/lib/mockData';

const LOCAL_STORAGE_KEY = 'quicksuite_demo_events';

export function useEvents(subjects: Subject[] = []) {
  const { user, isDemo, isConfigured } = useAuth();
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ['events', user?.id, isDemo, subjects.length],
    queryFn: async (): Promise<CalendarEvent[]> => {
      if (isDemo || !isConfigured || !user) {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        let items: CalendarEvent[];
        if (cached) {
          try {
            items = JSON.parse(cached);
          } catch {
            items = generateMockEvents(subjects);
          }
        } else {
          items = generateMockEvents(subjects);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
        }

        return items.map((evt) => ({
          ...evt,
          subject: subjects.find((s) => s.id === evt.subject_id),
        }));
      }

      const { data, error } = await supabase
        .from('events')
        .select('*, subject:subjects(*)')
        .order('start_time', { ascending: true });

      if (error) throw error;
      return (data || []) as CalendarEvent[];
    },
  });

  const addEventMutation = useMutation({
    mutationFn: async (newEvent: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'subject'>) => {
      if (isDemo || !isConfigured || !user) {
        const item: CalendarEvent = {
          ...newEvent,
          id: `evt-${Date.now()}`,
          user_id: user?.id || 'demo-student-uuid',
          created_at: new Date().toISOString(),
          subject: subjects.find((s) => s.id === newEvent.subject_id),
        };
        const current = eventsQuery.data || [];
        const updated = [...current, item];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return item;
      }

      const { data, error } = await supabase
        .from('events')
        .insert([{ ...newEvent, user_id: user.id }])
        .select('*, subject:subjects(*)')
        .single();

      if (error) throw error;
      return data as CalendarEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const addMultipleEventsMutation = useMutation({
    mutationFn: async (newEvents: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'subject'>[]) => {
      if (isDemo || !isConfigured || !user) {
        const items: CalendarEvent[] = newEvents.map((evt, idx) => ({
          ...evt,
          id: `evt-${Date.now()}-${idx}`,
          user_id: user?.id || 'demo-student-uuid',
          created_at: new Date().toISOString(),
          subject: subjects.find((s) => s.id === evt.subject_id),
        }));
        const current = eventsQuery.data || [];
        const updated = [...current, ...items];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return items;
      }

      const payload = newEvents.map((e) => ({ ...e, user_id: user.id }));
      const { data, error } = await supabase
        .from('events')
        .insert(payload)
        .select('*, subject:subjects(*)');

      if (error) throw error;
      return (data || []) as CalendarEvent[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isDemo || !isConfigured || !user) {
        const current = eventsQuery.data || [];
        const updated = current.filter((e) => e.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return id;
      }

      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    addEvent: addEventMutation.mutateAsync,
    addMultipleEvents: addMultipleEventsMutation.mutateAsync,
    deleteEvent: deleteEventMutation.mutateAsync,
  };
}
