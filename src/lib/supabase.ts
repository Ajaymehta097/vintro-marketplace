import { createClient } from '@supabase/supabase-js';

// Humari .env.local file se API keys yahan aayengi
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Agar keys missing hain toh console mein warning dikhayega
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL ya Anon Key missing hai. Kripya .env.local file check karein.");
}
  
// Supabase client create karna
export const supabase = createClient(supabaseUrl, supabaseAnonKey);