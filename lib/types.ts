export type Modifier = { id: string; name: string; price_delta_cents: number; is_available: boolean; sort_order: number };
export type ModifierGroup = { id: string; name: string; selection_type: "single" | "multi"; min_select: number; max_select: number; is_required: boolean; modifiers: Modifier[] };
export type MenuItem = { id: string; name: string; slug: string; description: string | null; price_cents: number; calories: number | null; allergens: string[]; dietary_tags: string[]; is_available: boolean };
// Money is stored in centavos. 59900 centavos shows as ₱599
export const money = (cents: number) =>
  `₱${(cents / 100).toLocaleString("en-PH", { minimumFractionDigits: cents % 100 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
