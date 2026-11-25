create table public.web_projects (
 id uuid primary key,
 owner_id text not null,
 name text not null check (char_length(btrim(name)) between 1 and 120),
 document jsonb not null check (jsonb_typeof(document)='object' and document->>'schema'='1'),
 revision integer not null default 1 check (revision > 0),
 status text not null default 'draft' check(status='draft'),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index web_projects_owner_updated on public.web_projects(owner_id,updated_at desc);
alter table public.web_projects enable row level security;
revoke all on public.web_projects from public,anon,authenticated;
grant select,insert,update,delete on public.web_projects to service_role;
comment on table public.web_projects is 'Private CRM web drafts. Server validates shared admin session and scopes every operation to the configured CRM administrator. No direct browser access or public publishing.';
