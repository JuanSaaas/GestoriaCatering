-- CRM profesional: activa Realtime también para contactos y empresas.
-- Ejecutar una vez en Supabase > SQL Editor.
do $$ begin
  alter publication supabase_realtime add table clientes;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table empresas;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table usuarios;
exception when duplicate_object then null; end $$;
