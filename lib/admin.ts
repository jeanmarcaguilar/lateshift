import { createClient } from "@supabase/supabase-js";
// Service-role client: bypasses RLS. Only import from route handlers, never from client components.
export const admin = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
