import { admin } from "./admin";
export class PricingError extends Error {}
export type CartInput = { items: { itemId: string; quantity: number; modifierIds: string[]; notes?: string }[]; fulfillment: "pickup" | "delivery"; tipPercent: 0 | 10 | 15 | 20 };
export type Settings = { tax_rate_bps: number; delivery_fee_cents: number; delivery_minimum_cents: number };
type Mod = { id: string; name: string; price_delta_cents: number; is_available: boolean };
type Grp = { id: string; min_select: number; max_select: number; is_required: boolean; modifiers: Mod[] };
type Row = { id: string; name: string; price_cents: number; is_available: boolean; menu_item_modifier_groups: { modifier_groups: Grp }[] };
export type PricedLine = { itemId: string; name: string; unitCents: number; quantity: number; notes: string | null; mods: { id: string; name: string; delta: number }[] };

// Every cent comes from the database. Client-sent prices are never trusted.
export async function priceCart(input: CartInput, s: Settings) {
  const ids = [...new Set(input.items.map((i) => i.itemId))];
  const { data, error } = await admin().from("menu_items")
    .select("id,name,price_cents,is_available,menu_item_modifier_groups(modifier_groups(id,min_select,max_select,is_required,modifiers(id,name,price_delta_cents,is_available)))")
    .in("id", ids);
  if (error) throw new Error(error.message);
  const byId = new Map((data as unknown as Row[]).map((r) => [r.id, r]));
  const lines: PricedLine[] = input.items.map((it) => {
    const row = byId.get(it.itemId);
    if (!row || !row.is_available) throw new PricingError("An item in your cart is no longer available.");
    const groups = row.menu_item_modifier_groups.map((g) => g.modifier_groups);
    const allMods = new Map(groups.flatMap((g) => g.modifiers).map((m) => [m.id, m]));
    const picked = [...new Set(it.modifierIds)].map((id) => {
      const m = allMods.get(id);
      if (!m || !m.is_available) throw new PricingError(`An option on ${row.name} is not available.`);
      return m;
    });
    for (const g of groups) {
      const n = picked.filter((m) => g.modifiers.some((x) => x.id === m.id)).length;
      if (n < (g.is_required ? Math.max(1, g.min_select) : g.min_select) || n > g.max_select) throw new PricingError(`Check your choices on ${row.name}.`);
    }
    return { itemId: row.id, name: row.name, quantity: it.quantity, notes: it.notes?.trim() || null,
      unitCents: row.price_cents + picked.reduce((a, m) => a + m.price_delta_cents, 0),
      mods: picked.map((m) => ({ id: m.id, name: m.name, delta: m.price_delta_cents })) };
  });
  const subtotal = lines.reduce((a, l) => a + l.unitCents * l.quantity, 0);
  const discount = 0; // promos arrive in step 9; tax is already computed on the discounted subtotal
  const tax = Math.round(((subtotal - discount) * s.tax_rate_bps) / 10000);
  const tip = Math.round((subtotal * input.tipPercent) / 100);
  const fee = input.fulfillment === "delivery" ? s.delivery_fee_cents : 0;
  if (input.fulfillment === "delivery" && subtotal < s.delivery_minimum_cents) throw new PricingError(`Delivery minimum is ₱${(s.delivery_minimum_cents / 100).toLocaleString("en-PH")}.`);
  return { lines, subtotal, discount, tax, tip, fee, total: subtotal - discount + tax + tip + fee };
}
