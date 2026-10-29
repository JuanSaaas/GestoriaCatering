-- Ejecutar una vez en SQL Editor. Crea únicamente el módulo de facturas.
-- Las tablas comerciales y RRHH no se modifican.
begin;

create table if not exists public.factura_documentos (
  id uuid primary key default gen_random_uuid(),
  sha256 text not null unique check (sha256 ~ '^[a-f0-9]{64}$'),
  archivo_nombre text not null check (length(archivo_nombre) between 1 and 255),
  estado text not null default 'pendiente' check (estado in ('pendiente','procesando','reintento','revisar','completada','duplicada')),
  intentos integer not null default 0 check (intentos >= 0),
  max_intentos integer not null default 5 check (max_intentos between 1 and 20),
  siguiente_intento timestamptz not null default now(),
  bloqueo_hasta timestamptz,
  bloqueo_token uuid,
  error_codigo text,
  error_mensaje text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.facturas (
  id uuid primary key default gen_random_uuid(),
  documento_id uuid not null unique references public.factura_documentos(id),
  numero_factura text check (length(numero_factura) <= 200),
  fecha_emision date,
  proveedor_nombre text check (length(proveedor_nombre) <= 300),
  proveedor_identificacion text check (length(proveedor_identificacion) <= 100),
  base_imponible numeric(14,2),
  impuestos jsonb not null default '[]' check (jsonb_typeof(impuestos) = 'array' and jsonb_array_length(impuestos) <= 30),
  importe_total numeric(14,2),
  moneda text check (moneda ~ '^[A-Z]{3}$'),
  observaciones text check (length(observaciones) <= 3000),
  advertencias text[] not null default '{}',
  estado text not null check (estado in ('extraida', 'revisar')),
  modelo_ia text not null,
  creado_en timestamptz not null default now()
);
-- A binary hash alone cannot detect the same invoice scanned twice differently.
-- Only deduplicate commercially if all three identifying fields are present.
create unique index if not exists facturas_identidad_unica on public.facturas (
  upper(regexp_replace(proveedor_identificacion, '[^a-zA-Z0-9]', '', 'g')),
  upper(btrim(numero_factura)), extract(year from fecha_emision)
) where proveedor_identificacion is not null and numero_factura is not null and fecha_emision is not null;

create table if not exists public.factura_intentos (
  id bigint generated always as identity primary key,
  documento_id uuid not null references public.factura_documentos(id),
  modelo text not null,
  resultado text not null check (resultado in ('correcto','error','omitido')),
  categoria text,
  mensaje text,
  duracion_ms integer check (duracion_ms >= 0),
  creado_en timestamptz not null default now()
);
create index if not exists factura_intentos_documento_fecha on public.factura_intentos(documento_id, creado_en desc);

create table if not exists public.factura_agente (
  id text primary key check (id = 'principal'),
  estado text not null check (estado in ('activo','incidencia')),
  mensaje text not null,
  modelos jsonb not null check (jsonb_typeof(modelos) = 'array'),
  actualizado_en timestamptz not null default now()
);

alter table public.factura_documentos enable row level security;
alter table public.facturas enable row level security;
alter table public.factura_intentos enable row level security;
alter table public.factura_agente enable row level security;
revoke all on public.factura_documentos, public.facturas, public.factura_intentos, public.factura_agente from anon, authenticated;
grant select, insert, update on public.factura_documentos, public.facturas, public.factura_intentos, public.factura_agente to service_role;
grant usage, select on sequence public.factura_intentos_id_seq to service_role;

create or replace function public.reclamar_documento_factura(p_sha256 text, p_token uuid, p_lease_seconds integer)
returns setof public.factura_documentos language plpgsql set search_path = public as $$
begin
  if p_token is null or p_lease_seconds not between 60 and 20000 then raise exception 'Parámetros de bloqueo no válidos'; end if;
  update factura_documentos set estado='reintento', intentos=0, error_codigo='bloqueos_agotados',
    error_mensaje='Se interrumpieron varios intentos. La cola volverá a comprobar el documento dentro de una hora.',
    siguiente_intento=now()+interval '1 hour', bloqueo_token=null, bloqueo_hasta=null, actualizado_en=now()
  where sha256=p_sha256 and estado='procesando' and bloqueo_hasta < now() and intentos >= max_intentos;
  return query update factura_documentos set estado='procesando', intentos=intentos+1,
    bloqueo_token=p_token, bloqueo_hasta=now()+make_interval(secs=>p_lease_seconds), actualizado_en=now()
  where sha256=p_sha256 and intentos < max_intentos and siguiente_intento <= now()
    and (estado in ('pendiente','reintento') or (estado='procesando' and bloqueo_hasta < now()))
  returning *;
end $$;

create or replace function public.registrar_intento_factura(p_documento_id uuid, p_token uuid, p_modelo text,
  p_resultado text, p_categoria text, p_mensaje text, p_duracion_ms integer)
returns void language plpgsql set search_path=public as $$
begin
  perform 1 from factura_documentos where id=p_documento_id and bloqueo_token=p_token
    and estado='procesando' and bloqueo_hasta > now() for update;
  if not found then raise exception 'Bloqueo caducado'; end if;
  insert into factura_intentos(documento_id,modelo,resultado,categoria,mensaje,duracion_ms)
    values(p_documento_id,left(p_modelo,150),p_resultado,left(p_categoria,80),left(p_mensaje,500),p_duracion_ms);
end $$;

create or replace function public.fallar_documento_factura(p_documento_id uuid, p_token uuid, p_codigo text, p_mensaje text, p_reintentar boolean)
returns void language plpgsql set search_path=public as $$
begin
  update factura_documentos set
    estado=case when p_reintentar then 'reintento' else 'revisar' end,
    siguiente_intento=now()+make_interval(secs=>case when intentos>=max_intentos then 3600 else least(3600, (30*power(2,least(intentos,7)))::integer) end),
    error_codigo=left(p_codigo,80),
    error_mensaje=case when p_reintentar and intentos>=max_intentos then left(p_mensaje,350)||' Se reanudará automáticamente dentro de una hora.' else left(p_mensaje,500) end,
    intentos=case when p_reintentar and intentos>=max_intentos then 0 else intentos end,
    bloqueo_token=null, bloqueo_hasta=null, actualizado_en=now()
  where id=p_documento_id and estado='procesando' and bloqueo_token=p_token and bloqueo_hasta > now();
  if not found then raise exception 'Bloqueo caducado'; end if;
end $$;

create or replace function public.guardar_factura(p_documento_id uuid, p_token uuid, p_modelo text, p_datos jsonb, p_advertencias text[])
returns jsonb language plpgsql set search_path=public as $$
declare
  factura_id uuid;
  created_id uuid;
begin
  perform 1 from factura_documentos where id=p_documento_id and bloqueo_token=p_token
    and estado='procesando' and bloqueo_hasta > now() for update;
  if not found then raise exception 'Bloqueo caducado'; end if;
  if jsonb_typeof(p_datos) <> 'object' or jsonb_typeof(p_datos->'impuestos') <> 'array'
    or length(p_modelo) not between 1 and 150 or p_advertencias is null then
    raise exception 'Datos de factura no válidos';
  end if;
  -- Insertion and completion share a transaction. Do not mark done before insert.
  insert into facturas(documento_id,numero_factura,fecha_emision,proveedor_nombre,proveedor_identificacion,
    base_imponible,impuestos,importe_total,moneda,observaciones,advertencias,estado,modelo_ia)
  values(p_documento_id,nullif(btrim(p_datos->>'numero_factura'),''),(p_datos->>'fecha_emision')::date,
    nullif(btrim(p_datos->>'proveedor_nombre'),''),nullif(btrim(p_datos->>'proveedor_identificacion'),''),
    (p_datos->>'base_imponible')::numeric,p_datos->'impuestos',(p_datos->>'importe_total')::numeric,
    p_datos->>'moneda',p_datos->>'observaciones',p_advertencias,
    case when cardinality(p_advertencias)>0 then 'revisar' else 'extraida' end,p_modelo)
  on conflict do nothing returning id into created_id;
  factura_id := created_id;
  if factura_id is null then
    select id into factura_id from facturas where documento_id=p_documento_id or (
      upper(regexp_replace(proveedor_identificacion,'[^a-zA-Z0-9]','','g')) = upper(regexp_replace(p_datos->>'proveedor_identificacion','[^a-zA-Z0-9]','','g'))
      and upper(btrim(numero_factura))=upper(btrim(p_datos->>'numero_factura'))
      and extract(year from fecha_emision)=extract(year from (p_datos->>'fecha_emision')::date)) limit 1;
    if factura_id is null then raise exception 'No se pudo confirmar la factura'; end if;
  end if;
  update factura_documentos set estado=case when created_id is not null then 'completada' else 'duplicada' end,
    error_codigo=null,error_mensaje=null,bloqueo_hasta=null,bloqueo_token=null,actualizado_en=now()
    where id=p_documento_id;
  return jsonb_build_object('id',factura_id,'estado',case when created_id is not null then 'completada' else 'duplicada' end);
end $$;

create or replace function public.reintentar_documento_factura(p_documento_id uuid)
returns boolean language plpgsql set search_path=public as $$
begin
  update factura_documentos set estado='pendiente',intentos=0,siguiente_intento=now(),
    error_codigo=null,error_mensaje=null,bloqueo_hasta=null,bloqueo_token=null,actualizado_en=now()
  where id=p_documento_id and estado in ('revisar','reintento');
  return found;
end $$;

revoke all on function public.reclamar_documento_factura(text,uuid,integer) from public,anon,authenticated;
revoke all on function public.registrar_intento_factura(uuid,uuid,text,text,text,text,integer) from public,anon,authenticated;
revoke all on function public.fallar_documento_factura(uuid,uuid,text,text,boolean) from public,anon,authenticated;
revoke all on function public.guardar_factura(uuid,uuid,text,jsonb,text[]) from public,anon,authenticated;
revoke all on function public.reintentar_documento_factura(uuid) from public,anon,authenticated;
grant execute on function public.reclamar_documento_factura(text,uuid,integer) to service_role;
grant execute on function public.registrar_intento_factura(uuid,uuid,text,text,text,text,integer) to service_role;
grant execute on function public.fallar_documento_factura(uuid,uuid,text,text,boolean) to service_role;
grant execute on function public.guardar_factura(uuid,uuid,text,jsonb,text[]) to service_role;
grant execute on function public.reintentar_documento_factura(uuid) to service_role;
notify pgrst, 'reload schema';
commit;
