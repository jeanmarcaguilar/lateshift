"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { lineUnitCents, useCart } from "@/lib/cart";
import { money } from "@/lib/types";
export default function CartButton() {
  const lines = useCart((s) => s.lines);
  const path = usePathname();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const count = ready ? lines.reduce((n, l) => n + l.quantity, 0) : 0;
  if (!count || path === "/cart" || path === "/checkout") return null;
  const total = lines.reduce((s, l) => s + lineUnitCents(l) * l.quantity, 0);
  return (
    <Link href="/cart" className="fixed bottom-4 right-4 z-40 rounded-full bg-ember px-6 py-3 font-semibold text-ink shadow-[0_10px_30px_-5px_rgba(255,90,31,0.6)]" aria-label={`Open cart, ${count} items`}>
      Cart · {count} · {money(total)}
    </Link>
  );
}
