import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const movementTypeEnum = pgEnum("movement_type", [
  "inbound",
  "outbound",
]);

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  unit: text("unit").notNull(),
  rackLocation: text("rack_location").notNull(),
  minStock: integer("min_stock").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export const batches = pgTable("batches", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  batchNumber: text("batch_number").notNull(),
  currentQuantity: integer("current_quantity").notNull(),
  expiryDate: text("expiry_date"),
});

export const movements = pgTable("movements", {
  id: serial("id").primaryKey(),
  type: movementTypeEnum("type").notNull(),
  quantity: integer("quantity").notNull(),
  batchId: integer("batch_id")
    .notNull()
    .references(() => batches.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  notes: text("notes"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const productsRelations = relations(products, ({ many }) => ({
  batches: many(batches),
}));

export const batchesRelations = relations(batches, ({ one, many }) => ({
  product: one(products, {
    fields: [batches.productId],
    references: [products.id],
  }),
  movements: many(movements),
}));

export const movementsRelations = relations(movements, ({ one }) => ({
  batch: one(batches, {
    fields: [movements.batchId],
    references: [batches.id],
  }),
  user: one(user, {
    fields: [movements.userId],
    references: [user.id],
  }),
}));
