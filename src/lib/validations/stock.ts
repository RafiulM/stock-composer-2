import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Minimal 8 karakter"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib"),
  sku: z.string().min(1, "SKU wajib"),
  unit: z.string().min(1, "Satuan wajib"),
  rack_location: z.string().min(1, "Lokasi rak wajib"),
  min_stock: z.number().int().min(0, "Minimum stok ≥ 0"),
  category: z.string().min(1, "Kategori wajib"),
});

export const inboundSchema = z.object({
  productId: z.number().int().positive("Pilih produk"),
  quantity: z.number().int().positive("Jumlah harus positif"),
  batchNumber: z.string().min(1, "Nomor batch wajib"),
  date: z.string().min(1, "Tanggal wajib"),
  expiryDate: z.string().optional(),
});

export const outboundSchema = z.object({
  productId: z.number().int().positive("Pilih produk"),
  batchId: z.number().int().positive("Pilih batch"),
  quantity: z.number().int().positive("Jumlah harus positif"),
  notes: z.string().optional(),
});
