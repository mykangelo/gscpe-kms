-- GRADKnow schema. Mirrors apps/web/src/lib/repo.ts so the file store can be swapped for Postgres.
create type public.app_role as enum ('student', 'staff', 'admin');
create type public.doc_category as enum ('form', 'procedure', 'guideline', 'policy', 'program');

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role public.app_role not null default 'student',
  created_at timestamptz not null default now()
);

create table public.documents (
  id text primary key,
  title text not null,
  category public.doc_category not null default 'guideline',
  description text not null default '',
  summary text not null default '',
  file_path text,                       -- object path in the 'documents' storage bucket
  body text not null default '',        -- extracted text the assistant reads
  fts tsvector generated always as (to_tsvector('english', title || ' ' || description || ' ' || body)) stored,
  updated_at timestamptz not null default now()
);
create index documents_fts_idx on public.documents using gin (fts);

-- 'site' = contacts + programs, 'enrollment' = enrollment guide (same JSON as content/data/*.json)
create table public.site_content (
  key text primary key check (key in ('site', 'enrollment')),
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.question_log (
  id bigint generated always as identity primary key,
  asked_at timestamptz not null default now(),
  question text not null,
  hit boolean not null
);

create or replace function public.is_staff() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('staff', 'admin'));
$$;

alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.site_content enable row level security;
alter table public.question_log enable row level security;

create policy "own profile" on public.profiles for select using (id = auth.uid());
create policy "public read documents" on public.documents for select using (true);
create policy "staff write documents" on public.documents for all using (public.is_staff()) with check (public.is_staff());
create policy "public read site" on public.site_content for select using (true);
create policy "staff write site" on public.site_content for all using (public.is_staff()) with check (public.is_staff());
create policy "anyone logs a question" on public.question_log for insert with check (true);
create policy "staff read questions" on public.question_log for select using (public.is_staff());

insert into storage.buckets (id, name, public) values ('documents', 'documents', true) on conflict do nothing;
create policy "staff upload files" on storage.objects for all using (bucket_id = 'documents' and public.is_staff()) with check (bucket_id = 'documents' and public.is_staff());
