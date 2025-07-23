create table questions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  difficulty text not null,
  description text,
  constraints text[],
  test_cases jsonb,
  source text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);