import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://crulaktbptkfhzqywddg.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);