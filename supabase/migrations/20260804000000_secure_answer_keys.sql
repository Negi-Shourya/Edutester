-- Security: stop exposing answer keys and solution text through the Data API.
--
-- 1. correct_answer + solution move out of the publicly-readable `questions`
--    table into `question_keys`, which has RLS enabled and NO policies and
--    NO grants: anon and authenticated roles get zero rows / no access.
--    Only the score-attempt edge function (service role) reads it.
-- 2. `question_diagrams` stored raw SVG as HTML — a latent stored-XSS sink
--    that the app never renders (figures now come from storage images).
--    The table is empty, so it is dropped entirely.

create table if not exists public.question_keys (
  question_id bigint primary key references public.questions (id) on delete cascade,
  correct_answer text not null,
  solution text
);

insert into public.question_keys (question_id, correct_answer, solution)
select id, correct_answer, solution
from public.questions
where correct_answer is not null or solution is not null
on conflict (question_id) do nothing;

alter table public.questions drop column correct_answer;
alter table public.questions drop column solution;

-- Deny-by-default: RLS on, no select policy, no grants to anon/authenticated.
alter table public.question_keys enable row level security;

drop table if exists public.question_diagrams;
