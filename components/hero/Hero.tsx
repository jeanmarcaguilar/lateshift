"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// Full-screen photos live in /public/food/<slug>.png (landscape, around 1920x1080 works best).
const SLIDES = [
  { slug: "the-double", tag: "House favorite", title: "The Double", text: "Two smashed patties, double cheese, grilled onion. Built for 2AM.", glow: "#FF5A1F" },
  { slug: "fountain-soda", tag: "Ice cold", title: "Fountain Soda", text: "Ice-cold fountain soda with free refills in the dining room.", glow: "#E63B1F" },
  { slug: "shift-fries", tag: "Fried to order", title: "Shift Fries", text: "Skin-on, fried when you order, salted hard. Never from the freezer.", glow: "#F5C542" },
  { slug: "onion-rings", tag: "Thick cut", title: "Onion Rings", text: "Beer-battered, thick cut, crunchy all the way through.", glow: "#E0A33E" },
  { slug: "vanilla-shake", tag: "Hand-spun", title: "Vanilla Shake", text: "Real vanilla bean, thick enough to need a spoon.", glow: "#D9A066" },
];
const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const INTERVAL = 6000;

export default function Hero(_props: { status?: string }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const touchX = useRef<number | null>(null);
  const go = useCallback((n: number) => setI((n + SLIDES.length) % SLIDES.length), []);

  useEffect(() => { setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  // Autoplay. Only a real mouse hovering (or keyboard focus) pauses it, so touch screens never get stuck.
  useEffect(() => {
    if (paused || reduce) return;
    const t = window.setInterval(() => setI((c) => (c + 1) % SLIDES.length), INTERVAL);
    return () => window.clearInterval(t);
  }, [paused, reduce, i]);

  return (
    <section className="relative h-[100svh] min-h-[560px] touch-pan-y overflow-hidden bg-ink" aria-roledescription="carousel" aria-label="Featured food"
      onPointerEnter={(e) => { if (e.pointerType === "mouse") setPaused(true); }} onPointerLeave={(e) => { if (e.pointerType === "mouse") setPaused(false); }}
      onFocus={(e) => { if (e.target.matches(":focus-visible")) setPaused(true); }} onBlur={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { if (touchX.current === null) return; const dx = e.changedTouches[0].clientX - touchX.current; touchX.current = null; if (Math.abs(dx) > 50) go(dx < 0 ? i + 1 : i - 1); }}
      onKeyDown={(e) => { if (e.key === "ArrowRight") go(i + 1); if (e.key === "ArrowLeft") go(i - 1); }}>
      {/* Full-screen photo backdrops: cross-fade, settle from 110% to 100%, then a slow drift */}
      {SLIDES.map((s, n) => {
        const on = n === i;
        return (
          <div key={s.slug} aria-hidden="true" className={`absolute inset-0 transition-all duration-700 ${EASE} ${on ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}
            style={{ background: `radial-gradient(60% 60% at 70% 40%, ${s.glow}66, #0B0B0C 75%)` }}>
            {!broken[s.slug] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/food/${s.slug}.png`} alt="" onError={() => setBroken((b) => ({ ...b, [s.slug]: true }))} className="h-full w-full animate-drift object-cover object-center motion-reduce:animate-none" />
            )}
          </div>
        );
      })}
      {/* Readability: bottom-up on phones (text sits low), left-to-right on wide screens */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-ink/10 md:bg-gradient-to-r md:from-ink/90 md:via-ink/50 md:to-transparent" />

      {SLIDES.map((s, n) => {
        const on = n === i;
        const stagger = (k: number) => ({ transitionDelay: on ? `${200 + k * 120}ms` : "0ms" });
        const rise = `transition-all duration-700 ${EASE} ${on ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`;
        return (
          <div key={s.slug} aria-hidden={!on} role="group" aria-roledescription="slide" aria-label={`${n + 1} of ${SLIDES.length}`}
            className={`absolute inset-0 z-10 mx-auto flex max-w-6xl items-end px-5 pb-24 transition-opacity duration-700 ${EASE} md:items-center md:px-10 md:pb-0 ${on ? "opacity-100" : "pointer-events-none opacity-0"}`}>
            <div className="w-full max-w-xl">
              <p className={`${rise} text-xs uppercase tracking-[0.25em] text-amber md:text-sm`} style={stagger(0)}>{s.tag}</p>
              <h1 className={`${rise} mt-2 text-display-lg`} style={stagger(1)}>{s.title}</h1>
              <p className={`${rise} mt-3 line-clamp-3 text-base text-paper/90 md:mt-4 md:text-lg`} style={stagger(2)}>{s.text}</p>
              <div className={`${rise} mt-6 flex gap-3 md:mt-8`} style={stagger(3)}>
                <Link href={`/menu/${s.slug}`} tabIndex={on ? 0 : -1} className="flex-1 rounded bg-ember px-6 py-4 text-center text-base font-semibold text-ink md:flex-none md:px-8 md:text-lg">Order Now</Link>
                <Link href="/menu" tabIndex={on ? 0 : -1} className="flex-1 rounded border border-white/40 bg-ink/40 px-6 py-4 text-center text-base backdrop-blur md:flex-none md:px-8 md:text-lg">Full menu</Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* Autoplay progress bar */}
      {!reduce && <div aria-hidden="true" key={`${i}-${paused}`} className="absolute inset-x-0 bottom-0 z-20 h-1 origin-left bg-ember" style={{ animation: `slideProgress ${INTERVAL}ms linear forwards` }} />}

      <div className="absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-4">
        <button onClick={() => go(i - 1)} aria-label="Previous slide" className="hidden h-11 w-11 place-items-center rounded-full border border-white/40 bg-ink/40 transition hover:border-ember sm:grid">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div className="flex items-center" role="tablist" aria-label="Choose slide">
          {SLIDES.map((s, n) => (
            <button key={s.slug} role="tab" aria-selected={n === i} aria-label={`Show ${s.title}`} onClick={() => go(n)} className="grid h-9 place-items-center px-1">
              <span className={`block h-2 rounded-full transition-all duration-700 ${EASE} ${n === i ? "w-8 bg-ember" : "w-2 bg-white/50"}`} />
            </button>
          ))}
        </div>
        <button onClick={() => go(i + 1)} aria-label="Next slide" className="hidden h-11 w-11 place-items-center rounded-full border border-white/40 bg-ink/40 transition hover:border-ember sm:grid">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </section>
  );
}