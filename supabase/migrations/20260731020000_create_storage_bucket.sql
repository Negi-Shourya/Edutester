-- Storage bucket for question figure images.
-- Public bucket: images served at
-- https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/<paper>/<file>
insert into storage.buckets (id, name, public)
values ('question-images', 'question-images', true)
on conflict (id) do nothing;
