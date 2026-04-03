import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { batches, movements, products, user as authUser } from "@/db/schema";
import { getSessionUser } from "@/lib/api-auth";
import { mapBatch, mapMovement, mapProduct } from "@/lib/mappers/inventory";

export async function GET() {
  const u = await getSessionUser();
  if (!u) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [productRows, batchRows, movementRows] = await Promise.all([
    db.select().from(products).orderBy(products.id),
    db.select().from(batches).orderBy(batches.id),
    db
      .select({
        id: movements.id,
        type: movements.type,
        quantity: movements.quantity,
        batchId: movements.batchId,
        createdAt: movements.createdAt,
        notes: movements.notes,
        userId: movements.userId,
        userName: authUser.name,
      })
      .from(movements)
      .leftJoin(authUser, eq(movements.userId, authUser.id))
      .orderBy(desc(movements.createdAt)),
  ]);

  return NextResponse.json({
    user: {
      id: u.id,
      name: u.name ?? "Admin",
      email: u.email,
    },
    products: productRows.map(mapProduct),
    batches: batchRows.map(mapBatch),
    movements: movementRows.map(mapMovement),
  });
}
