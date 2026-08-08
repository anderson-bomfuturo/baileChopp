import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.error(
    'Supabase não configurado: defina REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY (.env.local em dev, variáveis de ambiente no Vercel em produção).'
  );
}

// createClient exige uma URL válida mesmo quando as variáveis de ambiente
// ainda não foram configuradas (ex: build de teste). Usamos um placeholder
// nesse caso para não quebrar o import; as chamadas à API vão falhar de
// forma tratada (ver useMesasState) até as env vars serem definidas.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
