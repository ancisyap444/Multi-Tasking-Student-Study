import { TaskItem } from '@/types/database.types';

export interface SubjectMetric {
  subjectId: string;
  grade?: string;
  targetGrade?: string;
  attendedClasses?: number;
  totalClasses?: number;
  attendancePct?: number;
  notes?: string;
}

const STORAGE_KEY = 'quicksuite_subject_metrics';

export function getAllSubjectMetrics(): Record<string, SubjectMetric> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getSubjectMetric(subjectId: string): SubjectMetric {
  const all = getAllSubjectMetrics();
  return all[subjectId] || { subjectId, attendancePct: 100, attendedClasses: 0, totalClasses: 0 };
}

export function saveSubjectMetric(subjectId: string, updates: Partial<SubjectMetric>): SubjectMetric {
  const all = getAllSubjectMetrics();
  const existing = all[subjectId] || { subjectId };

  let attendancePct = updates.attendancePct !== undefined ? updates.attendancePct : existing.attendancePct;
  if (updates.attendedClasses !== undefined && updates.totalClasses !== undefined && updates.totalClasses > 0) {
    attendancePct = Math.min(100, Math.round((updates.attendedClasses / updates.totalClasses) * 100));
  }

  const updated: SubjectMetric = {
    ...existing,
    ...updates,
    attendancePct: attendancePct ?? 100,
  };

  all[subjectId] = updated;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save subject metric:', err);
  }

  return updated;
}

export function computeSubjectTaskProgress(subjectId: string, tasks: TaskItem[]): {
  total: number;
  completed: number;
  percentage: number;
} {
  const subjectTasks = tasks.filter((t) => t.subject_id === subjectId);
  const total = subjectTasks.length;
  if (total === 0) return { total: 0, completed: 0, percentage: 0 };

  const completed = subjectTasks.filter((t) => t.status === 'done').length;
  const percentage = Math.round((completed / total) * 100);
  return { total, completed, percentage };
}
