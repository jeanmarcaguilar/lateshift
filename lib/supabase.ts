import { createClient } from "@supabase/supabase-js";
// Anon client for public, RLS-protected reads in Server Components.
export const supabase = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
