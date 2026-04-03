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
import { inboundSchema } from "@/lib/validations/stock";
import { useStockStore } from "@/lib/stock-store";

type InboundValues = z.infer<typeof inboundSchema>;

export default function InboundPage() {
  const hydrated = useStockStore((s) => s.hydrated);
  const products = useStockStore((s) => s.products);
  const addInbound = useStockStore((s) => s.addInbound);

  const form = useForm<InboundValues>({
    resolver: zodResolver(inboundSchema),
    defaultValues: {
      productId: 0,
      quantity: 1,
      batchNumber: "",
      date: new Date().toISOString().slice(0, 10),
      expiryDate: "",
    },
  });

  const productId = form.watch("productId");

  React.useEffect(() => {
    if (!products.length) return;
    const pid = form.getValues("productId");
    if (!pid || !products.some((p) => p.id === pid)) {
      form.setValue("productId", products[0].id, { shouldValidate: true });
    }
  }, [products, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await addInbound({
        productId: values.productId,
        quantity: values.quantity,
        batchNumber: values.batchNumber.trim(),
        date: values.date,
        expiryDate: values.expiryDate?.trim() || null,
      });
      toast.success("Stok masuk tercatat");
      form.reset({
        productId: values.productId,
        quantity: 1,
        batchNumber: "",
        date: new Date().toISOString().slice(0, 10),
        expiryDate: "",
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
        <h1 className="text-2xl font-semibold tracking-tight">Stok masuk</h1>
        <p className="text-muted-foreground text-sm">
          Tambah stok dengan nomor batch dan tanggal masuk.
        </p>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada produk</CardTitle>
            <CardDescription>
              Buat master produk terlebih dahulu.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button render={<Link href="/products" />}>Ke master produk</Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <form onSubmit={onSubmit}>
            <CardHeader>
              <CardTitle className="text-lg">Form stok masuk</CardTitle>
              <CardDescription>
                Input manual — tanpa pemindaian barcode.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Produk</Label>
                <Select
                  value={String(productId || products[0]?.id)}
                  onValueChange={(v) =>
                    form.setValue("productId", Number(v), { shouldValidate: true })
                  }
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
                {form.formState.errors.productId && (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.productId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="qty">Jumlah</Label>
                <Input
                  id="qty"
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
                <Label htmlFor="batch">Nomor batch</Label>
                <Input
                  id="batch"
                  className="font-mono"
                  placeholder="BTH-2026-001"
                  {...form.register("batchNumber")}
                />
                {form.formState.errors.batchNumber && (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.batchNumber.message}
                  </p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Tanggal masuk</Label>
                  <Input id="date" type="date" {...form.register("date")} />
                  {form.formState.errors.date && (
                    <p className="text-destructive text-xs">
                      {form.formState.errors.date.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exp">Kedaluwarsa (opsional)</Label>
                  <Input id="exp" type="date" {...form.register("expiryDate")} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full sm:w-auto">
                Simpan stok masuk
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
