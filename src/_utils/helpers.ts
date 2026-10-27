import { DateRange } from "@/_types/export";

export const safeLength = (arr?: readonly unknown[] | null): number =>
  arr?.length ?? 0

export const calculateDays = (dateRange: DateRange) => {
  const start = new Date(dateRange.startDate);
  const end = new Date(dateRange.endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

export function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
}

export function parseDateRange(start: string, end: string):
  | { ok: true; startDate: Date; endDate: Date }
  | { ok: false; error: string } {

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime())) return { ok: false, error: "Invalid start date" };
  if (isNaN(endDate.getTime())) return { ok: false, error: "Invalid end date" };
  if (endDate < startDate) return { ok: false, error: "End date must be after start date" };

  return { ok: true, startDate, endDate };
}

export function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

/** Map speed (knots) to a hue-based colour. Slow = red, fast = blue. */
export function speedToColor(speed: number, maxSpeed = 10): string {
  const t = Math.max(0, Math.min(1, speed / maxSpeed));
  const hue = Math.round(t * 235); // 0 (red) → 235 (blue)
  const sat = 85 - t * 15;         // slightly desaturate at extremes
  const lit = 48 + t * 6;
  return `hsl(${hue},${sat}%,${lit}%)`;
}
