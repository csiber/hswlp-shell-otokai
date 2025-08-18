import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

// Otokai music track metadata
export const otokaiTracksTable = sqliteTable("otokai_tracks", {
  id: text().primaryKey().$defaultFn(() => createId()).notNull(),
  r2Key: text().notNull().unique(),
  title: text({ length: 255 }).notNull(),
  artist: text({ length: 255 }),
  durationSec: integer(),
  coverUrl: text({ length: 600 }),
  uploadedBy: text({ length: 255 }),
  createdAt: integer({ mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// User track favorites (likes)
export const otokaiFavoritesTable = sqliteTable(
  "otokai_favorites",
  {
    id: text().primaryKey().$defaultFn(() => createId()).notNull(),
    userId: text().notNull(),
    trackId: text().notNull().references(() => otokaiTracksTable.id),
    createdAt: integer({ mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("otokai_favorites_user_track_unique").on(table.userId, table.trackId),
  ],
);

// Relations
export const otokaiTracksRelations = relations(otokaiTracksTable, ({ many }) => ({
  favorites: many(otokaiFavoritesTable),
}));

export const otokaiFavoritesRelations = relations(otokaiFavoritesTable, ({ one }) => ({
  track: one(otokaiTracksTable, {
    fields: [otokaiFavoritesTable.trackId],
    references: [otokaiTracksTable.id],
  }),
}));

export type OtokaiTrack = typeof otokaiTracksTable.$inferSelect;
export type OtokaiFavorite = typeof otokaiFavoritesTable.$inferSelect;
