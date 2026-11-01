export type Hours = { timezone: string; open_time: string; close_time: string; is_accepting_orders: boolean };
const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
export function storeStatus(s: Hours, now = new Date()): { open: boolean; reason?: string } {
  if (!s.is_accepting_orders) return { open: false, reason: "We're not taking orders right now." };
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: s.timezone, hour: "numeric", minute: "numeric", hour12: false }).formatToParts(now);
  const cur = Number(parts.find((p) => p.type === "hour")!.value) % 24 * 60 + Number(parts.find((p) => p.type === "minute")!.value);
  const o = toMin(s.open_time), c = toMin(s.close_time);
  const open = o < c ? cur >= o && cur < c : cur >= o || cur < c; // handles overnight 18:00 to 03:00
  return open ? { open } : { open, reason: `We're closed. We open at ${s.open_time.slice(0, 5)} (${s.timezone}).` };
}
