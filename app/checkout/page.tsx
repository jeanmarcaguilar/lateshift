import { supabase } from "@/lib/supabase";
import CheckoutView from "@/components/CheckoutView";
export const dynamic = "force-dynamic";
export default async function CheckoutPage() {
  const { data } = await supabase().from("store_settings").select("tax_rate_bps, delivery_fee_cents, delivery_minimum_cents").maybeSingle();
  return <main className="mx-auto max-w-2xl px-5 pt-8"><CheckoutView taxBps={data?.tax_rate_bps ?? 1200} deliveryFee={data?.delivery_fee_cents ?? 15000} deliveryMin={data?.delivery_minimum_cents ?? 50000} /></main>;
}
