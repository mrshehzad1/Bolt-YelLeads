import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate Supabase URL format
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

if (!supabaseUrl || !isValidUrl(supabaseUrl)) {
  throw new Error(
    'Invalid or missing Supabase URL. Please ensure VITE_SUPABASE_URL is set correctly in your .env file and follows the format: https://your-project-id.supabase.co'
  );
}

if (!supabaseKey) {
  throw new Error(
    'Missing Supabase Anon Key. Please ensure VITE_SUPABASE_ANON_KEY is set in your .env file'
  );
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);