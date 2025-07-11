import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  message: text("message").notNull(),
  timestamp: integer("timestamp").notNull(),
  tag: text("tag").notNull(), // "DISCORD" or "WEB"
  rank: text("rank"), // User rank/role
  customTags: text("custom_tags").array(), // Custom tags array
});

export const bannedUsers = pgTable("banned_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  bannedAt: integer("banned_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
});

export const insertBannedUserSchema = createInsertSchema(bannedUsers).omit({
  id: true,
  bannedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type BannedUser = typeof bannedUsers.$inferSelect;
export type InsertBannedUser = z.infer<typeof insertBannedUserSchema>;
