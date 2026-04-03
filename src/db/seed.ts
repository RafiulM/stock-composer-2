import { generateId } from "@better-auth/core/utils/id";
import { hashPassword } from "better-auth/crypto";
import { inArray, sql } from "drizzle-orm";
import { subDays } from "date-fns";

import { db, pool } from "./index";
import { account, user } from "./schema/auth-schema";
import { batches, movements, products } from "./schema/inventory";

/** Mirrors `src/lib/mock/seed.ts` — warehouse-style demo inventory + movement history. */
const PRODUCT_ROWS = [
  {
    name: "Kopi Bubuk Premium",
    sku: "KP-001",
    unit: "kg",
    rackLocation: "A1-01",
    minStock: 20,
    category: "Minuman",
  },
  {
    name: "Gula Pasir",
    sku: "GP-002",
    unit: "sak",
    rackLocation: "B2-03",
    minStock: 10,
    category: "Bahan",
  },
  {
    name: "Tepung Terigu",
    sku: "TT-003",
    unit: "kg",
    rackLocation: "C1-02",
    minStock: 15,
    category: "Bahan",
  },
  {
    name: "Susu UHT",
    sku: "SU-004",
    unit: "kotak",
    rackLocation: "D3-01",
    minStock: 30,
    category: "Minuman",
  },
] as const;

async function resolveSeedUserId(): Promise<string> {
  const [existing] = await db.select({ id: user.id }).from(user).limit(1);
  if (existing) return existing.id;

  const email =
    process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase() ??
    "admin@stock.local";
  const password =
    process.env.SEED_ADMIN_PASSWORD ?? "SeedPassword123!";
  const userId = generateId();
  const hashed = await hashPassword(password);
  const now = new Date();

  await db.insert(user).values({
    id: userId,
    name: "Admin",
    email,
    emailVerified: true,
    image: null,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(account).values({
    id: generateId(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: hashed,
    createdAt: now,
    updatedAt: now,
  });

  console.info(
    `Created seed admin: ${email} (sign in with SEED_ADMIN_PASSWORD or default)`
  );
  return userId;
}

async function main() {
  const force = process.env.SEED_FORCE === "1";

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products);

  if (count > 0 && !force) {
    console.info(
      "Seed skipped: products already exist. Set SEED_FORCE=1 to replace inventory data."
    );
    return;
  }

  if (force && count > 0) {
    await db.delete(movements);
    await db.delete(batches);
    await db.delete(products);
    console.info("Cleared movements, batches, and products (SEED_FORCE=1).");
  }

  const userId = await resolveSeedUserId();

  await db.insert(products).values([...PRODUCT_ROWS]);

  const skus = PRODUCT_ROWS.map((p) => p.sku);
  const insertedProducts = await db
    .select({ id: products.id, sku: products.sku })
    .from(products)
    .where(inArray(products.sku, [...skus]));

  const bySku = new Map(insertedProducts.map((p) => [p.sku, p.id]));

  const batchRows = [
    {
      sku: "KP-001" as const,
      batchNumber: "BTH-KP-2025-01",
      currentQuantity: 8,
      expiryDate: "2026-12-31",
    },
    {
      sku: "KP-001" as const,
      batchNumber: "BTH-KP-2025-02",
      currentQuantity: 14,
      expiryDate: null as string | null,
    },
    {
      sku: "GP-002" as const,
      batchNumber: "BTH-GP-2025-A",
      currentQuantity: 45,
      expiryDate: null as string | null,
    },
    {
      sku: "TT-003" as const,
      batchNumber: "BTH-TT-001",
      currentQuantity: 12,
      expiryDate: "2026-06-01",
    },
    {
      sku: "SU-004" as const,
      batchNumber: "BTH-SU-2401",
      currentQuantity: 22,
      expiryDate: "2026-03-15",
    },
  ];

  const insertedBatches = await db
    .insert(batches)
    .values(
      batchRows.map((b) => ({
        productId: bySku.get(b.sku)!,
        batchNumber: b.batchNumber,
        currentQuantity: b.currentQuantity,
        expiryDate: b.expiryDate,
      }))
    )
    .returning({ id: batches.id });

  const [b1, b2, b3, b4, b5] = insertedBatches.map((r) => r.id);
  const now = new Date();

  const movementDefs: {
    type: "inbound" | "outbound";
    quantity: number;
    batchId: number;
    daysAgo: number;
    notes: string | null;
  }[] = [
    { type: "inbound", quantity: 25, batchId: b1, daysAgo: 24, notes: null },
    {
      type: "outbound",
      quantity: 10,
      batchId: b1,
      daysAgo: 20,
      notes: "Penjualan ritel",
    },
    { type: "inbound", quantity: 50, batchId: b3, daysAgo: 17, notes: null },
    { type: "outbound", quantity: 5, batchId: b3, daysAgo: 13, notes: null },
    { type: "inbound", quantity: 30, batchId: b5, daysAgo: 9, notes: null },
    {
      type: "outbound",
      quantity: 8,
      batchId: b5,
      daysAgo: 6,
      notes: "Distribusi",
    },
    { type: "inbound", quantity: 14, batchId: b2, daysAgo: 4, notes: null },
  ];

  await db.insert(movements).values(
    movementDefs.map((m) => ({
      type: m.type,
      quantity: m.quantity,
      batchId: m.batchId,
      userId,
      notes: m.notes,
      createdAt: subDays(now, m.daysAgo),
    }))
  );

  console.info(
    `Seed complete: ${PRODUCT_ROWS.length} products, ${batchRows.length} batches, ${movementDefs.length} movements.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => {
    void pool.end();
  });
