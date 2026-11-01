"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { money, type ModifierGroup } from "@/lib/types";
type Props = { item: { id: string; slug: string; name: string; price_cents: number }; groups: ModifierGroup[] };
export default function AddToCart({ item, groups }: Props) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [sel, setSel] = useState<Record<string, string[]>>(() => Object.fromEntries(groups.map((g) => [g.id, g.is_required && g.modifiers[0] ? [g.modifiers[0].id] : []])));
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const chosen = groups.flatMap((g) => g.modifiers.filter((m) => sel[g.id]?.includes(m.id)));
  const unit = item.price_cents + chosen.reduce((s, m) => s + m.price_delta_cents, 0);
  const valid = groups.every((g) => { const n = sel[g.id]?.length ?? 0; return n >= (g.is_required ? Math.max(1, g.min_select) : g.min_select) && n <= g.max_select; });
  const toggle = (g: ModifierGroup, id: string) => setSel((s) => {
    const cur = s[g.id] ?? [];
    if (g.selection_type === "single") return { ...s, [g.id]: [id] };
    if (cur.includes(id)) return { ...s, [g.id]: cur.filter((x) => x !== id) };
    return cur.length >= g.max_select ? s : { ...s, [g.id]: [...cur, id] };
  });
  const submit = () => {
    add({ itemId: item.id, slug: item.slug, name: item.name, basePriceCents: item.price_cents, quantity: qty, notes, modifiers: chosen.map((m) => ({ id: m.id, name: m.name, deltaCents: m.price_delta_cents })) });
    router.push("/cart");
  };
  return (
    <div className="mt-8 space-y-8">
      {groups.map((g) => (
        <fieldset key={g.id}>
          <legend className="text-2xl">{g.name} <span className="font-sans text-sm normal-case text-paper/60">{g.is_required ? "Required" : `Optional, up to ${g.max_select}`}</span></legend>
          <div className="mt-3 space-y-2">
            {g.modifiers.map((m) => (
              <label key={m.id} className="flex cursor-pointer items-center justify-between rounded border border-white/15 px-4 py-3 has-[:checked]:border-ember">
                <span className="flex items-center gap-3">
                  <input type={g.selection_type === "single" ? "radio" : "checkbox"} name={g.id} checked={sel[g.id]?.includes(m.id) ?? false} onChange={() => toggle(g, m.id)} className="accent-ember" />
                  {m.name}
                </span>
                {m.price_delta_cents > 0 && <span className="text-amber">+{money(m.price_delta_cents)}</span>}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <label className="block">Special instructions
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={200} className="mt-2 w-full rounded bg-white/10 p-3" />
      </label>
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 bg-ink/95 p-4">
        <div className="flex items-center gap-3" role="group" aria-label="Quantity">
          <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity" className="h-11 w-11 rounded border border-white/30">−</button>
          <span aria-live="polite" className="w-6 text-center">{qty}</span>
          <button onClick={() => setQty(Math.min(20, qty + 1))} aria-label="Increase quantity" className="h-11 w-11 rounded border border-white/30">+</button>
        </div>
        <button disabled={!valid} onClick={submit} className="h-12 flex-1 rounded bg-ember font-semibold text-ink disabled:opacity-40">Add to cart · {money(unit * qty)}</button>
      </div>
    </div>
  );
}
