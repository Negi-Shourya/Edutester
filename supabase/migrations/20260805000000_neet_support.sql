-- NEET support: papers gain an exam_type, sessions become optional (NEET has
-- no shift), sections can be Biology/Botany/Zoology, questions may exist
-- without a subsection (NEET 2025+ has a single Biology section with no
-- Section A/B split), and option figures get their own url column.

-- 1. papers: exam_type + is_trial flag, relax session constraint.
alter table public.papers
  add column if not exists exam_type text not null default 'jee'
    check (exam_type in ('jee', 'neet')),
  add column if not exists is_trial boolean not null default false;

alter table public.papers drop constraint if exists papers_session_check;
alter table public.papers alter column session drop not null;
alter table public.papers
  add constraint papers_session_check check (session is null or session in ('morning', 'evening'));

-- 2. sections: allow NEET subjects and up to 4 sections (P/C/Botany/Zoology).
alter table public.sections drop constraint if exists sections_name_check;
alter table public.sections
  add constraint sections_name_check
  check (name in ('Physics', 'Chemistry', 'Mathematics', 'Biology', 'Botany', 'Zoology'));

alter table public.sections drop constraint if exists sections_position_check;
alter table public.sections
  add constraint sections_position_check check (position between 1 and 4);

-- 3. questions: subsection is optional (NEET 2025/2026).
alter table public.questions alter column subsection_id drop not null;

-- 4. question_options: per-option figure url (NEET options rendered as images).
alter table public.question_options
  add column if not exists figure_url text;
