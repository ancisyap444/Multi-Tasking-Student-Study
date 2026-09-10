import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { ProjectItem, Subject } from '@/types/database.types';

const LOCAL_STORAGE_KEY = 'quicksuite_projects';

function getStoredProjects(): ProjectItem[] {
  if (localStorage.getItem('quicksuite_demo_projects')) {
    localStorage.removeItem('quicksuite_demo_projects');
  }

  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      return [];
    }
  }
  return [];
}

function saveStoredProjects(projects: ProjectItem[]): void {
  const unhydrated = projects.map(({ subject: _subject, ...rest }) => rest as ProjectItem);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(unhydrated));
}

export function useProjects(subjects: Subject[] = []) {
  const { user, isDemo } = useAuth();
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ['projects', user?.id, isDemo, subjects],
    queryFn: async (): Promise<ProjectItem[]> => {
      const items = getStoredProjects();
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
      const current = getStoredProjects();
      saveStoredProjects([item, ...current]);
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const toggleMilestoneMutation = useMutation({
    mutationFn: async ({ projectId, milestoneId }: { projectId: string; milestoneId: string }) => {
      const current = getStoredProjects();
      const updated = current.map((p) => {
        if (p.id !== projectId) return p;
        const newMilestones = p.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = newMilestones.filter((m) => m.completed).length;
        const progress = newMilestones.length > 0 ? Math.round((completedCount / newMilestones.length) * 100) : p.progress;
        return { ...p, milestones: newMilestones, progress };
      });
      saveStoredProjects(updated);
      return { projectId, milestoneId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const current = getStoredProjects();
      const updated = current.filter((p) => p.id !== projectId);
      saveStoredProjects(updated);
      return projectId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    addProject: addProjectMutation.mutateAsync,
    deleteProject: deleteProjectMutation.mutateAsync,
    toggleMilestone: toggleMilestoneMutation.mutateAsync,
  };
}
