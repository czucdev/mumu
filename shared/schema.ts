import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  imageUrl: text("image_url").notNull(),
  filters: jsonb("filters").$type<{
    currentFilter: string;
    currentFrame: string;
    stickers: Array<{
      id: string;
      emoji: string;
      x: number;
      y: number;
      size: number;
      rotation: number;
    }>;
  }>(),
  photoCount: integer("photo_count").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const photoSessions = pgTable("photo_sessions", {
  id: serial("id").primaryKey(),
  sessionName: text("session_name"),
  photoCount: integer("photo_count").default(3),
  timeDelay: integer("time_delay").default(3),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  photos: many(photos),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  user: one(users, {
    fields: [photos.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPhotoSchema = createInsertSchema(photos).pick({
  userId: true,
  imageUrl: true,
  filters: true,
  photoCount: true,
});

export const insertPhotoSessionSchema = createInsertSchema(photoSessions).pick({
  sessionName: true,
  photoCount: true,
  timeDelay: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertPhotoSession = z.infer<typeof insertPhotoSessionSchema>;
export type PhotoSession = typeof photoSessions.$inferSelect;
