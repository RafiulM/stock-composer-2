import { create } from "zustand";

import type { Batch, Movement, MovementType, Product, User } from "@/lib/types";

export function totalStockForProduct(
  batches: Batch[],
  productId: number
): number {
  return batches
    .filter((b) => b.product_id === productId)
    .reduce((s, b) => s + b.current_quantity, 0);
}

async function jsonFetch<T = unknown>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const data = (await res.json().catch(() => ({}))) as T & {
    error?: string;
  };
  if (!res.ok) {
    throw new Error(
      typeof data === "object" && data && "error" in data && data.error
        ? String(data.error)
        : res.statusText
    );
  }
  return data as T;
}

type StockState = {
  user: User | null;
  products: Product[];
  batches: Batch[];
  movements: Movement[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addProduct: (input: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: number, input: Partial<Omit<Product, "id">>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  addInbound: (input: {
    productId: number;
    quantity: number;
    batchNumber: string;
    date: string;
    expiryDate?: string | null;
  }) => Promise<void>;
  addOutbound: (input: {
    productId: number;
    batchId: number;
    quantity: number;
    notes?: string | null;
  }) => Promise<void>;
};

export const useStockStore = create<StockState>((set, get) => ({
  user: null,
  products: [],
  batches: [],
  movements: [],
  hydrated: false,

  hydrate: async () => {
    const res = await fetch("/api/inventory", { credentials: "include" });
    if (res.status === 401) {
      set({
        hydrated: true,
        user: null,
        products: [],
        batches: [],
        movements: [],
      });
      return;
    }
    if (!res.ok) {
      set({ hydrated: true });
      return;
    }
    const data = (await res.json()) as {
      user: User;
      products: Product[];
      batches: Batch[];
      movements: Movement[];
    };
    set({
      user: data.user,
      products: data.products,
      batches: data.batches,
      movements: data.movements,
      hydrated: true,
    });
  },

  addProduct: async (input) => {
    await jsonFetch<{ product: Product }>("/api/products", {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        sku: input.sku,
        unit: input.unit,
        rack_location: input.rack_location,
        min_stock: input.min_stock,
        category: input.category,
      }),
    });
    await get().hydrate();
  },

  updateProduct: async (id, input) => {
    await jsonFetch(`/api/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    await get().hydrate();
  },

  deleteProduct: async (id) => {
    await jsonFetch(`/api/products/${id}`, { method: "DELETE" });
    await get().hydrate();
  },

  addInbound: async ({
    productId,
    quantity,
    batchNumber,
    date,
    expiryDate,
  }) => {
    await jsonFetch("/api/inbound", {
      method: "POST",
      body: JSON.stringify({
        productId,
        quantity,
        batchNumber,
        date,
        expiryDate: expiryDate ?? undefined,
      }),
    });
    await get().hydrate();
  },

  addOutbound: async ({ productId, batchId, quantity, notes }) => {
    await jsonFetch("/api/outbound", {
      method: "POST",
      body: JSON.stringify({
        productId,
        batchId,
        quantity,
        notes: notes ?? undefined,
      }),
    });
    await get().hydrate();
  },
}));

export function movementLabel(type: MovementType): string {
  return type === "inbound" ? "Masuk" : "Keluar";
}
