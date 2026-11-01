import { supabase } from "@/lib/supabase";
import { storeStatus } from "@/lib/store-hours";
import Hero from "@/components/hero/Hero";
export const dynamic = "force-dynamic";
export default async function Home() {
  const { data: s } = await supabase().from("store_settings").select("*").maybeSingle();
  const st = s ? storeStatus(s) : null;
  const label = st ? (st.open ? "Open until 3AM" : st.reason ?? "Closed") : "Open 6PM to 3AM";
  return <main><Hero status={label} /></main>;
}
