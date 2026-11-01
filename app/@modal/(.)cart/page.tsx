import Modal from "@/components/Modal";
import { supabase } from "@/lib/supabase";
import CartView from "@/app/cart/CartView";
export const dynamic = "force-dynamic";
export default async function CartModal() {
  const { data } = await supabase().from("store_settings").select("tax_rate_bps, delivery_fee_cents, delivery_minimum_cents").maybeSingle();
  return <Modal label="Your order"><CartView taxBps={data?.tax_rate_bps ?? 1200} deliveryFee={data?.delivery_fee_cents ?? 15000} deliveryMin={data?.delivery_minimum_cents ?? 50000} /></Modal>;
}
