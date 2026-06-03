import { pgTable, uuid, text, integer, date, timestamp, boolean } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  trainingType: text("training_type").notNull().default("group"), // 'group' | 'duo' | 'individual'
  remainingSessions: integer("remaining_sessions").notNull().default(0),
  role: text("role").notNull().default("client"), // 'admin' | 'client'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reservations = pgTable("reservations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  timeSlot: text("time_slot").notNull(),
  trainingType: text("training_type").notNull(),
  status: text("status").notNull().default("active"), // 'active' | 'cancelled'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const blockedSlots = pgTable("blocked_slots", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull(),
  timeSlot: text("time_slot"), // null means whole day is blocked
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
