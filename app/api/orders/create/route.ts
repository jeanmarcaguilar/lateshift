import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { admin } from "@/lib/admin";
import { PricingError, priceCart } from "@/lib/pricing";
import { storeStatus } from "@/lib/store-hours";

const Body = z.object({
  items: z.array(z.object({ itemId: z.string().uuid(), quantity: z.number().int().min(1).max(20), modifierIds: z.array(z.string().uuid()).max(20), notes: z.string().max(200).optional() })).min(1).max(40),
  fulfillment: z.enum(["pickup", "delivery"]),
  tipPercent: z.union([z.literal(0), z.literal(10), z.literal(15), z.literal(20)]),
  customerName: z.string().trim().min(1).max(80),
  customerPhone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/),
  scheduledFor: z.string().datetime().optional(),
  notes: z.string().max(300).optional(),
  clientTotalCents: z.number().int(),
});

// Best-effort limiter (per server instance). Swap for a shared store before launch.
const hits = new Map<string, number[]>();
const limited = (ip: string) => { const now = Date.now(); const h = (hits.get(ip) ?? []).filter((t) => now - t < 60_000); h.push(now); hits.set(ip, h); return h.length > 8; };

export async function POST(req: Request) {
  if (limited(req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local")) return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid order." }, { status: 400 });
  const b = parsed.data;
  const db = admin();
  const { data: s } = await db.from("store_settings").select("*").maybeSingle();
  if (!s) return NextResponse.json({ error: "Store is not configured." }, { status: 500 });
  const status = storeStatus(s);
  if (!status.open) return NextResponse.json({ error: status.reason }, { status: 409 });
  let priced;
  try { priced = await priceCart({ items: b.items, fulfillment: b.fulfillment, tipPercent: b.tipPercent }, s); }
  catch (e) { if (e instanceof PricingError) return NextResponse.json({ error: e.message }, { status: 400 }); throw e; }
  if (priced.total !== b.clientTotalCents) return NextResponse.json({ error: "Prices changed. Please review your cart." }, { status: 400 });

  const { data: order, error } = await db.from("orders").insert({
    customer_name: b.customerName, customer_phone: b.customerPhone, fulfillment: b.fulfillment, status: "placed",
    subtotal_cents: priced.subtotal, tax_cents: priced.tax, tip_cents: priced.tip, delivery_fee_cents: priced.fee, discount_cents: priced.discount, total_cents: priced.total,
    scheduled_for: b.scheduledFor ?? null, notes: b.notes ?? null,
  }).select("id, order_number").single();
  if (error || !order) return NextResponse.json({ error: "Could not create order." }, { status: 500 });
  try {
    for (const l of priced.lines) {
      const { data: oi, error: e1 } = await db.from("order_items").insert({ order_id: order.id, menu_item_id: l.itemId, name_snapshot: l.name, unit_price_cents: l.unitCents, quantity: l.quantity, notes: l.notes }).select("id").single();
      if (e1 || !oi) throw e1;
      if (l.mods.length) { const { error: e2 } = await db.from("order_item_modifiers").insert(l.mods.map((m) => ({ order_item_id: oi.id, modifier_id: m.id, name_snapshot: m.name, price_delta_cents: m.delta }))); if (e2) throw e2; }
    }
    await db.from("order_events").insert({ order_id: order.id, from_status: null, to_status: "placed" });
    const session = await new Stripe(process.env.STRIPE_SECRET_KEY!).checkout.sessions.create({
      mode: "payment", metadata: { order_id: order.id }, payment_intent_data: { metadata: { order_id: order.id } },
      line_items: [{ quantity: 1, price_data: { currency: "php", unit_amount: priced.total, product_data: { name: `The Late Shift, order #${order.order_number}` } } }],
      ui_mode: "embedded", redirect_on_completion: "never", // payment form is embedded in our modal
    });
    return NextResponse.json({ clientSecret: session.client_secret, orderId: order.id, orderNumber: order.order_number });
  } catch {
    await db.from("orders").delete().eq("id", order.id); // cascades to lines; never leave a half-built order
    return NextResponse.json({ error: "Could not start payment." }, { status: 500 });
  }
}
