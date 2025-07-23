   create table tests (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     status text not null default 'draft',
     code text unique,
     created_at timestamp with time zone default timezone('utc'::text, now()),
     teacher_id uuid
   );