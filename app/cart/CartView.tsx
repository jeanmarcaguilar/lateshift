"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { lineUnitCents, useCart } from "@/lib/cart";
import { money } from "@/lib/types";
export default function CartView({ taxBps, deliveryFee, deliveryMin }: { taxBps: number; deliveryFee: number; deliveryMin: number }) {
  const { lines, fulfillment, tipPercent, setQty, remove, setFulfillment, setTip } = useCart();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []); // avoid hydration mismatch from persisted store
  if (!ready) return <main className="mx-auto max-w-2xl px-4 pt-10"><h1 className="text-display-md">Your Order</h1></main>;
  const subtotal = lines.reduce((s, l) => s + lineUnitCents(l) * l.quantity, 0);
  const tax = Math.round((subtotal * taxBps) / 10000);
  const tip = Math.round((subtotal * tipPercent) / 100);
  const fee = fulfillment === "delivery" && subtotal > 0 ? deliveryFee : 0;
  const total = subtotal + tax + tip + fee;
  const belowMin = fulfillment === "delivery" && subtotal < deliveryMin;
  if (lines.length === 0) return (<main className="mx-auto max-w-2xl px-4 pt-10"><h1 className="text-display-md">Your Order</h1><p className="mt-6 text-lg">Nothing here yet.</p><Link href="/menu" className="mt-6 inline-block rounded bg-ember px-6 py-3 font-semibold text-ink">See the menu</Link></main>);
  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-10">
      <h1 className="text-display-md">Your Order</h1>
      <div className="mt-6 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Fulfillment">
        {(["pickup", "delivery"] as const).map((f) => (<button key={f} role="radio" aria-checked={fulfillment === f} onClick={() => setFulfillment(f)} className={`rounded py-3 capitalize ${fulfillment === f ? "bg-ember text-ink" : "border border-white/30"}`}>{f}</button>))}
      </div>
      <ul className="mt-6 divide-y divide-white/10">
        {lines.map((l) => (
          <li key={l.key} className="py-4">
            <div className="flex justify-between gap-4"><span className="text-xl">{l.quantity} × {l.name}</span><span>{money(lineUnitCents(l) * l.quantity)}</span></div>
            {l.modifiers.length > 0 && <p className="text-sm text-paper/60">{l.modifiers.map((m) => m.name).join(", ")}</p>}
            {l.notes && <p className="text-sm text-paper/60">“{l.notes}”</p>}
            <div className="mt-2 flex gap-3 text-sm">
              <button onClick={() => setQty(l.key, l.quantity - 1)} aria-label={`Fewer ${l.name}`} className="h-9 w-9 rounded border border-white/30">−</button>
              <button onClick={() => setQty(l.key, l.quantity + 1)} aria-label={`More ${l.name}`} className="h-9 w-9 rounded border border-white/30">+</button>
              <Link href={`/menu/${l.slug}`} className="self-center underline">Edit</Link>
              <button onClick={() => remove(l.key)} className="self-center text-ember underline">Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6" role="radiogroup" aria-label="Tip">
        <p className="mb-2">Tip</p>
        <div className="grid grid-cols-4 gap-2">{([0, 10, 15, 20] as const).map((t) => (<button key={t} role="radio" aria-checked={tipPercent === t} onClick={() => setTip(t)} className={`rounded py-3 ${tipPercent === t ? "bg-amber text-ink" : "border border-white/30"}`}>{t === 0 ? "None" : `${t}%`}</button>))}</div>
      </div>
      <dl className="mt-6 space-y-1">
        {([["Subtotal", subtotal], ["Tax", tax], ["Tip", tip], ...(fee ? [["Delivery", fee] as [string, number]] : [])] as [string, number][]).map(([k, v]) => (<div key={k} className="flex justify-between"><dt>{k}</dt><dd>{money(v)}</dd></div>))}
        <div className="flex justify-between pt-2 text-2xl"><dt>Total</dt><dd>{money(total)}</dd></div>
      </dl>
      {belowMin && <p role="alert" className="mt-4 text-amber">Delivery minimum is {money(deliveryMin)}. Add {money(deliveryMin - subtotal)} more or switch to pickup.</p>}
      {belowMin ? <button disabled className="mt-6 w-full rounded bg-ember py-4 text-lg font-semibold text-ink opacity-40">Checkout</button> : <Link href="/checkout" className="mt-6 block w-full rounded bg-ember py-4 text-center text-lg font-semibold text-ink">Checkout · {money(total)}</Link>}
      <p className="mt-4 text-xs text-paper/50">Totals here are a preview. The server recomputes every price at checkout.</p>
    </main>
  );
}
