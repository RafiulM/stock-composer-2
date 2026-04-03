"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { StockByProduct, WeeklyTrendPoint } from "@/lib/dashboard-stats";

const trendConfig = {
  inbound: {
    label: "Stok masuk",
    color: "var(--color-chart-1)",
  },
  outbound: {
    label: "Stok keluar",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig;

const barConfig = {
  total: {
    label: "Jumlah stok",
    color: "var(--color-chart-3)",
  },
} satisfies ChartConfig;

type TrendProps = { data: WeeklyTrendPoint[] };

export function StockTrendChart({ data }: TrendProps) {
  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex aspect-video items-center justify-center rounded-lg border border-dashed text-sm">
        Belum ada data pergerakan untuk grafik.
      </div>
    );
  }

  return (
    <ChartContainer config={trendConfig} className="aspect-auto h-72 w-full">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ left: 12, right: 12, top: 12, bottom: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="weekLabel"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          dataKey="inbound"
          type="monotone"
          fill="var(--color-inbound)"
          fillOpacity={0.3}
          stroke="var(--color-inbound)"
        />
        <Area
          dataKey="outbound"
          type="monotone"
          fill="var(--color-outbound)"
          fillOpacity={0.3}
          stroke="var(--color-outbound)"
        />
      </AreaChart>
    </ChartContainer>
  );
}

type BarProps = { data: StockByProduct[] };

export function StockCompositionChart({ data }: BarProps) {
  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex aspect-video items-center justify-center rounded-lg border border-dashed text-sm">
        Tambah produk untuk melihat komposisi stok.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name:
      d.name.length > 14 ? `${d.name.slice(0, 12)}…` : d.name,
    total: d.total,
    fullName: d.name,
  }));

  return (
    <ChartContainer config={barConfig} className="aspect-auto h-72 w-full">
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{ left: 8, right: 12, top: 12, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          axisLine={false}
          width={100}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="total" fill="var(--color-total)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
