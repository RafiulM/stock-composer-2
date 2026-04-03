import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { batches, movements, products } from "@/db/schema";
import { getSessionUser } from "@/lib/api-auth";
import { mapBatch, mapMovement } from "@/lib/mappers/inventory";
import { inboundSchema } from "@/lib/validations/stock";

export async function POST(request: Request) {
  const u = await getSessionUser();
  if (!u) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = inboundSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const v = parsed.data;
  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, v.productId));

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const expiry =
    v.expiryDate && String(v.expiryDate).trim() !== ""
      ? String(v.expiryDate).trim()
      : null;

  const result = await db.transaction(async (tx) => {
    const [batch] = await tx
      .insert(batches)
      .values({
        productId: v.productId,
        batchNumber: v.batchNumber.trim(),
        currentQuantity: v.quantity,
        expiryDate: expiry,
      })
      .returning();

    const [movement] = await tx
      .insert(movements)
      .values({
        type: "inbound",
        quantity: v.quantity,
        batchId: batch.id,
        createdAt: new Date(v.date),
        notes: null,
        userId: u.id,
      })
      .returning({
        id: movements.id,
        type: movements.type,
        quantity: movements.quantity,
        batchId: movements.batchId,
        createdAt: movements.createdAt,
        notes: movements.notes,
        userId: movements.userId,
      });

    return { batch, movement };
  });

  return NextResponse.json({
    batch: mapBatch(result.batch),
    movement: mapMovement({
      ...result.movement,
      userName: u.name ?? null,
    }),
  });
}
