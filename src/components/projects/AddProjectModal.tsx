import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { Subject, ProjectItem, ProjectMilestone } from '@/types/database.types';
import { useAuth } from '@/context/AuthContext';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onAddProject: (project: Omit<ProjectItem, 'id' | 'user_id' | 'created_at' | 'subject'>) => Promise<any>;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onAddProject,
}) => {
  const { profile } = useAuth();
  const studentName = profile?.full_name || 'Alex River';
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [teamMembersInput, setTeamMembersInput] = useState(studentName);

  useEffect(() => {
    if (isOpen) {
      setTeamMembersInput(profile?.full_name || 'Alex River');
    }
  }, [isOpen, profile]);
  const [milestones, setMilestones] = useState<{ title: string; due_date: string }[]>([
    { title: 'Project Proposal & Architecture Spec', due_date: format(addDays(new Date(), 7), 'yyyy-MM-dd') },
    { title: 'Alpha Release Prototype', due_date: format(addDays(new Date(), 20), 'yyyy-MM-dd') },
  ]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState(format(addDays(new Date(), 14), 'yyyy-MM-dd'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    setMilestones([...milestones, { title: newMilestoneTitle.trim(), due_date: newMilestoneDate }]);
    setNewMilestoneTitle('');
  };

  const handleRemoveMilestone = (idx: number) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const team = teamMembersInput
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);

      const formattedMilestones: ProjectMilestone[] = milestones.map((m, i) => {
        const parsedMDate = new Date(m.due_date);
        return {
          id: `m-${Date.now()}-${i}`,
          title: m.title,
          due_date: !isNaN(parsedMDate.getTime()) ? parsedMDate.toISOString() : new Date().toISOString(),
          completed: false,
        };
      });

      const parsedDueDate = new Date(dueDate);
      const isoDueDate = !isNaN(parsedDueDate.getTime()) ? parsedDueDate.toISOString() : new Date().toISOString();

      await onAddProject({
        title: title.trim(),
        subject_id: subjectId || undefined,
        description: description.trim() || undefined,
        progress: 0,
        due_date: isoDueDate,
        team_members: team.length > 0 ? team : [studentName],
        milestones: formattedMilestones,
      });

      onClose();
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Create Semester Project
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set up milestone schedules and team members
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Key-Value Store"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Subject Course
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">None (Independent)</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}: {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Final Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Team Members (comma-separated)
            </label>
            <input
              type="text"
              placeholder="Alex River, Liam Chen, Maya Patel"
              value={teamMembersInput}
              onChange={(e) => setTeamMembersInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description / Scope
            </label>
            <textarea
              rows={2}
              placeholder="High-level objectives and technical deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Milestones ({milestones.length})
            </label>

            <div className="space-y-2 max-h-36 overflow-y-auto">
              {milestones.map((m, idx) => (
                <div
                  key={`${m.title}-${idx}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">{m.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">{m.due_date}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="New milestone title..."
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <input
                  type="date"
                  value={newMilestoneDate}
                  onChange={(e) => setNewMilestoneDate(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
