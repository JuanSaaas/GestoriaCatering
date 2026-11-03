alter table public.ventas_documentos drop constraint ventas_documentos_estado_check;
alter table public.ventas_documentos drop constraint ventas_documentos_check1;
alter table public.ventas_documentos add constraint ventas_documentos_estado_check check (estado in ('borrador','enviado','confirmado','cancelado'));
alter table public.ventas_documentos add constraint ventas_documentos_fase_check check ((tipo='presupuesto' and estado in ('borrador','enviado','cancelado')) or (tipo='pedido' and estado in ('confirmado','cancelado')));
alter table public.ventas_documentos
 add column evento text not null default '' check(length(evento)<=200),
 add column fecha_evento date,
 add column invitados integer check(invitados between 1 and 100000),
 add column ubicacion text not null default '' check(length(ubicacion)<=300),
 add column comercial_id uuid references public.usuarios(id),
 add column comercial_nombre text not null default '',
 add column oportunidad_id uuid references public.oportunidades(id),
 add column validez date check(validez>=fecha),
 add column condiciones text not null default '' check(length(condiciones)<=300),
 add column enviado_en timestamptz,
 add column confirmado_en timestamptz;
create index ventas_documentos_comercial_idx on public.ventas_documentos(comercial_id);
create index ventas_documentos_oportunidad_idx on public.ventas_documentos(oportunidad_id);
create table public.ventas_productos (
 id uuid primary key default gen_random_uuid(),
 nombre text not null check(length(trim(nombre)) between 1 and 200),
 tipo text not null default 'servicio' check(tipo in ('servicio','producto')),
 categoria text not null default '' check(length(categoria)<=100),
 descripcion text not null default '' check(length(descripcion)<=1000),
 precio numeric(12,2) not null check(precio between 0 and 1000000),
 impuesto numeric(5,2) not null check(impuesto in (0,4,10,21)),
 archivado boolean not null default false,
 version integer not null default 0 check(version>=0),
 creado_en timestamptz not null default now(),
 actualizado_en timestamptz not null default now()
);
alter table public.ventas_productos enable row level security;
revoke all on public.ventas_productos from public,anon,authenticated;
grant select,insert,update on public.ventas_productos to service_role;
create index ventas_productos_nombre_idx on public.ventas_productos(nombre,id);
notify pgrst, 'reload schema';
