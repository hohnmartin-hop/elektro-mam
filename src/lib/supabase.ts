import { createClient } from '@supabase/supabase-js';

// Načtení proměnných z prostředí
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Automatické očištění: odstraní /rest/v1 i koncová lomítka, ať přijde cokoliv
const cleanUrl = rawUrl.replace(/\/rest\/v1.*$/, '').replace(/\/+$/, '');

// Záložní pojistka pro tvůj projekt, kdyby proměnná z .env vůbec nedorazila
const supabaseUrl = cleanUrl || 'https://crulaktbptkfhzqywddg.supabase.co';

if (!supabaseAnonKey) {
  throw new Error('Chybí proměnná prostředí VITE_SUPABASE_ANON_KEY v souboru .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);