import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { ProjectItem, Subject } from '@/types/database.types';
import { mockProjects } from '@/lib/mockData';

const LOCAL_STORAGE_KEY = 'quicksuite_demo_projects';

export function useProjects(subjects: Subject[] = []) {
  const { user, isDemo } = useAuth();
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ['projects', user?.id, isDemo, subjects.length],
    queryFn: async (): Promise<ProjectItem[]> => {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      let items: ProjectItem[];
      if (cached) {
        try {
          items = JSON.parse(cached);
        } catch {
          items = mockProjects;
        }
      } else {
        items = mockProjects;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      }

      return items.map((proj) => ({
        ...proj,
        subject: subjects.find((s) => s.id === proj.subject_id),
      }));
    },
  });

  const addProjectMutation = useMutation({
    mutationFn: async (newProj: Omit<ProjectItem, 'id' | 'user_id' | 'created_at' | 'subject'>) => {
      const item: ProjectItem = {
        ...newProj,
        id: `proj-${Date.now()}`,
        user_id: user?.id || 'demo-student-uuid',
        created_at: new Date().toISOString(),
        subject: subjects.find((s) => s.id === newProj.subject_id),
      };
      const current = projectsQuery.data || [];
      const updated = [item, ...current];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const toggleMilestoneMutation = useMutation({
    mutationFn: async ({ projectId, milestoneId }: { projectId: string; milestoneId: string }) => {
      const current = projectsQuery.data || [];
      const updated = current.map((p) => {
        if (p.id !== projectId) return p;
        const newMilestones = p.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = newMilestones.filter((m) => m.completed).length;
        const progress = newMilestones.length > 0 ? Math.round((completedCount / newMilestones.length) * 100) : p.progress;
        return { ...p, milestones: newMilestones, progress };
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return { projectId, milestoneId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    addProject: addProjectMutation.mutateAsync,
    toggleMilestone: toggleMilestoneMutation.mutateAsync,
  };
}
