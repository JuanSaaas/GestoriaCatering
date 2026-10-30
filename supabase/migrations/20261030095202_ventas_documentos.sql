create table public.ventas_documentos (
 id uuid primary key default gen_random_uuid(),
 numero bigint generated always as identity unique,
 tipo text not null default 'presupuesto' check (tipo in ('presupuesto','pedido')),
 estado text not null default 'borrador' check (estado in ('borrador','confirmado','cancelado')),
 cliente_id uuid not null references public.clientes(id),
 cliente_nombre text not null,
 fecha date not null,
 lineas jsonb not null check(jsonb_typeof(lineas)='array' and jsonb_array_length(lineas) between 1 and 50),
 base numeric(14,2) not null check(base>=0),
 iva numeric(14,2) not null check(iva>=0),
 total numeric(14,2) not null check(total=base+iva),
 notas text not null default '' check(length(notas)<=2000),
 version integer not null default 0 check(version>=0),
 creado_en timestamptz not null default now(),
 actualizado_en timestamptz not null default now(),
 check((tipo='presupuesto' and estado in ('borrador','cancelado')) or (tipo='pedido' and estado in ('confirmado','cancelado')))
);
alter table public.ventas_documentos enable row level security;
revoke all on public.ventas_documentos from public, anon, authenticated;
grant select,insert,update on public.ventas_documentos to service_role;
grant usage,select on sequence public.ventas_documentos_numero_seq to service_role;
create index ventas_documentos_tipo_fecha on public.ventas_documentos(tipo,creado_en desc);
create index ventas_documentos_cliente on public.ventas_documentos(cliente_id);
notify pgrst, 'reload schema';
