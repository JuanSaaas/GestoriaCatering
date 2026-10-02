-- Empresas: logo y web. Contactos (empleados que nos han escrito) ligados a empresa.

alter table empresas add column if not exists sitio_web text;
alter table empresas add column if not exists logo_url text;

alter table clientes add column if not exists empresa_id uuid references empresas(id) on delete set null;
alter table clientes add column if not exists cargo text;

create index if not exists idx_clientes_empresa on clientes(empresa_id);
