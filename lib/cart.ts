"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
export type CartModifier = { id: string; name: string; deltaCents: number };
export type CartLine = { key: string; itemId: string; slug: string; name: string; basePriceCents: number; quantity: number; modifiers: CartModifier[]; notes: string };
type CartState = {
  lines: CartLine[];
  fulfillment: "pickup" | "delivery";
  tipPercent: 0 | 10 | 15 | 20;
  add: (l: Omit<CartLine, "key">) => void;
  setQty: (key: string, q: number) => void;
  remove: (key: string) => void;
  setFulfillment: (f: "pickup" | "delivery") => void;
  setTip: (t: 0 | 10 | 15 | 20) => void;
  clear: () => void;
};
export const lineUnitCents = (l: CartLine) => l.basePriceCents + l.modifiers.reduce((s, m) => s + m.deltaCents, 0);
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [], fulfillment: "pickup", tipPercent: 15,
      add: (l) => set((s) => ({ lines: [...s.lines, { ...l, key: crypto.randomUUID() }] })),
      setQty: (key, q) => set((s) => ({ lines: s.lines.map((l) => (l.key === key ? { ...l, quantity: Math.max(1, Math.min(20, q)) } : l)) })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      setFulfillment: (fulfillment) => set({ fulfillment }),
      setTip: (tipPercent) => set({ tipPercent }),
      clear: () => set({ lines: [] }),
    }),
    { name: "late-shift-cart" }
  )
);
