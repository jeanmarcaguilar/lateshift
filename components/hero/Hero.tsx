"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

// Full-screen photos live in /public/food/<slug>.png (landscape, around 1920x1080 works best).
const SLIDES = [
  { slug: "the-double", tag: "House favorite", title: "The Double", text: "Two smashed patties, double cheese, grilled onion. Built for 2AM.", glow: "#FF5A1F" },
  { slug: "fountain-soda", tag: "Ice cold", title: "Fountain Soda", text: "Ice-cold fountain soda with free refills in the dining room.", glow: "#E63B1F" },
  { slug: "shift-fries", tag: "Fried to order", title: "Shift Fries", text: "Skin-on, fried when you order, salted hard. Never from the freezer.", glow: "#F5C542" },
  { slug: "onion-rings", tag: "Thick cut", title: "Onion Rings", text: "Beer-battered, thick cut, crunchy all the way through.", glow: "#E0A33E" },
  { slug: "vanilla-shake", tag: "Hand-spun", title: "Vanilla Shake", text: "Real vanilla bean, thick enough to need a spoon.", glow: "#D9A066" },
];
const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

export default function Hero({ status }: { status: string }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const go = useCallback((n: number) => setI((n + SLIDES.length) % SLIDES.length), []);

  useEffect(() => { setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  useEffect(() => {
    if (paused || reduce) return;
    const t = window.setInterval(() => setI((c) => (c + 1) % SLIDES.length), 6000);
    return () => window.clearInterval(t);
  }, [paused, reduce, i]);

  return (
    <section className="relative h-[100svh] min-h-[620px] overflow-hidden bg-ink" aria-roledescription="carousel" aria-label="Featured food"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      onKeyDown={(e) => { if (e.key === "ArrowRight") go(i + 1); if (e.key === "ArrowLeft") go(i - 1); }}>
      {/* Full-screen photo backdrops: cross-fade, settle from 110% to 100%, then a slow drift */}
      {SLIDES.map((s, n) => {
        const on = n === i;
        return (
          <div key={s.slug} aria-hidden="true" className={`absolute inset-0 transition-all duration-700 ${EASE} ${on ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}
            style={{ background: `radial-gradient(60% 60% at 70% 50%, ${s.glow}66, #0B0B0C 75%)` }}>
            {!broken[s.slug] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/food/${s.slug}.png`} alt="" onError={() => setBroken((b) => ({ ...b, [s.slug]: true }))} className="h-full w-full animate-drift object-cover motion-reduce:animate-none" />
            )}
          </div>
        );
      })}
      {/* Readability overlays */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/50 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/90 to-transparent" />
      <p className="absolute left-4 top-6 z-20 text-sm text-amber md:left-10" role="status">{status}</p>

      {SLIDES.map((s, n) => {
        const on = n === i;
        const stagger = (k: number) => ({ transitionDelay: on ? `${200 + k * 120}ms` : "0ms" });
        const rise = `transition-all duration-700 ${EASE} ${on ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`;
        return (
          <div key={s.slug} aria-hidden={!on} role="group" aria-roledescription="slide" aria-label={`${n + 1} of ${SLIDES.length}`}
            className={`absolute inset-0 z-10 mx-auto flex max-w-6xl items-end px-4 pb-28 transition-opacity duration-700 ${EASE} md:items-center md:px-10 md:pb-0 ${on ? "opacity-100" : "pointer-events-none opacity-0"}`}>
            <div className="max-w-xl">
              <p className={`${rise} text-sm uppercase tracking-widest text-amber`} style={stagger(0)}>{s.tag}</p>
              <h1 className={`${rise} mt-2 text-display-lg`} style={stagger(1)}>{s.title}</h1>
              <p className={`${rise} mt-4 text-lg text-paper/90`} style={stagger(2)}>{s.text}</p>
              <div className={`${rise} mt-8 flex gap-3`} style={stagger(3)}>
                <Link href={`/menu/${s.slug}`} tabIndex={on ? 0 : -1} className="rounded bg-ember px-8 py-4 text-lg font-semibold text-ink">Order Now</Link>
                <Link href="/menu" tabIndex={on ? 0 : -1} className="rounded border border-white/40 bg-ink/40 px-8 py-4 text-lg">Full menu</Link>
              </div>
            </div>
          </div>
        );
      })}

      <div className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-center gap-5">
        <button onClick={() => go(i - 1)} aria-label="Previous slide" className="grid h-11 w-11 place-items-center rounded-full border border-white/40 bg-ink/40 transition hover:border-ember">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div className="flex gap-2" role="tablist" aria-label="Choose slide">
          {SLIDES.map((s, n) => (<button key={s.slug} role="tab" aria-selected={n === i} aria-label={`Show ${s.title}`} onClick={() => go(n)} className={`h-2 rounded-full transition-all duration-700 ${EASE} ${n === i ? "w-8 bg-ember" : "w-2 bg-white/50"}`} />))}
        </div>
        <button onClick={() => go(i + 1)} aria-label="Next slide" className="grid h-11 w-11 place-items-center rounded-full border border-white/40 bg-ink/40 transition hover:border-ember">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </section>
  );
}
