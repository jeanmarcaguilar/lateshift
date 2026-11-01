"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { lineUnitCents, useCart } from "@/lib/cart";
import { money } from "@/lib/types";

type Embedded = { mount: (el: HTMLElement) => void; destroy: () => void };
type StripeJs = { initEmbeddedCheckout: (o: { fetchClientSecret: () => Promise<string>; onComplete?: () => void }) => Promise<Embedded> };
declare global { interface Window { Stripe?: (key: string) => StripeJs } }

// Stripe.js must be loaded from Stripe. We inject the script tag, so no extra npm package is needed.
let stripePromise: Promise<StripeJs> | null = null;
const getStripe = () => (stripePromise ??= new Promise<StripeJs>((resolve, reject) => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  const make = () => (window.Stripe ? resolve(window.Stripe(key)) : reject(new Error("Stripe failed to load.")));
  if (window.Stripe) return make();
  const s = document.createElement("script");
  s.src = "https://js.stripe.com/v3"; s.onload = make; s.onerror = () => reject(new Error("Stripe failed to load."));
  document.head.appendChild(s);
}));

type Props = { taxBps: number; deliveryFee: number; deliveryMin: number };
export default function CheckoutView({ taxBps, deliveryFee, deliveryMin }: Props) {
  const { lines, fulfillment, tipPercent, clear } = useCart();
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState<"form" | "pay" | "done">("form");
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [address, setAddress] = useState(""); const [notes, setNotes] = useState("");
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const [secret, setSecret] = useState(""); const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => setReady(true), []);

  useEffect(() => {
    if (stage !== "pay" || !secret || !mountRef.current) return;
    let live: Embedded | null = null; let cancelled = false;
    getStripe().then((stripe) => stripe.initEmbeddedCheckout({ fetchClientSecret: async () => secret, onComplete: () => { clear(); setStage("done"); } }))
      .then((c) => { if (cancelled) return c.destroy(); live = c; if (mountRef.current) c.mount(mountRef.current); })
      .catch((e: Error) => { setError(e.message); setStage("form"); });
    return () => { cancelled = true; live?.destroy(); };
  }, [stage, secret, clear]);

  if (!ready) return <div className="py-10"><h1 className="text-display-md">Checkout</h1></div>;
  if (stage === "done") return (
    <div className="py-10 text-center">
      <h1 className="text-display-md">Order placed</h1>
      <p className="mt-4 text-lg text-paper/80">{orderNumber ? `Order #${orderNumber} is in.` : "Your order is in."} Thanks, {name.split(" ")[0] || "friend"}! We&apos;re firing it up now.</p>
      <Link href="/menu" className="mt-8 inline-block rounded bg-ember px-8 py-4 font-semibold text-ink">Back to the menu</Link>
    </div>
  );
  if (lines.length === 0) return (<div className="py-10"><h1 className="text-display-md">Checkout</h1><p className="mt-4">Your cart is empty.</p><Link href="/menu" className="mt-6 inline-block rounded bg-ember px-6 py-3 font-semibold text-ink">See the menu</Link></div>);

  const subtotal = lines.reduce((s, l) => s + lineUnitCents(l) * l.quantity, 0);
  const tax = Math.round((subtotal * taxBps) / 10000);
  const tip = Math.round((subtotal * tipPercent) / 100);
  const fee = fulfillment === "delivery" ? deliveryFee : 0;
  const total = subtotal + tax + tip + fee;

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (fulfillment === "delivery" && !address.trim()) return setError("Please enter your delivery address.");
    setBusy(true);
    try {
      const res = await fetch("/api/orders/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        items: lines.map((l) => ({ itemId: l.itemId, quantity: l.quantity, modifierIds: l.modifiers.map((m) => m.id), notes: l.notes || undefined })),
        fulfillment, tipPercent, customerName: name, customerPhone: phone, clientTotalCents: total,
        notes: [fulfillment === "delivery" ? `Delivery address: ${address}` : "", notes].filter(Boolean).join("\n") || undefined,
      }) });
      const data = (await res.json()) as { clientSecret?: string; orderNumber?: number; error?: string };
      if (!res.ok || !data.clientSecret) { setError(data.error ?? "Could not start checkout."); return; }
      setSecret(data.clientSecret); setOrderNumber(data.orderNumber ?? null); setStage("pay");
    } catch { setError("Network problem. Please try again."); } finally { setBusy(false); }
  }

  return (
    <div className="pb-6">
      <h1 className="text-display-md">Checkout</h1>
      <p className="mt-1 text-paper/70 capitalize">{fulfillment} · {lines.reduce((n, l) => n + l.quantity, 0)} items · <span className="text-amber">{money(total)}</span></p>
      {error && <p role="alert" className="mt-4 rounded border border-ember/60 bg-ember/10 p-3 text-sm">{error}</p>}
      {stage === "form" ? (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">Name<input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="mt-1 w-full rounded bg-white/10 px-4 py-3" /></label>
          <label className="block">Mobile number<input required type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="0917 123 4567" className="mt-1 w-full rounded bg-white/10 px-4 py-3" /></label>
          {fulfillment === "delivery" && <label className="block">Delivery address<textarea required maxLength={200} value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 w-full rounded bg-white/10 p-3" /></label>}
          <label className="block">Notes for the kitchen (optional)<input maxLength={200} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full rounded bg-white/10 px-4 py-3" /></label>
          {fulfillment === "delivery" && subtotal < deliveryMin && <p role="alert" className="text-amber">Delivery minimum is {money(deliveryMin)}.</p>}
          <button disabled={busy} className="w-full rounded bg-ember py-4 text-lg font-semibold text-ink disabled:opacity-50">{busy ? "One moment…" : `Continue to payment · ${money(total)}`}</button>
        </form>
      ) : (<div ref={mountRef} className="mt-6 min-h-[300px] overflow-hidden rounded-xl bg-white" />)}
    </div>
  );
}
