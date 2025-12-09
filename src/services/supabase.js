// Service Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.warn('Failed to initialize Supabase client:', e);
  }
} else {
  console.warn('Supabase credentials not found. Using mock data.');
}

export { supabase };

// Helper pour vérifier si Supabase est configuré
export const isSupabaseConfigured = () => {
  return supabase !== null;
};
