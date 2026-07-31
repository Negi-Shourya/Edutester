-- Add figure_url to questions and populate from the question-images storage bucket.
-- Old SVG diagrams (question_diagrams) are removed for questions that now use images.
do $$ begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'questions' and column_name = 'figure_url') then
    alter table public.questions add column figure_url jsonb;
  end if;
end $$;

update public.questions set figure_url = '[]'::jsonb where figure_url is null;

-- 02-apr-evening Q28 (id 2028): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-evening/2026-04-02_evening_Q28.jpeg"]'::jsonb
where id = 2028;

-- 02-apr-evening Q30 (id 2030): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-evening/2026-04-02_evening_Q30.jpeg"]'::jsonb
where id = 2030;

-- 02-apr-evening Q41 (id 2041): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-evening/2026-04-02_evening_Q41.jpeg"]'::jsonb
where id = 2041;

-- 02-apr-evening Q42 (id 2042): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-evening/2026-04-02_evening_Q42.jpeg"]'::jsonb
where id = 2042;

-- 02-apr-evening Q50 (id 2050): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-evening/2026-04-02_evening_Q50.jpeg"]'::jsonb
where id = 2050;

-- 02-apr-evening Q67 (id 2067): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-evening/2026-04-02_evening_Q67.jpeg"]'::jsonb
where id = 2067;

-- 02-apr-evening Q68 (id 2068): 5 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-evening/2026-04-02_evening_Q68.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-evening/2026-04-02_evening_Q68_2.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-evening/2026-04-02_evening_Q68_3.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-evening/2026-04-02_evening_Q68_4.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-evening/2026-04-02_evening_Q68_5.jpeg"]'::jsonb
where id = 2068;

-- 02-apr-evening Q75 (id 2075): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-evening/2026-04-02_evening_Q75.jpeg"]'::jsonb
where id = 2075;

-- 02-apr-morning Q32 (id 1032): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-morning/2026-04-02_morning_Q32.png"]'::jsonb
where id = 1032;

-- 02-apr-morning Q36 (id 1036): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-morning/2026-04-02_morning_Q36.png"]'::jsonb
where id = 1036;

-- 02-apr-morning Q37 (id 1037): 3 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-morning/2026-04-02_morning_Q37.png","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-morning/2026-04-02_morning_Q37_2.png","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-morning/2026-04-02_morning_Q37_3.png"]'::jsonb
where id = 1037;

-- 02-apr-morning Q39 (id 1039): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-morning/2026-04-02_morning_Q39.png"]'::jsonb
where id = 1039;

-- 02-apr-morning Q41 (id 1041): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-morning/2026-04-02_morning_Q41.png"]'::jsonb
where id = 1041;

-- 02-apr-morning Q66 (id 1066): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-morning/2026-04-02_morning_Q66.png"]'::jsonb
where id = 1066;

-- 02-apr-morning Q68 (id 1068): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-02-morning/2026-04-02_morning_Q68.png"]'::jsonb
where id = 1068;

-- 04-apr-evening Q35 (id 4035): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q35.jpeg"]'::jsonb
where id = 4035;

-- 04-apr-evening Q37 (id 4037): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q37.jpeg"]'::jsonb
where id = 4037;

-- 04-apr-evening Q48 (id 4048): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q48.jpeg"]'::jsonb
where id = 4048;

-- 04-apr-evening Q53 (id 4053): 4 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q53.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q53_2.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q53_3.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q53_4.jpeg"]'::jsonb
where id = 4053;

-- 04-apr-evening Q54 (id 4054): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q54.jpeg"]'::jsonb
where id = 4054;

-- 04-apr-evening Q61 (id 4061): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q61.jpeg"]'::jsonb
where id = 4061;

-- 04-apr-evening Q63 (id 4063): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q63.jpeg"]'::jsonb
where id = 4063;

-- 04-apr-evening Q64 (id 4064): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q64.jpeg"]'::jsonb
where id = 4064;

-- 04-apr-evening Q65 (id 4065): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q65.jpeg"]'::jsonb
where id = 4065;

-- 04-apr-evening Q66 (id 4066): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q66.jpeg"]'::jsonb
where id = 4066;

-- 04-apr-evening Q67 (id 4067): 4 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q67.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q67_2.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q67_3.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q67_4.jpeg"]'::jsonb
where id = 4067;

-- 04-apr-evening Q68 (id 4068): 4 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q68.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q68_2.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q68_3.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-evening/2026-04-04_evening_Q68_4.jpeg"]'::jsonb
where id = 4068;

-- 04-apr-morning Q32 (id 3032): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-morning/2026-04-04_morning_Q32.png"]'::jsonb
where id = 3032;

