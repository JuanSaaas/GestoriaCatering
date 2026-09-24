-- ============================================================
-- La Mesa Perfecta — Esquema de Supabase
-- Ejecuta este script completo en Supabase → SQL Editor → New query
--
-- 7 tablas:
-- - En uso activo por la app: clientes, oportunidades, tareas, notas,
--   empresas y usuarios (empleados asignables a cada oportunidad).
-- - Preparada para el futuro: historial_estados.
--   historial_estados ya se rellena sola mediante un trigger.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists clientes (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  tipo_cliente text not null check (tipo_cliente in ('particular','empresa')),
  nombre      text not null,
  empresa     text,
  email       text not null unique,
  telefono    text
);

-- Preparada para el día que añadas login (Supabase Auth): comerciales que
-- llevan oportunidades y tareas. Por ahora comercial_id/usuario_id se
-- quedan en null porque la interfaz aún no asigna nadie.
create table if not exists usuarios (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  nombre      text not null,
  email       text not null unique,
  rol         text not null default 'comercial'
);

-- Empresas (cuentas) a las que se asocian las oportunidades.
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

create table if not exists oportunidades (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  cliente_id            uuid not null references clientes(id) on delete cascade,
  comercial_id          uuid references usuarios(id) on delete set null, -- empleado responsable
  empresa_id            uuid references empresas(id) on delete set null,  -- empresa asociada

  tipo_evento           text not null check (
                          tipo_evento in ('boda','corporativo','comunion','cumpleanos','otro')
                        ),
  tipo_evento_otro      text,
  fecha_evento          date,
  num_invitados         integer,
  presupuesto_estimado  numeric(10,2),
  mensaje               text,

  estado                text not null default 'nuevo' check (
                          estado in ('nuevo','contactado','presupuesto_enviado','negociacion','ganado','perdido')
                        ),
  origen                text not null default 'formulario_web'
);

create table if not exists tareas (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  oportunidad_id  uuid not null references oportunidades(id) on delete cascade,
  usuario_id      uuid references usuarios(id) on delete set null,
  titulo          text not null,
  fecha_limite    date,
  completada      boolean not null default false
);

create table if not exists notas (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  oportunidad_id  uuid not null references oportunidades(id) on delete cascade,
  contenido       text not null
);

-- Auditoría automática: queda registrado cada cambio de fase del pipeline,
-- útil el día de mañana para medir cuánto tarda cada etapa (embudo de
-- conversión). No hace falta tocarla desde la interfaz, se rellena sola
-- mediante el trigger de más abajo.
create table if not exists historial_estados (
  id               uuid primary key default gen_random_uuid(),
  oportunidad_id   uuid not null references oportunidades(id) on delete cascade,
  usuario_id       uuid references usuarios(id) on delete set null,
  estado_anterior  text,
  estado_nuevo     text not null,
  changed_at       timestamptz not null default now()
);

-- ---------- Triggers ----------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_oportunidades_updated_at on oportunidades;
create trigger trg_oportunidades_updated_at
  before update on oportunidades
  for each row execute function set_updated_at();

create or replace function log_cambio_estado()
returns trigger as $$
begin
  if (tg_op = 'UPDATE' and old.estado is distinct from new.estado) then
    insert into historial_estados (oportunidad_id, estado_anterior, estado_nuevo)
    values (new.id, old.estado, new.estado);
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_log_cambio_estado on oportunidades;
create trigger trg_log_cambio_estado
  after update on oportunidades
  for each row execute function log_cambio_estado();

-- ============================================================
-- Seguridad a nivel de fila (RLS)
--
-- IMPORTANTE (nota para la práctica del curso):
-- Estas políticas son permisivas a propósito para que la web pública
-- (con la clave "anon") pueda insertar clientes/oportunidades y el
-- CRM (también con la clave "anon", sin login) pueda leer/actualizar
-- todo. Es válido para un ejercicio académico, pero en un proyecto
-- real el CRM debería usar Supabase Auth y políticas restringidas al
-- usuario/equipo correspondiente.
-- ============================================================

alter table clientes enable row level security;
alter table usuarios enable row level security;
alter table empresas enable row level security;
alter table oportunidades enable row level security;
alter table tareas enable row level security;
alter table notas enable row level security;
alter table historial_estados enable row level security;

create policy "acceso completo clientes" on clientes for all using (true) with check (true);
create policy "acceso completo usuarios" on usuarios for all using (true) with check (true);
create policy "acceso completo empresas" on empresas for all using (true) with check (true);
create policy "acceso completo oportunidades" on oportunidades for all using (true) with check (true);
create policy "acceso completo tareas" on tareas for all using (true) with check (true);
create policy "acceso completo notas" on notas for all using (true) with check (true);
create policy "acceso completo historial_estados" on historial_estados for all using (true) with check (true);

-- Habilita Realtime para que el CRM reciba las nuevas oportunidades en vivo
alter publication supabase_realtime add table oportunidades;
alter publication supabase_realtime add table tareas;
alter publication supabase_realtime add table notas;
