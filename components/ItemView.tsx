import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { money, type MenuItem, type ModifierGroup } from "@/lib/types";
import AddToCart from "./AddToCart";
type Row = MenuItem & { menu_item_modifier_groups: { sort_order: number; modifier_groups: ModifierGroup }[] };
export default async function ItemView({ slug }: { slug: string }) {
  const { data } = await supabase().from("menu_items")
    .select("*, menu_item_modifier_groups(sort_order, modifier_groups(*, modifiers(*)))")
    .eq("slug", slug).eq("is_available", true).maybeSingle();
  if (!data) notFound();
  const item = data as Row;
  const groups = item.menu_item_modifier_groups.sort((a, b) => a.sort_order - b.sort_order)
    .map((g) => ({ ...g.modifier_groups, modifiers: g.modifier_groups.modifiers.filter((m) => m.is_available).sort((a, b) => a.sort_order - b.sort_order) }));
  return (
    <div>
      <div className="relative -mx-5 -mt-6 h-48 overflow-hidden bg-gradient-to-br from-ember/30 via-ink to-amber/20 sm:h-56">
        <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('/food/${item.slug}.png')` }} />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="mt-4 text-display-md">{item.name}</h1>
        <span className="text-xl text-amber">{money(item.price_cents)}</span>
      </div>
      <p className="mt-3 text-paper/80">{item.description}</p>
      <p className="mt-2 text-sm text-paper/60">{item.calories} cal{item.allergens.length > 0 && <> · Contains: {item.allergens.join(", ")}</>}</p>
      <AddToCart item={{ id: item.id, slug: item.slug, name: item.name, price_cents: item.price_cents }} groups={groups} />
    </div>
  );
}
