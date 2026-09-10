-- ==============================================================================
-- Multi-Tasking Student Study Ops — Complete Supabase PostgreSQL Schema & Security Policies
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. PROFILES TABLE (linked to Supabase Auth users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  program text default 'BS Computer Science',
  year text check (year in ('Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate')) default 'Sophomore',
  avatar_url text,
  target_study_hours_week numeric default 25,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. SUBJECTS TABLE (Academic courses)
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  code text not null,
  color text default 'mint', -- mint, lavender, amber, sky, rose
  instructor text,
  location text,
  meeting_schedule jsonb default '[]'::jsonb, -- e.g. [{"day":"MON","start":"10:00","end":"11:30"}]
  created_at timestamptz default now()
);

-- 3. EVENTS TABLE (Timetable lectures, study blocks, exams, meetings)
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  subject_id uuid references public.subjects on delete cascade,
  title text not null,
  type text check (type in ('class', 'study', 'exam', 'project', 'office_hours')) not null default 'study',
  start_time timestamptz not null,
  end_time timestamptz not null,
  location text,
  notes text,
  is_recurring boolean default false,
  related_task_id uuid,
  created_at timestamptz default now()
);

-- 4. TASKS TABLE (Assignments, homework, readings, exam prep)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  subject_id uuid references public.subjects on delete cascade,
  title text not null,
  notes text,
  due_at timestamptz,
  priority text check (priority in ('urgent', 'high', 'medium', 'low')) default 'medium',
  status text check (status in ('todo', 'in_progress', 'done')) default 'todo',
  task_type text check (task_type in ('homework', 'reading', 'exam_prep', 'project', 'lab')) default 'homework',
  estimated_hours numeric default 2,
  subtasks jsonb default '[]'::jsonb, -- e.g. [{"id":"1","title":"Read ch 4","completed":false}]
  created_at timestamptz default now()
);

-- 5. DOCUMENTS TABLE (Syllabi, slide decks, project assets)
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  subject_id uuid references public.subjects on delete cascade,
  title text not null,
  file_path text not null,
  file_size bigint,
  file_type text,
  category text check (category in ('syllabus', 'slides', 'notes', 'project', 'cheatsheet')) default 'notes',
  created_at timestamptz default now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Each student can only ever view and edit their own private academic data
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.events enable row level security;
alter table public.tasks enable row level security;
alter table public.documents enable row level security;

-- Profiles Policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- Subjects Policies
create policy "Users manage their own subjects"
  on public.subjects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Events Policies
create policy "Users manage their own events"
  on public.events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Tasks Policies
create policy "Users manage their own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Documents Policies
create policy "Users manage their own documents"
  on public.documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, program, year)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'program', 'BS Computer Science'),
    coalesce(new.raw_user_meta_data->>'year', 'Sophomore')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if already exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION FOR DOCUMENTS
-- ==============================================================================

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Students can upload their own documents"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Students can read their own documents"
  on storage.objects for select
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Students can delete their own documents"
  on storage.objects for delete
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
