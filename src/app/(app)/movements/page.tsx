"use client";

import Link from "next/link";
import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import * as React from "react";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MovementType } from "@/lib/types";
import { movementLabel, useStockStore } from "@/lib/stock-store";

type MovementTableRow = {
  id: number;
  created_at: string;
  when: string;
  adminName: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  quantityDisplay: string;
  type: MovementType;
  notes: string | null;
};

const movementsGlobalFilterFn: FilterFn<MovementTableRow> = (
  row,
  _columnId,
  filterValue
) => {
  const q = String(filterValue ?? "").toLowerCase();
  if (!q) return true;
  const r = row.original;
  return [
    r.when,
    r.adminName,
    r.productName,
    r.batchNumber,
    r.quantityDisplay,
    movementLabel(r.type),
    r.notes ?? "",
  ]
    .join(" ")
    .toLowerCase()
    .includes(q);
};

export default function MovementsPage() {
  const hydrated = useStockStore((s) => s.hydrated);
  const movements = useStockStore((s) => s.movements);
  const batches = useStockStore((s) => s.batches);
  const products = useStockStore((s) => s.products);
  const user = useStockStore((s) => s.user);

  const tableRows = React.useMemo<MovementTableRow[]>(() => {
    return [...movements]
      .map((m) => {
        const batch = batches.find((b) => b.id === m.batch_id);
        const product = batch
          ? products.find((p) => p.id === batch.product_id)
          : undefined;
        return {
          id: m.id,
          created_at: m.created_at,
          when: format(parseISO(m.created_at), "d MMM yyyy HH:mm", {
            locale: idLocale,
          }),
          adminName: m.user_name ?? user?.name ?? "—",
          productName: product?.name ?? "—",
          batchNumber: batch?.batch_number ?? "—",
          quantity: m.quantity,
          quantityDisplay: product
            ? `${m.quantity} ${product.unit}`
            : String(m.quantity),
          type: m.type,
          notes: m.notes,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [movements, batches, products, user?.name]);

  const columns: ColumnDef<MovementTableRow>[] = [
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Waktu" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs whitespace-nowrap">
            {row.original.when}
          </span>
        ),
      },
      {
        accessorKey: "adminName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Admin" />
        ),
      },
      {
        accessorKey: "productName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Produk" />
        ),
        cell: ({ row }) => (
          <span className="max-w-[160px] truncate">{row.original.productName}</span>
        ),
      },
      {
        accessorKey: "batchNumber",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Batch" />
        ),
        cell: ({ row }) => (
          <span className="max-w-[120px] truncate font-mono text-xs">
            {row.original.batchNumber}
          </span>
        ),
      },
      {
        accessorKey: "quantity",
        header: ({ column }) => (
          <div className="flex justify-end">
            <DataTableColumnHeader column={column} title="Jumlah" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.quantityDisplay}
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Jenis" />
        ),
        sortingFn: (rowA, rowB) =>
          rowA.original.type.localeCompare(rowB.original.type),
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.type === "inbound" ? "default" : "secondary"
            }
          >
            {movementLabel(row.original.type)}
          </Badge>
        ),
      },
      {
        accessorKey: "notes",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Catatan" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground max-w-[200px] truncate text-sm">
            {row.original.notes ?? "—"}
          </span>
        ),
      },
    ];

  if (!hydrated) {
    return (
      <div className="text-muted-foreground text-sm">Memuat data…</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Riwayat</h1>
        <p className="text-muted-foreground text-sm">
          Log pergerakan stok: admin, waktu, produk, jumlah, dan arah.
        </p>
      </div>

      {tableRows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada transaksi</CardTitle>
            <CardDescription>
              Riwayat akan terisi setelah stok masuk atau keluar.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button render={<Link href="/inbound" />}>Stok masuk</Button>
            <Button variant="outline" render={<Link href="/outbound" />}>
              Stok keluar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={tableRows}
          filterPlaceholder="Cari waktu, admin, produk, batch, jenis, catatan…"
          globalFilterFn={movementsGlobalFilterFn}
          initialSorting={[{ id: "created_at", desc: true }]}
          getRowId={(row) => String(row.id)}
        />
      )}
    </div>
  );
}
