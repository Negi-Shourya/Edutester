-- Replace the combining right-arrow-above character (U+20D7, e.g. "a⃗") used
-- for vector notation with explicit \vec{...} markup. The combining character
-- has poor font support and renders as missing/misplaced arrows in browsers.
-- The \vec{} notation is rendered by the frontend's VectorText component.
--
-- Pass 1: simple ASCII letters (e.g. a⃗, r⃗)
-- Pass 2: letters/digits with Unicode subscripts (E₁⃗, v₂⃗), zero vector (0⃗)
--         and Greek letters (τ⃗)

update public.questions
set text = regexp_replace(text, '([A-Za-z])' || chr(8407), '\\vec{\1}', 'g')
where position(chr(8407) in text) > 0;

update public.questions
set solution = regexp_replace(solution, '([A-Za-z])' || chr(8407), '\\vec{\1}', 'g')
where position(chr(8407) in solution) > 0;

update public.question_options
set text = regexp_replace(text, '([A-Za-z])' || chr(8407), '\\vec{\1}', 'g')
where position(chr(8407) in text) > 0;

-- base: ASCII letter, Greek letter, or digit (zero vector), optionally
-- followed by Unicode subscripts or {subscript} groups
update public.questions
set text = regexp_replace(
  text,
  '((?:[A-Za-zΑ-Ωα-ω0-9])(?:[₀-₉]|\{[^{}]*\})*)' || chr(8407),
  '\\vec{\1}',
  'g'
)
where position(chr(8407) in text) > 0;

update public.questions
set solution = regexp_replace(
  solution,
  '((?:[A-Za-zΑ-Ωα-ω0-9])(?:[₀-₉]|\{[^{}]*\})*)' || chr(8407),
  '\\vec{\1}',
  'g'
)
where position(chr(8407) in solution) > 0;

update public.question_options
set text = regexp_replace(
  text,
  '((?:[A-Za-zΑ-Ωα-ω0-9])(?:[₀-₉]|\{[^{}]*\})*)' || chr(8407),
  '\\vec{\1}',
  'g'
)
where position(chr(8407) in text) > 0;
