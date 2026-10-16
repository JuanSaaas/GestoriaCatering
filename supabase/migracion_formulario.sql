-- Ejecutar en el SQL Editor de Supabase para guardar los datos en sus columnas.
-- Conserva todos los registros existentes. Puede ejecutarse más de una vez.
begin;
alter table public.clientes add column if not exists empresa_id uuid references public.empresas(id) on delete set null;
alter table public.oportunidades add column if not exists franja_horaria text;
alter table public.oportunidades add column if not exists ubicacion_evento text;
alter table public.oportunidades add column if not exists restricciones text;
alter table public.oportunidades add column if not exists como_nos_conocio text;
notify pgrst, 'reload schema';
commit;
