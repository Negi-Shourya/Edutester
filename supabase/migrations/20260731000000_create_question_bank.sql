-- Question bank schema: JEE papers, sections, questions, options and figures.
-- Papers are the top-level entity; each paper has sections (subjects) which
-- contain subsections (Section A = MCQ, Section B = numerical).

create table if not exists public.papers (
  id bigint generated always as identity primary key,
  key text not null unique,
  title text not null,
  full_title text not null,
  exam_date date not null,
  session text not null check (session in ('morning', 'evening')),
  year smallint not null,
  duration_minutes smallint not null default 180,
  question_count smallint not null default 75,
  created_at timestamptz not null default now()
);

create table if not exists public.sections (
  id bigint generated always as identity primary key,
  paper_id bigint not null references public.papers (id) on delete cascade,
  name text not null check (name in ('Physics', 'Chemistry', 'Mathematics')),
  position smallint not null check (position between 1 and 3),
  unique (paper_id, name),
  unique (paper_id, position)
);

create table if not exists public.subsections (
  id bigint generated always as identity primary key,
  section_id bigint not null references public.sections (id) on delete cascade,
  name text not null check (name in ('Section A', 'Section B')),
  position smallint not null check (position between 1 and 2),
  unique (section_id, name)
);

create table if not exists public.questions (
  id bigint generated always as identity primary key,
  paper_id bigint not null references public.papers (id) on delete cascade,
  section_id bigint not null references public.sections (id) on delete cascade,
  subsection_id bigint not null references public.subsections (id) on delete cascade,
  number smallint not null,
  type text not null check (type in ('mcq', 'numerical')),
  text text not null,
  correct_answer text,
  solution text,
  marks numeric(5, 2) not null default 4,
  negative_marks numeric(5, 2) not null default -1,
  position smallint not null,
  unique (paper_id, position),
  unique (paper_id, section_id, number)
);

create table if not exists public.question_options (
  id bigint generated always as identity primary key,
  question_id bigint not null references public.questions (id) on delete cascade,
  position smallint not null check (position between 1 and 4),
  label text not null check (label in ('A', 'B', 'C', 'D')),
  text text not null,
  unique (question_id, position)
);

-- One-to-one figure per question (SVG markup rendered as HTML).
create table if not exists public.question_diagrams (
  id bigint generated always as identity primary key,
  question_id bigint not null unique references public.questions (id) on delete cascade,
  paper_key text not null,
  figure_html text not null
);

create index if not exists questions_paper_id_idx on public.questions (paper_id);
create index if not exists questions_section_id_idx on public.questions (section_id);
create index if not exists subsections_section_id_idx on public.subsections (section_id);
create index if not exists question_diagrams_paper_key_idx on public.question_diagrams (paper_key);

-- RLS: content is publicly readable (practice platform, no accounts yet).
-- Writes are reserved for the database owner via psql.
alter table public.papers enable row level security;
alter table public.sections enable row level security;
alter table public.subsections enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.question_diagrams enable row level security;

create policy "papers are publicly readable" on public.papers
  for select to anon, authenticated using (true);
create policy "sections are publicly readable" on public.sections
  for select to anon, authenticated using (true);
create policy "subsections are publicly readable" on public.subsections
  for select to anon, authenticated using (true);
create policy "questions are publicly readable" on public.questions
  for select to anon, authenticated using (true);
create policy "options are publicly readable" on public.question_options
  for select to anon, authenticated using (true);
create policy "diagrams are publicly readable" on public.question_diagrams
  for select to anon, authenticated using (true);

-- Expose tables through the Data API.
grant select on public.papers to anon, authenticated;
grant select on public.sections to anon, authenticated;
grant select on public.subsections to anon, authenticated;
grant select on public.questions to anon, authenticated;
grant select on public.question_options to anon, authenticated;
grant select on public.question_diagrams to anon, authenticated;
