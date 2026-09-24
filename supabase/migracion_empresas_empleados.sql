-- ============================================================
-- Migración: asociar cada oportunidad con una EMPRESA y un EMPLEADO
--
-- Ejecuta este script en Supabase → SQL Editor → New query.
-- Es seguro ejecutarlo varias veces (usa "if not exists").
--
-- - EMPLEADO: se reutiliza la tabla `usuarios` (comerciales del equipo) y la
--   columna que ya existía, `oportunidades.comercial_id`.
-- - EMPRESA: tabla nueva `empresas` + columna nueva `oportunidades.empresa_id`.
-- ============================================================

create table if not exists empresas (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  nombre      text not null unique,
  cif         text,
  sector      text,
  ciudad      text,
  email       text,
  telefono    text
);

alter table oportunidades
  add column if not exists empresa_id uuid references empresas(id) on delete set null;

create index if not exists idx_oportunidades_empresa   on oportunidades(empresa_id);
create index if not exists idx_oportunidades_comercial on oportunidades(comercial_id);

-- Mismas políticas abiertas que el resto de tablas (ver nota de seguridad en schema.sql)
alter table empresas enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'empresas' and policyname = 'acceso completo empresas'
  ) then
    create policy "acceso completo empresas" on empresas for all using (true) with check (true);
  end if;
end $$;
