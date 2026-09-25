import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Faltan las credenciales de Supabase. Revisa tu archivo .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

