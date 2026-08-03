-- Supabase default privileges grant anon/authenticated all privileges on new
-- public-schema tables, so question_keys needs an explicit revoke: PostgREST
-- then refuses the table outright (401) instead of returning an empty set.
-- The score-attempt edge function runs as service_role and is unaffected.
revoke all on public.question_keys from anon, authenticated;
