import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Calendar,
  Users,
  CheckCircle2,
  Circle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ProjectItem, Subject } from '@/types/database.types';
import { cn } from '@/lib/utils';

interface ProjectsViewProps {
  projects: ProjectItem[];
  subjects: Subject[];
  onToggleMilestone: (projectId: string, milestoneId: string) => Promise<any>;
  onOpenAddProject: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  subjects,
  onToggleMilestone,
  onOpenAddProject,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Top Banner & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight dark:text-white">
            Academic Projects & Capstones
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track multi-week term papers, engineering group labs, and milestone deliverables
          </p>
        </div>

        <button
          onClick={onOpenAddProject}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((proj) => {
          const completedMilestones = proj.milestones.filter((m) => m.completed).length;

          return (
            <div
              key={proj.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs transition-all hover:shadow-card dark:border-slate-800 dark:bg-[#0F172A]"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    {proj.subject && (
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {proj.subject.code} · {proj.subject.name}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {proj.title}
                    </h3>
                  </div>

                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {proj.progress}%
                  </span>
                </div>

                {proj.description && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {proj.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1.5">
                    <span>Milestones Completed</span>
                    <span>
                      {completedMilestones} of {proj.milestones.length} Done
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      style={{ width: `${proj.progress}%` }}
                      className="h-full rounded-full bg-blue-600 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Milestones Checklist */}
                <div className="mt-5 space-y-2">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Sprint Milestones
                  </h4>
                  <div className="space-y-1.5">
                    {proj.milestones.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => onToggleMilestone(proj.id, m.id)}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 text-left text-xs transition hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-800"
                      >
                        <div className="flex items-center gap-2.5">
                          {m.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                          )}
                          <span
                            className={cn(
                              'font-medium',
                              m.completed
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-800 dark:text-slate-200'
                            )}
                          >
                            {m.title}
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-400">
                          {format(parseISO(m.due_date), 'MMM d')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer with Team & Deadline */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    {proj.team_members.map((member, i) => (
                      <div
                        key={i}
                        title={member}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-800 ring-2 ring-white dark:bg-blue-900 dark:text-blue-200 dark:ring-slate-900"
                      >
                        {member.split(' ').map((n) => n[0]).join('')}
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {proj.team_members.length} collaborators
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Due {format(parseISO(proj.due_date), 'MMMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
