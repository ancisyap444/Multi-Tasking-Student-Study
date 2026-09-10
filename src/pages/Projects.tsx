import React, { useState } from 'react';
import { ProjectsView } from '@/components/projects/ProjectsView';
import { AddProjectModal } from '@/components/projects/AddProjectModal';
import { useProjects } from '@/hooks/useProjects';
import { Subject } from '@/types/database.types';

interface ProjectsPageProps {
  subjects: Subject[];
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ subjects }) => {
  const { projects, addProject, deleteProject, toggleMilestone } = useProjects(subjects);
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-[#F8FAFC] dark:bg-[#0B0F19]">
      <ProjectsView
        projects={projects}
        subjects={subjects}
        onToggleMilestone={(projectId, milestoneId) =>
          toggleMilestone({ projectId, milestoneId })
        }
        onDeleteProject={(projectId) => deleteProject(projectId)}
        onOpenAddProject={() => setIsAddOpen(true)}
      />

      <AddProjectModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        subjects={subjects}
        onAddProject={addProject}
      />
    </div>
  );
};
