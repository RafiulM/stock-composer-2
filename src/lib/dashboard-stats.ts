import { format, parseISO, startOfWeek } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { totalStockForProduct } from "@/lib/stock-store";
import type { Batch, Movement, Product } from "@/lib/types";

export type WeeklyTrendPoint = {
  weekLabel: string;
  inbound: number;
  outbound: number;
  net: number;
};

function startOfIsoWeek(d: Date): Date {
  return startOfWeek(d, { weekStartsOn: 1 });
}

/** Aggregate movements by calendar week (Senin–Minggu). */
export function weeklyMovementTrend(movements: Movement[]): WeeklyTrendPoint[] {
  const map = new Map<
    string,
    { inbound: number; outbound: number; weekStart: Date }
  >();

  for (const m of movements) {
    const d = parseISO(m.created_at);
    const ws = startOfIsoWeek(d);
    const key = format(ws, "yyyy-MM-dd");
    const cur = map.get(key) ?? { inbound: 0, outbound: 0, weekStart: ws };
    if (m.type === "inbound") cur.inbound += m.quantity;
    else cur.outbound += m.quantity;
    map.set(key, cur);
  }

  const sorted = [...map.entries()].sort(
    (a, b) => a[1].weekStart.getTime() - b[1].weekStart.getTime()
  );

  return sorted.map(([, v]) => ({
    weekLabel: format(v.weekStart, "d MMM", { locale: idLocale }),
    inbound: v.inbound,
    outbound: v.outbound,
    net: v.inbound - v.outbound,
  }));
}

export type StockByProduct = {
  name: string;
  total: number;
  category: string;
};

export function stockByProduct(
  products: Product[],
  batches: Batch[]
): StockByProduct[] {
  return products.map((p) => ({
    name: p.name,
    category: p.category,
    total: totalStockForProduct(batches, p.id),
  }));
}

export function lowStockItems(
  products: Product[],
  batches: Batch[]
): { product: Product; total: number }[] {
  return products
    .map((product) => ({
      product,
      total: totalStockForProduct(batches, product.id),
    }))
    .filter(({ product, total }) => total < product.min_stock)
    .sort((a, b) => a.total - b.total);
}
