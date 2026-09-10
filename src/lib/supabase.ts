import { createClient } from '@supabase/supabase-js';

// Čistá kořenová URL projektu bez jakéhokoliv /rest/v1
const supabaseUrl = 'https://crulaktbptkfhzqywddg.supabase.co';

// Načtení anonymního klíče
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (!supabaseAnonKey) {
  throw new Error('Chybí proměnná prostředí VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);