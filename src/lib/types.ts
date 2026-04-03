export type MovementType = "inbound" | "outbound";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  unit: string;
  rack_location: string;
  min_stock: number;
  /** UI-only grouping for composition chart */
  category: string;
}

export interface Batch {
  id: number;
  product_id: number;
  batch_number: string;
  current_quantity: number;
  expiry_date: string | null;
}

export interface Movement {
  id: number;
  type: MovementType;
  quantity: number;
  batch_id: number;
  created_at: string;
  notes: string | null;
  user_id: string;
  /** Denormalized for tables (from API join). */
  user_name?: string | null;
}