-- 04-apr-morning Q38 (id 3038): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-morning/2026-04-04_morning_Q38.png"]'::jsonb
where id = 3038;

-- 04-apr-morning Q39 (id 3039): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-morning/2026-04-04_morning_Q39.png"]'::jsonb
where id = 3039;

-- 04-apr-morning Q42 (id 3042): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-morning/2026-04-04_morning_Q42.png"]'::jsonb
where id = 3042;

-- 04-apr-morning Q43 (id 3043): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-morning/2026-04-04_morning_Q43.png"]'::jsonb
where id = 3043;

-- 04-apr-morning Q45 (id 3045): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-morning/2026-04-04_morning_Q45.png"]'::jsonb
where id = 3045;

-- 04-apr-morning Q64 (id 3064): 4 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-morning/2026-04-04_morning_Q64.png","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-morning/2026-04-04_morning_Q64_2.png","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-morning/2026-04-04_morning_Q64_3.png","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-morning/2026-04-04_morning_Q64_4.png"]'::jsonb
where id = 3064;

-- 04-apr-morning Q66 (id 3066): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-morning/2026-04-04_morning_Q66.png"]'::jsonb
where id = 3066;

-- 04-apr-morning Q67 (id 3067): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-morning/2026-04-04_morning_Q67.png"]'::jsonb
where id = 3067;

-- 04-apr-morning Q68 (id 3068): 2 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-morning/2026-04-04_morning_Q68.png","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-morning/2026-04-04_morning_Q68_2.png"]'::jsonb
where id = 3068;

-- 04-apr-morning Q70 (id 3070): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-morning/2026-04-04_morning_Q70.png"]'::jsonb
where id = 3070;

-- 04-apr-morning Q72 (id 3072): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-04-morning/2026-04-04_morning_Q72.png"]'::jsonb
where id = 3072;

-- 05-apr-evening Q29 (id 6029): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-05-evening/2026-04-05_evening_Q29.jpeg"]'::jsonb
where id = 6029;

-- 05-apr-evening Q31 (id 6031): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-05-evening/2026-04-05_evening_Q31.jpeg"]'::jsonb
where id = 6031;

-- 05-apr-evening Q37 (id 6037): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-05-evening/2026-04-05_evening_Q37.jpeg"]'::jsonb
where id = 6037;

-- 05-apr-evening Q75 (id 6075): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-05-evening/2026-04-05_evening_Q75.jpeg"]'::jsonb
where id = 6075;

-- 05-apr-morning Q29 (id 5029): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-05-morning/2026-04-05_morning_Q29.png"]'::jsonb
where id = 5029;

-- 05-apr-morning Q30 (id 5030): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-05-morning/2026-04-05_morning_Q30.png"]'::jsonb
where id = 5030;

-- 05-apr-morning Q34 (id 5034): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-05-morning/2026-04-05_morning_Q34.png"]'::jsonb
where id = 5034;

-- 05-apr-morning Q38 (id 5038): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-05-morning/2026-04-05_morning_Q38.png"]'::jsonb
where id = 5038;

-- 05-apr-morning Q43 (id 5043): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-05-morning/2026-04-05_morning_Q43.png"]'::jsonb
where id = 5043;

-- 05-apr-morning Q45 (id 5045): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-05-morning/2026-04-05_morning_Q45.png"]'::jsonb
where id = 5045;

-- 05-apr-morning Q50 (id 5050): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-05-morning/2026-04-05_morning_Q50.png"]'::jsonb
where id = 5050;

-- 05-apr-morning Q64 (id 5064): 5 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-05-morning/2026-04-05_morning_Q64.png","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-05-morning/2026-04-05_morning_Q64_2.png","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-05-morning/2026-04-05_morning_Q64_3.png","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-05-morning/2026-04-05_morning_Q64_4.png","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-05-morning/2026-04-05_morning_Q64_5.png"]'::jsonb
where id = 5064;

-- 05-apr-morning Q65 (id 5065): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-05-morning/2026-04-05_morning_Q65.png"]'::jsonb
where id = 5065;

-- 05-apr-morning Q66 (id 5066): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-05-morning/2026-04-05_morning_Q66.png"]'::jsonb
where id = 5066;

-- 05-apr-morning Q68 (id 5068): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-05-morning/2026-04-05_morning_Q68.png"]'::jsonb
where id = 5068;

-- 06-apr-evening Q33 (id 8033): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-evening/2026-04-06_evening_Q33.jpeg"]'::jsonb
where id = 8033;

-- 06-apr-evening Q43 (id 8043): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-evening/2026-04-06_evening_Q43.jpeg"]'::jsonb
where id = 8043;

-- 06-apr-evening Q44 (id 8044): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-evening/2026-04-06_evening_Q44.jpeg"]'::jsonb
where id = 8044;

