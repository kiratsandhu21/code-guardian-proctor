create table students (
  id serial primary key,
  student_id text unique,
  name text,
  email text unique
);
