import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)?.trim();

if (!supabaseUrl) {
  throw new Error(
    'Falta NEXT_PUBLIC_SUPABASE_URL. Crea .env.local en la raíz del proyecto y añade la Project URL de Supabase.'
  );
}

if (!supabaseKey) {
  throw new Error(
    'Falta la clave pública de Supabase. Añade NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (recomendado) o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