-- 06-apr-evening Q45 (id 8045): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-evening/2026-04-06_evening_Q45.jpeg"]'::jsonb
where id = 8045;

-- 06-apr-evening Q55 (id 8055): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-evening/2026-04-06_evening_Q55.jpeg"]'::jsonb
where id = 8055;

-- 06-apr-evening Q57 (id 8057): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-evening/2026-04-06_evening_Q57.jpeg"]'::jsonb
where id = 8057;

-- 06-apr-evening Q63 (id 8063): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-evening/2026-04-06_evening_Q63.jpeg"]'::jsonb
where id = 8063;

-- 06-apr-evening Q66 (id 8066): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-evening/2026-04-06_evening_Q66.jpeg"]'::jsonb
where id = 8066;

-- 06-apr-evening Q67 (id 8067): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-evening/2026-04-06_evening_Q67.jpeg"]'::jsonb
where id = 8067;

-- 06-apr-evening Q68 (id 8068): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-evening/2026-04-06_evening_Q68.jpeg"]'::jsonb
where id = 8068;

-- 06-apr-evening Q69 (id 8069): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-evening/2026-04-06_evening_Q69.jpeg"]'::jsonb
where id = 8069;

-- 06-apr-morning Q29 (id 7029): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-morning/2026-04-06_morning_Q29.png"]'::jsonb
where id = 7029;

-- 06-apr-morning Q32 (id 7032): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-morning/2026-04-06_morning_Q32.png"]'::jsonb
where id = 7032;

-- 06-apr-morning Q33 (id 7033): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-morning/2026-04-06_morning_Q33.png"]'::jsonb
where id = 7033;

-- 06-apr-morning Q39 (id 7039): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-morning/2026-04-06_morning_Q39.png"]'::jsonb
where id = 7039;

-- 06-apr-morning Q41 (id 7041): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-morning/2026-04-06_morning_Q41.png"]'::jsonb
where id = 7041;

-- 06-apr-morning Q43 (id 7043): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-morning/2026-04-06_morning_Q43.png"]'::jsonb
where id = 7043;

-- 06-apr-morning Q46 (id 7046): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-morning/2026-04-06_morning_Q46.png"]'::jsonb
where id = 7046;

-- 06-apr-morning Q67 (id 7067): 5 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-morning/2026-04-06_morning_Q67.png","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-morning/2026-04-06_morning_Q67_2.png","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-morning/2026-04-06_morning_Q67_3.png","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-morning/2026-04-06_morning_Q67_4.png","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-morning/2026-04-06_morning_Q67_5.png"]'::jsonb
where id = 7067;

-- 06-apr-morning Q72 (id 7072): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-06-morning/2026-04-06_morning_Q72.png"]'::jsonb
where id = 7072;

-- 08-apr-evening Q42 (id 9042): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-08-evening/2026-04-08_evening_Q42.jpeg"]'::jsonb
where id = 9042;

-- 08-apr-evening Q45 (id 9045): 5 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-08-evening/2026-04-08_evening_Q45.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-08-evening/2026-04-08_evening_Q45_2.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-08-evening/2026-04-08_evening_Q45_3.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-08-evening/2026-04-08_evening_Q45_4.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-08-evening/2026-04-08_evening_Q45_5.jpeg"]'::jsonb
where id = 9045;

-- 08-apr-evening Q49 (id 9049): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-08-evening/2026-04-08_evening_Q49.jpeg"]'::jsonb
where id = 9049;

-- 08-apr-evening Q57 (id 9057): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-08-evening/2026-04-08_evening_Q57.jpeg"]'::jsonb
where id = 9057;

-- 08-apr-evening Q63 (id 9063): 4 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-08-evening/2026-04-08_evening_Q63.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-08-evening/2026-04-08_evening_Q63_2.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-08-evening/2026-04-08_evening_Q63_3.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-08-evening/2026-04-08_evening_Q63_4.jpeg"]'::jsonb
where id = 9063;

-- 08-apr-evening Q64 (id 9064): 1 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-08-evening/2026-04-08_evening_Q64.jpeg"]'::jsonb
where id = 9064;

-- 08-apr-evening Q67 (id 9067): 5 image(s)
update public.questions set figure_url = '["https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-08-evening/2026-04-08_evening_Q67.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-08-evening/2026-04-08_evening_Q67_2.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-08-evening/2026-04-08_evening_Q67_3.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-08-evening/2026-04-08_evening_Q67_4.jpeg","https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images/2026-04-08-evening/2026-04-08_evening_Q67_5.jpeg"]'::jsonb
where id = 9067;

-- Remove old SVG diagrams for questions that now have storage images.
delete from public.question_diagrams
where question_id in (select id from public.questions where jsonb_array_length(figure_url) > 0);