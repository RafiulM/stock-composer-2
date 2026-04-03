"use client";

import Link from "next/link";

import { StockCompositionChart, StockTrendChart } from "@/components/dashboard/dashboard-charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  lowStockItems,
  stockByProduct,
  weeklyMovementTrend,
} from "@/lib/dashboard-stats";
import { totalStockForProduct, useStockStore } from "@/lib/stock-store";

export default function DashboardPage() {
  const hydrated = useStockStore((s) => s.hydrated);
  const products = useStockStore((s) => s.products);
  const batches = useStockStore((s) => s.batches);
  const movements = useStockStore((s) => s.movements);

  if (!hydrated) {
    return (
      <div className="text-muted-foreground text-sm">Memuat data…</div>
    );
  }

  const totalProducts = products.length;
  const totalUnits = products.reduce(
    (acc, p) => acc + totalStockForProduct(batches, p.id),
    0
  );
  const low = lowStockItems(products, batches);
  const trend = weeklyMovementTrend(movements);
  const byProduct = stockByProduct(products, batches);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Ringkasan stok, peringatan minimum, dan tren pergerakan.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total produk</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {totalProducts}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">
              SKU aktif di master data
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total unit stok</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {totalUnits.toLocaleString("id-ID")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">
              Jumlah gabungan semua batch
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Nilai aset</CardDescription>
            <CardTitle className="text-muted-foreground text-3xl">—</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">
              Opsional — dihubungkan ke backend nanti
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Peringatan stok rendah</CardTitle>
            <CardDescription>
              Produk di bawah batas minimum yang Anda tetapkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {low.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Semua produk di atas batas minimum. Bagus!
              </p>
            ) : (
              <ul className="space-y-3">
                {low.map(({ product, total }) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between gap-2 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="text-muted-foreground text-xs">
                        Min {product.min_stock} {product.unit} · Rak{" "}
                        {product.rack_location}
                      </p>
                    </div>
                    <Badge variant="destructive" className="shrink-0">
                      {total} {product.unit}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <Button variant="outline" size="sm" className="mt-4" render={<Link href="/products" />}>
              Kelola produk
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Komposisi stok</CardTitle>
            <CardDescription>
              Perbandingan jumlah stok per produk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StockCompositionChart data={byProduct} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tren stok masuk & keluar</CardTitle>
          <CardDescription>
            Agregat mingguan dari riwayat transaksi (demo)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StockTrendChart data={trend} />
        </CardContent>
      </Card>
    </div>
  );
}
