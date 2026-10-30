-- Amplía Facturas sin eliminar registros ni cambiar las tablas comerciales.
alter table public.facturas
  add column if not exists iva_importe numeric(14,2),
  add column if not exists estado_revision text not null default 'pendiente' check (estado_revision in ('pendiente','validada','descartada')),
  add column if not exists revision_version integer not null default 0 check (revision_version >= 0),
  add column if not exists revisado_en timestamptz,
  add column if not exists datos_extraidos jsonb;
alter table public.factura_documentos add column if not exists archivo_ruta text
  check (archivo_ruta ~ '^[a-f0-9]{64}[.](pdf|jpg|jpeg|png|webp)$');
create index if not exists facturas_revision_fecha on public.facturas(estado_revision,creado_en desc);

create or replace function public.factura_iva(p_impuestos jsonb)
returns numeric language sql immutable set search_path=public as $$
  -- Pydantic serializa Decimal como texto: admitir ambos sin convertir datos ausentes en cero.
  select case when count(*) > 0 and bool_and(coalesce((t->>'importe') ~ '^-?[0-9]{1,12}([.][0-9]{1,2})?$',false))
    then sum(case when (t->>'importe') ~ '^-?[0-9]{1,12}([.][0-9]{1,2})?$' then (t->>'importe')::numeric end)
    else null end
  from jsonb_array_elements(coalesce(p_impuestos,'[]'::jsonb)) t
  where coalesce(t->>'nombre','') ~* '(^|[^[:alnum:]])(IVA|VAT)([^[:alnum:]]|$)';
$$;

-- Conservar el resultado inicial del lector para contrastar futuras correcciones.
update public.facturas set iva_importe=public.factura_iva(impuestos) where datos_extraidos is null;
update public.facturas set datos_extraidos=jsonb_build_object(
  'proveedor_nombre',proveedor_nombre,'proveedor_identificacion',proveedor_identificacion,
  'numero_factura',numero_factura,'fecha_emision',fecha_emision,'base_imponible',base_imponible,
  'iva_importe',iva_importe,'importe_total',importe_total,'moneda',moneda,'impuestos',impuestos)
where datos_extraidos is null;

create or replace function public.conservar_extraccion_factura()
returns trigger language plpgsql set search_path=public as $$
begin
  if tg_op='INSERT' then
    new.iva_importe := public.factura_iva(new.impuestos);
    new.datos_extraidos := jsonb_build_object(
      'proveedor_nombre',new.proveedor_nombre,'proveedor_identificacion',new.proveedor_identificacion,
      'numero_factura',new.numero_factura,'fecha_emision',new.fecha_emision,'base_imponible',new.base_imponible,
      'iva_importe',new.iva_importe,'importe_total',new.importe_total,'moneda',new.moneda,'impuestos',new.impuestos);
  else new.datos_extraidos := old.datos_extraidos;
  end if;
  return new;
end $$;
create or replace trigger conservar_extraccion_factura before insert or update on public.facturas
  for each row execute function public.conservar_extraccion_factura();

create or replace function public.revisar_factura(p_factura_id uuid,p_version integer,p_accion text,p_datos jsonb)
returns jsonb language plpgsql set search_path=public as $$
declare f public.facturas;
begin
  if p_accion is null or p_accion not in ('guardar','validar','descartar') or p_version is null
    or p_version < 0 or jsonb_typeof(p_datos) is distinct from 'object' then
    raise exception 'Datos de revisión no válidos';
  end if;
  select * into f from public.facturas where id=p_factura_id for update;
  if not found then raise exception 'No se encontró la factura' using errcode='P0002'; end if;
  if f.revision_version <> p_version then
    raise exception 'La factura ha cambiado. Actualiza la ficha antes de guardar.' using errcode='40001';
  end if;
  if p_accion <> 'descartar' then
    if p_accion='validar' and (
      nullif(btrim(p_datos->>'proveedor_nombre'),'') is null or
      nullif(btrim(p_datos->>'proveedor_identificacion'),'') is null or
      nullif(btrim(p_datos->>'numero_factura'),'') is null or
      coalesce(p_datos->>'fecha_emision','') !~ '^\d{4}-\d{2}-\d{2}$' or
      jsonb_typeof(p_datos->'base_imponible') is distinct from 'number' or
      jsonb_typeof(p_datos->'iva_importe') is distinct from 'number' or
      jsonb_typeof(p_datos->'importe_total') is distinct from 'number' or
      coalesce(p_datos->>'moneda','') !~ '^[A-Z]{3}$'
    ) then raise exception 'Completa proveedor, NIF, número, fecha, base, IVA, total y moneda antes de validar.'; end if;
    update public.facturas set
      proveedor_nombre=nullif(btrim(p_datos->>'proveedor_nombre'),''),
      proveedor_identificacion=nullif(btrim(p_datos->>'proveedor_identificacion'),''),
      numero_factura=nullif(btrim(p_datos->>'numero_factura'),''),
      fecha_emision=nullif(p_datos->>'fecha_emision','')::date,
      base_imponible=(p_datos->>'base_imponible')::numeric,
      iva_importe=(p_datos->>'iva_importe')::numeric,
      importe_total=(p_datos->>'importe_total')::numeric,
      moneda=nullif(p_datos->>'moneda','') where id=p_factura_id;
  end if;
  update public.facturas set
    estado_revision=case p_accion when 'validar' then 'validada' when 'descartar' then 'descartada' else 'pendiente' end,
    revision_version=revision_version+1,revisado_en=now()
  where id=p_factura_id returning * into f;
  return to_jsonb(f);
end $$;

revoke all on function public.factura_iva(jsonb), public.conservar_extraccion_factura(),
  public.revisar_factura(uuid,integer,text,jsonb) from public,anon,authenticated;
grant execute on function public.factura_iva(jsonb), public.conservar_extraccion_factura(),
  public.revisar_factura(uuid,integer,text,jsonb) to service_role;

-- Los originales solo son accesibles mediante el servidor y enlaces de corta duración.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('facturas-originales','facturas-originales',false,52428800,
  array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
notify pgrst,'reload schema';
