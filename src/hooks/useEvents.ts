import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { CalendarEvent, Subject } from '@/types/database.types';

const LOCAL_STORAGE_KEY = 'quicksuite_demo_events';

function getStoredEvents(): CalendarEvent[] {
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

function saveStoredEvents(events: CalendarEvent[]): void {
  const unhydrated = events.map(({ subject: _subject, ...rest }) => rest as CalendarEvent);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(unhydrated));
}

export function useEvents(subjects: Subject[] = []) {
  const { user, isDemo, isConfigured } = useAuth();
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ['events', user?.id, isDemo, subjects],
    queryFn: async (): Promise<CalendarEvent[]> => {
      if (isDemo || !isConfigured || !user) {
        const items = getStoredEvents();
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
        const current = getStoredEvents();
        saveStoredEvents([...current, item]);
        return item;
      }

      const { subject: _s, ...cleanEvent } = newEvent as any;
      const { data, error } = await supabase
        .from('events')
        .insert([{ ...cleanEvent, user_id: user.id }])
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
        const current = getStoredEvents();
        saveStoredEvents([...current, ...items]);
        return items;
      }

      const payload = newEvents.map(({ subject: _s, ...e }: any) => ({ ...e, user_id: user.id }));
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
        const current = getStoredEvents();
        const updated = current.filter((e) => e.id !== id);
        saveStoredEvents(updated);
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
