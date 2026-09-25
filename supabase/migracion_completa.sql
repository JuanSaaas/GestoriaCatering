-- ============================================================
-- La Mesa Perfecta — Migración completa (empresas + relaciones)
--
-- Ejecuta este script UNA VEZ en Supabase → SQL Editor → New query.
-- Es seguro ejecutarlo aunque ya tengas parte de esto aplicado: usa
-- "if not exists" en todo, así que lo que ya exista se deja tal cual.
--
-- Soluciona el error "Could not find a relationship between
-- 'oportunidades' and 'empresas' in the schema cache": ese error sale
-- porque en tu base de datos aún no existe la tabla `empresas` ni la
-- columna `oportunidades.empresa_id` que la referencia. Este script
-- las crea (junto con el resto de columnas que usa la app) y al final
-- avisa a Supabase para que refresque la caché de relaciones.
-- ============================================================

create extension if not exists pgcrypto;

-- 1) Tabla empresas (si no existía todavía)
create table if not exists empresas (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  nombre      text not null unique,
  cif         text,
  sector      text,
  ciudad      text,
  email       text,
  telefono    text,
  sitio_web   text,
  logo_url    text
);

-- Por si la tabla ya existía de antes sin estas columnas:
alter table empresas add column if not exists sitio_web text;
alter table empresas add column if not exists logo_url  text;

-- 2) Relación oportunidades -> empresas (la que falta y da el error)
alter table oportunidades
  add column if not exists empresa_id uuid references empresas(id) on delete set null;

-- 3) Relación clientes -> empresas + cargo (usado en la página de Contactos)
alter table clientes add column if not exists empresa_id uuid references empresas(id) on delete set null;
alter table clientes add column if not exists cargo      text;

-- 4) Índices
create index if not exists idx_oportunidades_empresa   on oportunidades(empresa_id);
create index if not exists idx_oportunidades_comercial on oportunidades(comercial_id);
create index if not exists idx_clientes_empresa        on clientes(empresa_id);

-- 5) RLS + política abierta para empresas (misma política que el resto de
-- tablas; ver nota de seguridad en schema.sql)
alter table empresas enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'empresas' and policyname = 'acceso completo empresas'
  ) then
    create policy "acceso completo empresas" on empresas for all using (true) with check (true);
  end if;
end $$;

-- 6) Refresca la caché de relaciones de PostgREST (Supabase). Sin esto,
-- aunque la columna ya exista en la base de datos, la API puede seguir
-- devolviendo "Could not find a relationship..." unos minutos más.
notify pgrst, 'reload schema';
