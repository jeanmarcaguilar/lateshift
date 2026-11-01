"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
export default function Modal({ children, label }: { children: React.ReactNode; label: string }) {
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") router.back(); };
    window.addEventListener("keydown", onKey);
    box.current?.focus();
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [router]);
  return (
    <div className="fixed inset-0 z-[60] flex animate-fade-in items-end justify-center sm:items-center" onClick={() => router.back()}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
      <div ref={box} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92svh] w-full max-w-2xl animate-modal-in overflow-y-auto rounded-t-3xl border border-white/10 bg-ink px-5 pt-6 shadow-2xl outline-none motion-reduce:animate-none sm:rounded-3xl">
        <button onClick={() => router.back()} aria-label="Close" className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-ink/80 transition hover:border-ember">✕</button>
        {children}
      </div>
    </div>
  );
}
