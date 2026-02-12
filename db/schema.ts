import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const hosts = sqliteTable("hosts", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  hostId: text("host_id").notNull().references(() => hosts.id, { onDelete: "cascade" }),
  guestGroupName: text("guest_group_name").notNull(),
  participantCount: integer("participant_count").notNull(),
  isDelivery: integer("is_delivery", { mode: "boolean" }).default(false),
  status: text("status").notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  rejectionReason: text("rejection_reason"),
}, (table) => ({
  dateGroupIdx: uniqueIndex("date_group_idx").on(table.date, table.guestGroupName),
}));

export const guestGroups = sqliteTable("guest_groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  email: text("email").notNull(),
  count: integer("count").notNull(),
  isDelivery: integer("is_delivery", { mode: "boolean" }).default(false),
  color: text("color"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const groupAssignments = sqliteTable("group_assignments", {
  guestGroupName: text("guest_group_name").primaryKey(),
  email: text("email").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const groupUnavailability = sqliteTable("group_unavailability", {
  id: text("id").primaryKey(),
  guestGroupName: text("guest_group_name").notNull(),
  date: text("date").notNull(),
  reason: text("reason"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type Host = typeof hosts.$inferSelect;
export type NewHost = typeof hosts.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type GuestGroup = typeof guestGroups.$inferSelect;
export type NewGuestGroup = typeof guestGroups.$inferInsert;
