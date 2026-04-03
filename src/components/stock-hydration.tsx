"use client";

import * as React from "react";

import { useStockStore } from "@/lib/stock-store";

/** Loads inventory from `/api/inventory` once the app shell is shown (session required). */
export function StockHydration() {
  const hydrate = useStockStore((s) => s.hydrate);

  React.useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return null;
}
