export type SubjectColor = 'mint' | 'lavender' | 'amber' | 'sky' | 'rose';

export type EventType = 'class' | 'study' | 'exam' | 'project' | 'office_hours';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type TaskType = 'homework' | 'reading' | 'exam_prep' | 'project' | 'lab';

export type AcademicYear = 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate';

export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface MeetingTime {
  day: DayOfWeek;
  start: string; // "10:00" (24h)
  end: string;   // "11:30" (24h)
}

export interface StudentProfile {
  id: string;
  full_name: string;
  program: string;
  year: AcademicYear;
  avatar_url?: string;
  target_study_hours_week: number;
  created_at?: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  code: string;
  color: SubjectColor;
  instructor?: string;
  location?: string;
  meeting_schedule: MeetingTime[];
  created_at?: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  subject_id?: string;
  title: string;
  type: EventType;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  location?: string;
  notes?: string;
  is_recurring?: boolean;
  related_task_id?: string;
  created_at?: string;
  // Hydrated subject details for rendering convenience
  subject?: Subject;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  user_id: string;
  subject_id?: string;
  title: string;
  notes?: string;
  due_at?: string; // ISO string
  priority: TaskPriority;
  status: TaskStatus;
  task_type: TaskType;
  estimated_hours: number;
  subtasks: Subtask[];
  created_at?: string;
  // Hydrated subject details
  subject?: Subject;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  due_date: string;
  completed: boolean;
}

export interface ProjectItem {
  id: string;
  user_id: string;
  subject_id?: string;
  title: string;
  description?: string;
  progress: number; // 0 - 100
  due_date: string;
  team_members: string[];
  milestones: ProjectMilestone[];
  created_at?: string;
  subject?: Subject;
}

export interface DocumentItem {
  id: string;
  user_id: string;
  subject_id?: string;
  title: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  category: 'syllabus' | 'slides' | 'notes' | 'project' | 'cheatsheet';
  created_at: string;
  subject?: Subject;
}
