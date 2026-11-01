import Modal from "@/components/Modal";
import { supabase } from "@/lib/supabase";
import CheckoutView from "@/components/CheckoutView";
export const dynamic = "force-dynamic";
export default async function CheckoutModal() {
  const { data } = await supabase().from("store_settings").select("tax_rate_bps, delivery_fee_cents, delivery_minimum_cents").maybeSingle();
  return <Modal label="Checkout"><CheckoutView taxBps={data?.tax_rate_bps ?? 1200} deliveryFee={data?.delivery_fee_cents ?? 15000} deliveryMin={data?.delivery_minimum_cents ?? 50000} /></Modal>;
}
