import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://crulaktbptkfhzqywddg.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNydWxha3RicHRrZmh6cXl3ZGRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg5NzUzMTksImV4cCI6MjAyNDU1MTMxOX0.GiYxfvtoGFN_aiAtFmSHHt_CyseJ4c1wVZEI_R4hNq0').trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
