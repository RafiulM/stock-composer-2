import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { batches, movements } from "@/db/schema";
import { getSessionUser } from "@/lib/api-auth";
import { mapMovement } from "@/lib/mappers/inventory";
import { outboundSchema } from "@/lib/validations/stock";

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

  const parsed = outboundSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const v = parsed.data;

  try {
    const result = await db.transaction(async (tx) => {
      const [batch] = await tx
        .select()
        .from(batches)
        .where(
          and(
            eq(batches.id, v.batchId),
            eq(batches.productId, v.productId)
          )
        );

      if (!batch) {
        throw new Error("BATCH_NOT_FOUND");
      }
      if (batch.currentQuantity < v.quantity) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      await tx
        .update(batches)
        .set({ currentQuantity: batch.currentQuantity - v.quantity })
        .where(eq(batches.id, batch.id));

      const [movement] = await tx
        .insert(movements)
        .values({
          type: "outbound",
          quantity: v.quantity,
          batchId: batch.id,
          notes: v.notes?.trim() || null,
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

      return movement;
    });

    return NextResponse.json({
      movement: mapMovement({
        ...result,
        userName: u.name ?? null,
      }),
    });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "BATCH_NOT_FOUND") {
        return NextResponse.json({ error: "Batch not found" }, { status: 404 });
      }
      if (e.message === "INSUFFICIENT_STOCK") {
        return NextResponse.json(
          { error: "Jumlah melebihi stok batch" },
          { status: 400 }
        );
      }
    }
    throw e;
  }
}
