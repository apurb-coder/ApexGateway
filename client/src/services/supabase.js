import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-project.supabase.co';
const supabasePublishableOrAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key";

export const supabase = createClient(supabaseUrl, supabasePublishableOrAnonKey);
