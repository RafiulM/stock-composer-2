import { NextResponse } from "next/server";

import { db } from "@/db";
import { products } from "@/db/schema";
import { getSessionUser } from "@/lib/api-auth";
import { mapProduct } from "@/lib/mappers/inventory";
import { productSchema } from "@/lib/validations/stock";

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

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const v = parsed.data;
  const [row] = await db
    .insert(products)
    .values({
      name: v.name,
      sku: v.sku,
      unit: v.unit,
      rackLocation: v.rack_location,
      minStock: v.min_stock,
      category: v.category,
    })
    .returning();

  return NextResponse.json({ product: mapProduct(row) }, { status: 201 });
}
