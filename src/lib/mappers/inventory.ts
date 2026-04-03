import type { Batch, Movement, Product } from "@/lib/types";

type ProductRow = {
  id: number;
  name: string;
  sku: string;
  unit: string;
  rackLocation: string;
  minStock: number;
  category: string;
};

type BatchRow = {
  id: number;
  productId: number;
  batchNumber: string;
  currentQuantity: number;
  expiryDate: string | null;
};

type MovementRow = {
  id: number;
  type: "inbound" | "outbound";
  quantity: number;
  batchId: number;
  createdAt: Date;
  notes: string | null;
  userId: string;
  userName: string | null;
};

export function mapProduct(p: ProductRow): Product {
  return {
    id: p.id,
    name: p.name,
    sku: p.sku,
    unit: p.unit,
    rack_location: p.rackLocation,
    min_stock: p.minStock,
    category: p.category,
  };
}

export function mapBatch(b: BatchRow): Batch {
  return {
    id: b.id,
    product_id: b.productId,
    batch_number: b.batchNumber,
    current_quantity: b.currentQuantity,
    expiry_date: b.expiryDate,
  };
}

export function mapMovement(m: MovementRow): Movement {
  return {
    id: m.id,
    type: m.type,
    quantity: m.quantity,
    batch_id: m.batchId,
    created_at: m.createdAt.toISOString(),
    notes: m.notes,
    user_id: m.userId,
    user_name: m.userName,
  };
}
