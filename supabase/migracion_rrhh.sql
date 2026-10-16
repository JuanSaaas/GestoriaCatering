-- Ejecutar en Supabase > SQL Editor. No modifica las tablas comerciales.
begin;
create table if not exists public.rrhh_state (
  id text primary key check (id = 'main'),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  revision bigint not null default 0 check (revision >= 0)
);
alter table public.rrhh_state enable row level security;
revoke all on table public.rrhh_state from anon, authenticated;
grant select, insert, update on table public.rrhh_state to service_role;

-- Acceso a documentos únicamente desde el servidor con clave secreta.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('rrhh-private', 'rrhh-private', false, 5242880,
        array['application/pdf', 'image/png', 'image/jpeg'])
on conflict (id) do nothing;
notify pgrst, 'reload schema';
commit;
