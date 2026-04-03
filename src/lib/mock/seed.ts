import type { Batch, Movement, Product, User } from "@/lib/types";

export const SEED_USER: User = {
  id: "1",
  name: "Admin",
  email: "admin@stock.local",
};

export const seedProducts: Product[] = [
  {
    id: 1,
    name: "Kopi Bubuk Premium",
    sku: "KP-001",
    unit: "kg",
    rack_location: "A1-01",
    min_stock: 20,
    category: "Minuman",
  },
  {
    id: 2,
    name: "Gula Pasir",
    sku: "GP-002",
    unit: "sak",
    rack_location: "B2-03",
    min_stock: 10,
    category: "Bahan",
  },
  {
    id: 3,
    name: "Tepung Terigu",
    sku: "TT-003",
    unit: "kg",
    rack_location: "C1-02",
    min_stock: 15,
    category: "Bahan",
  },
  {
    id: 4,
    name: "Susu UHT",
    sku: "SU-004",
    unit: "kotak",
    rack_location: "D3-01",
    min_stock: 30,
    category: "Minuman",
  },
];

export const seedBatches: Batch[] = [
  {
    id: 1,
    product_id: 1,
    batch_number: "BTH-KP-2025-01",
    current_quantity: 8,
    expiry_date: "2026-12-31",
  },
  {
    id: 2,
    product_id: 1,
    batch_number: "BTH-KP-2025-02",
    current_quantity: 14,
    expiry_date: null,
  },
  {
    id: 3,
    product_id: 2,
    batch_number: "BTH-GP-2025-A",
    current_quantity: 45,
    expiry_date: null,
  },
  {
    id: 4,
    product_id: 3,
    batch_number: "BTH-TT-001",
    current_quantity: 12,
    expiry_date: "2026-06-01",
  },
  {
    id: 5,
    product_id: 4,
    batch_number: "BTH-SU-2401",
    current_quantity: 22,
    expiry_date: "2026-03-15",
  },
];

/** Seed movements with spread dates for dashboard area chart */
export const seedMovements: Movement[] = [
  {
    id: 1,
    type: "inbound",
    quantity: 25,
    batch_id: 1,
    created_at: "2026-03-10T09:00:00.000Z",
    notes: null,
    user_id: "1",
  },
  {
    id: 2,
    type: "outbound",
    quantity: 10,
    batch_id: 1,
    created_at: "2026-03-14T14:30:00.000Z",
    notes: "Penjualan ritel",
    user_id: "1",
  },
  {
    id: 3,
    type: "inbound",
    quantity: 50,
    batch_id: 3,
    created_at: "2026-03-18T08:15:00.000Z",
    notes: null,
    user_id: "1",
  },
  {
    id: 4,
    type: "outbound",
    quantity: 5,
    batch_id: 3,
    created_at: "2026-03-22T11:00:00.000Z",
    notes: null,
    user_id: "1",
  },
  {
    id: 5,
    type: "inbound",
    quantity: 30,
    batch_id: 5,
    created_at: "2026-03-25T10:00:00.000Z",
    notes: null,
    user_id: "1",
  },
  {
    id: 6,
    type: "outbound",
    quantity: 8,
    batch_id: 5,
    created_at: "2026-03-28T16:20:00.000Z",
    notes: "Distribusi",
    user_id: "1",
  },
  {
    id: 7,
    type: "inbound",
    quantity: 14,
    batch_id: 2,
    created_at: "2026-03-29T09:00:00.000Z",
    notes: null,
    user_id: "1",
  },
];
