import { supabase } from "@/lib/supabase";
import CartView from "./CartView";
export const dynamic = "force-dynamic";
export default async function CartPage() {
  const { data } = await supabase().from("store_settings").select("tax_rate_bps, delivery_fee_cents, delivery_minimum_cents").maybeSingle();
  return <CartView taxBps={data?.tax_rate_bps ?? 825} deliveryFee={data?.delivery_fee_cents ?? 399} deliveryMin={data?.delivery_minimum_cents ?? 1500} />;
}
