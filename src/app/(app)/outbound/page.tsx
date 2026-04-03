"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { outboundSchema } from "@/lib/validations/stock";
import { useStockStore } from "@/lib/stock-store";

type OutboundValues = z.infer<typeof outboundSchema>;

export default function OutboundPage() {
  const hydrated = useStockStore((s) => s.hydrated);
  const products = useStockStore((s) => s.products);
  const batches = useStockStore((s) => s.batches);
  const addOutbound = useStockStore((s) => s.addOutbound);

  const form = useForm<OutboundValues>({
    resolver: zodResolver(outboundSchema),
    defaultValues: {
      productId: 0,
      batchId: 0,
      quantity: 1,
      notes: "",
    },
  });

  const productId = form.watch("productId");
  const batchId = form.watch("batchId");

  const batchesForProduct = React.useMemo(
    () =>
      batches.filter((b) => b.product_id === productId && b.current_quantity > 0),
    [batches, productId]
  );

  React.useEffect(() => {
    if (!products.length) return;
    const pid = form.getValues("productId");
    if (!pid || !products.some((p) => p.id === pid)) {
      form.setValue("productId", products[0].id, { shouldValidate: true });
    }
  }, [products, form]);

  React.useEffect(() => {
    const first = batchesForProduct[0];
    if (!first) {
      form.setValue("batchId", 0);
      return;
    }
    const bid = form.getValues("batchId");
    if (!bid || !batchesForProduct.some((b) => b.id === bid)) {
      form.setValue("batchId", first.id, { shouldValidate: true });
    }
  }, [batchesForProduct, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const batch = batches.find((b) => b.id === values.batchId);
    if (!batch || values.quantity > batch.current_quantity) {
      toast.error("Jumlah melebihi stok batch");
      return;
    }
    try {
      await addOutbound({
        productId: values.productId,
        batchId: values.batchId,
        quantity: values.quantity,
        notes: values.notes,
      });
      toast.success("Stok keluar tercatat");
      form.reset({
        productId: values.productId,
        batchId: values.batchId,
        quantity: 1,
        notes: "",
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    }
  });

  if (!hydrated) {
    return (
      <div className="text-muted-foreground text-sm">Memuat data…</div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Stok keluar</h1>
        <p className="text-muted-foreground text-sm">
          Pilih batch (FIFO/LIFO manual) dan kurangi stok dengan keterangan.
        </p>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada produk</CardTitle>
            <CardDescription>
              Buat master produk dan stok masuk terlebih dahulu.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-wrap gap-2">
            <Button render={<Link href="/products" />}>Master produk</Button>
            <Button variant="outline" render={<Link href="/inbound" />}>
              Stok masuk
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <form onSubmit={onSubmit}>
            <CardHeader>
              <CardTitle className="text-lg">Form stok keluar</CardTitle>
              <CardDescription>
                Hanya batch dengan sisa stok &gt; 0 ditampilkan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Produk</Label>
                <Select
                  value={String(productId || products[0]?.id)}
                  onValueChange={(v) => {
                    const pid = Number(v);
                    form.setValue("productId", pid, { shouldValidate: true });
                    const nextBatches = batches.filter(
                      (b) => b.product_id === pid && b.current_quantity > 0
                    );
                    form.setValue("batchId", nextBatches[0]?.id ?? 0);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name} ({p.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {batchesForProduct.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Tidak ada batch dengan stok untuk produk ini.{" "}
                  <Link href="/inbound" className="text-primary underline">
                    Catat stok masuk
                  </Link>
                  .
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Batch</Label>
                    <Select
                      value={String(batchId || batchesForProduct[0]?.id)}
                      onValueChange={(v) =>
                        form.setValue("batchId", Number(v), {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger className="w-full font-mono text-sm">
                        <SelectValue placeholder="Pilih batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {batchesForProduct.map((b) => (
                          <SelectItem key={b.id} value={String(b.id)}>
                            {b.batch_number} — sisa {b.current_quantity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qty-out">Jumlah keluar</Label>
                    <Input
                      id="qty-out"
                      type="number"
                      min={1}
                      {...form.register("quantity", { valueAsNumber: true })}
                    />
                    {form.formState.errors.quantity && (
                      <p className="text-destructive text-xs">
                        {form.formState.errors.quantity.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Keterangan</Label>
                    <Textarea
                      id="notes"
                      placeholder="Contoh: Penjualan, sampling, rusak…"
                      rows={3}
                      {...form.register("notes")}
                    />
                  </div>
                </>
              )}
            </CardContent>
            {batchesForProduct.length > 0 && (
              <CardFooter>
                <Button type="submit" className="w-full sm:w-auto">
                  Simpan stok keluar
                </Button>
              </CardFooter>
            )}
          </form>
        </Card>
      )}
    </div>
  );
}
