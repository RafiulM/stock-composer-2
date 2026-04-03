"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { DataTable, DataTableColumnHeader } from "@/components/data-table";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Product } from "@/lib/types";
import { productSchema } from "@/lib/validations/stock";
import { totalStockForProduct, useStockStore } from "@/lib/stock-store";

type ProductFormValues = z.infer<typeof productSchema>;

type ProductTableRow = Product & { stock: number };

const productsGlobalFilterFn: FilterFn<ProductTableRow> = (
  row,
  _columnId,
  filterValue
) => {
  const q = String(filterValue ?? "").toLowerCase();
  if (!q) return true;
  const r = row.original;
  return [
    r.name,
    r.sku,
    r.category,
    r.unit,
    r.rack_location,
    String(r.min_stock),
    String(r.stock),
  ]
    .join(" ")
    .toLowerCase()
    .includes(q);
};

export default function ProductsPage() {
  const hydrated = useStockStore((s) => s.hydrated);
  const products = useStockStore((s) => s.products);
  const batches = useStockStore((s) => s.batches);
  const addProduct = useStockStore((s) => s.addProduct);
  const updateProduct = useStockStore((s) => s.updateProduct);
  const deleteProduct = useStockStore((s) => s.deleteProduct);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Product | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      unit: "",
      rack_location: "",
      min_stock: 0,
      category: "",
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      name: "",
      sku: "",
      unit: "",
      rack_location: "",
      min_stock: 0,
      category: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    form.reset({
      name: p.name,
      sku: p.sku,
      unit: p.unit,
      rack_location: p.rack_location,
      min_stock: p.min_stock,
      category: p.category,
    });
    setDialogOpen(true);
  };

  const onSave = form.handleSubmit(async (values) => {
    try {
      if (editing) {
        await updateProduct(editing.id, values);
        toast.success("Produk diperbarui");
      } else {
        await addProduct(values);
        toast.success("Produk ditambahkan");
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan produk");
    }
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      toast.success("Produk dihapus");
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus");
    }
  };

  const tableRows = React.useMemo<ProductTableRow[]>(
    () =>
      products.map((p) => ({
        ...p,
        stock: totalStockForProduct(batches, p.id),
      })),
    [products, batches]
  );

  const columns: ColumnDef<ProductTableRow>[] = [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Nama" />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "sku",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="SKU" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.sku}</span>
        ),
      },
      {
        accessorKey: "category",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Kategori" />
        ),
      },
      {
        accessorKey: "unit",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Satuan" />
        ),
      },
      {
        accessorKey: "rack_location",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Rak" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.rack_location}
          </span>
        ),
      },
      {
        accessorKey: "min_stock",
        header: ({ column }) => (
          <div className="flex justify-end">
            <DataTableColumnHeader column={column} title="Min" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.min_stock}
          </div>
        ),
      },
      {
        accessorKey: "stock",
        header: ({ column }) => (
          <div className="flex justify-end">
            <DataTableColumnHeader column={column} title="Stok" />
          </div>
        ),
        cell: ({ row }) => {
          const low = row.original.stock < row.original.min_stock;
          return (
            <div
              className={`text-right tabular-nums ${low ? "text-destructive font-medium" : ""}`}
            >
              {row.original.stock}
            </div>
          );
        },
      },
      {
        id: "actions",
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => <span className="sr-only">Aksi</span>,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                type="button"
                onClick={() => openEdit(p)}
                aria-label={`Edit ${p.name}`}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                type="button"
                onClick={() => setDeleteTarget(p)}
                aria-label={`Hapus ${p.name}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        },
      },
    ];

  if (!hydrated) {
    return (
      <div className="text-muted-foreground text-sm">Memuat data…</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Produk</h1>
          <p className="text-muted-foreground text-sm">
            Master data: nama, SKU, satuan, rak, dan stok minimum.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" />
          Tambah produk
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
          <p>Belum ada produk.</p>
          <Button className="mt-4" onClick={openCreate}>
            Tambah produk pertama
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tableRows}
          filterPlaceholder="Cari nama, SKU, kategori, rak, stok…"
          globalFilterFn={productsGlobalFilterFn}
          getRowId={(row) => String(row.id)}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit produk" : "Produk baru"}
            </DialogTitle>
            <DialogDescription>
              Kolom wajib sesuai kebutuhan pencatatan gudang.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama produk</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" className="font-mono" {...form.register("sku")} />
                {form.formState.errors.sku && (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.sku.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Satuan</Label>
                <Input id="unit" {...form.register("unit")} />
                {form.formState.errors.unit && (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.unit.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Input id="category" {...form.register("category")} />
              {form.formState.errors.category && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rack_location">Lokasi rak</Label>
              <Input id="rack_location" {...form.register("rack_location")} />
              {form.formState.errors.rack_location && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.rack_location.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_stock">Minimum stok</Label>
              <Input
                id="min_stock"
                type="number"
                min={0}
                {...form.register("min_stock", { valueAsNumber: true })}
              />
              {form.formState.errors.min_stock && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.min_stock.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus produk?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `“${deleteTarget.name}” beserta batch dan riwayat terkait akan dihapus dari demo ini.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
