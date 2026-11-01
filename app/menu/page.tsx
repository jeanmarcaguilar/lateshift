import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { money, type MenuItem } from "@/lib/types";
export const dynamic = "force-dynamic"; // 86'd items must vanish immediately
type Item = MenuItem & { sort_order: number };
type Cat = { id: string; name: string; slug: string; menu_items: Item[] };
const TAGS = ["vegetarian", "spicy", "gluten-free"];

export default async function MenuPage({ searchParams }: { searchParams: Promise<{ q?: string; tag?: string }> }) {
  const { q = "", tag = "" } = await searchParams;
  const { data } = await supabase()
    .from("categories")
    .select("id,name,slug,menu_items(id,name,slug,description,price_cents,calories,allergens,dietary_tags,is_available,sort_order)")
    .eq("is_active", true).order("sort_order");
  const cats = ((data ?? []) as Cat[]).map((c) => ({
    ...c,
    menu_items: c.menu_items.filter((i) => i.is_available && (!q || i.name.toLowerCase().includes(q.toLowerCase())) && (!tag || i.dietary_tags.includes(tag)))
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
  })).filter((c) => c.menu_items.length > 0);

  return (
    <div className="relative min-h-screen">
      {/* Background: optional photo at /public/food/menu-bg.png under warm glows and a dark veil */}
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(180deg, rgba(11,11,12,0.82), rgba(11,11,12,0.96)), radial-gradient(60% 40% at 85% 0%, rgba(255,90,31,0.28), transparent 70%), radial-gradient(50% 40% at 0% 60%, rgba(245,197,66,0.14), transparent 70%), url('/food/menu-bg.png')" }} />
      <main className="mx-auto max-w-6xl px-4 pb-24 md:px-8">
        <header className="pt-14 text-center md:pt-20">
          <p className="text-sm uppercase tracking-[0.3em] text-amber">6PM to 3AM · Smashed to order</p>
          <h1 className="mt-3 text-display-lg">The Menu</h1>
          <p className="mx-auto mt-4 max-w-md text-paper/70">Fresh beef, never frozen. Pick your favorite and we&apos;ll fire it up.</p>
        </header>

        <form className="mx-auto mt-8 flex max-w-xl gap-2" role="search">
          <input name="q" defaultValue={q} placeholder="Search the menu" aria-label="Search the menu" className="flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 backdrop-blur placeholder:text-paper/40 focus:border-ember focus:outline-none" />
          <button className="rounded-full bg-ember px-6 py-3 font-semibold text-ink">Search</button>
        </form>
        <div className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Filters">
          {TAGS.map((t) => (<Link key={t} href={tag === t ? "/menu" : `/menu?tag=${t}`} className={`rounded-full border px-4 py-2 text-sm capitalize backdrop-blur transition ${tag === t ? "border-ember bg-ember text-ink" : "border-white/20 bg-white/5 hover:border-ember"}`}>{t}</Link>))}
        </div>

        <nav className="sticky top-0 z-40 -mx-4 mt-8 flex justify-center gap-3 overflow-x-auto bg-ink/70 px-4 py-3 backdrop-blur-md" aria-label="Categories">
          {cats.map((c) => (<a key={c.id} href={`#${c.slug}`} className="whitespace-nowrap rounded-full border border-white/15 px-5 py-2 font-display text-lg uppercase tracking-wide text-amber transition hover:border-amber hover:bg-amber/10">{c.name}</a>))}
        </nav>

        {cats.length === 0 && <p className="mt-16 text-center text-lg">Nothing matches. Try clearing the filters.</p>}
        {cats.map((c) => (
          <section key={c.id} id={c.slug} className="scroll-mt-20 pt-14">
            <div className="flex items-center gap-4">
              <h2 className="text-display-md">{c.name}</h2>
              <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-ember/60 to-transparent" />
            </div>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {c.menu_items.map((i) => (
                <li key={i.id}>
                  <Link href={`/menu/${i.slug}`} className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur transition duration-500 hover:-translate-y-1 hover:border-ember/70 hover:shadow-[0_20px_50px_-20px_rgba(255,90,31,0.5)]">
                    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-ember/30 via-ink to-amber/20">
                      <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105" style={{ backgroundImage: `url('/food/${i.slug}.png')` }} />
                      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                      <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-sm font-semibold text-amber backdrop-blur">{money(i.price_cents)}</span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-2xl">{i.name}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-paper/70">{i.description}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-paper/60">
                        {i.calories != null && <span>{i.calories} cal</span>}
                        {i.dietary_tags.map((t) => <span key={t} className="rounded-full border border-white/15 px-2 py-0.5">{t}</span>)}
                      </div>
                      {i.allergens.length > 0 && <p className="mt-2 text-xs text-paper/50">Contains: {i.allergens.join(", ")}</p>}
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ember">Customize &amp; add <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span></span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
