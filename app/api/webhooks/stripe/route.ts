import { NextResponse } from "next/server";
import Stripe from "stripe";
import { admin } from "@/lib/admin";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text(); // raw body is required for signature verification
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(raw, sig ?? "", process.env.STRIPE_WEBHOOK_SECRET!); }
  catch { return NextResponse.json({ error: "Bad signature" }, { status: 400 }); }
  if (event.type !== "payment_intent.succeeded") return NextResponse.json({ ok: true });

  const pi = event.data.object as Stripe.PaymentIntent;
  const orderId = pi.metadata.order_id;
  if (!orderId) return NextResponse.json({ ok: true });
  const db = admin();
  // provider_ref is UNIQUE: a replayed event hits 23505 and creates no second payment row.
  const { error } = await db.from("payments").insert({ order_id: orderId, provider: "stripe", provider_ref: pi.id, amount_cents: pi.amount_received, status: "succeeded", raw_payload: pi as unknown as Record<string, unknown> });
  if (error) return error.code === "23505" ? NextResponse.json({ ok: true, duplicate: true }) : NextResponse.json({ error: "db" }, { status: 500 }); // 500 makes Stripe retry
  const { data: moved } = await db.from("orders").update({ status: "accepted", stripe_payment_intent_id: pi.id, updated_at: new Date().toISOString() }).eq("id", orderId).eq("status", "placed").select("id");
  if (moved?.length) await db.from("order_events").insert({ order_id: orderId, from_status: "placed", to_status: "accepted" });
  // Realtime reaches /admin and /order/[id] automatically via the orders table change. Email comes in step 9.
  return NextResponse.json({ ok: true });
}
