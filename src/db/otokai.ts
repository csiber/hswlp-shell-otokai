import { sqliteTable, text, integer, uniqueIndex, index } from "drizzle-orm/sqlite-core";
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

// Tag definitions for tracks
export const otokaiTagsTable = sqliteTable("otokai_tags", {
  id: text().primaryKey().$defaultFn(() => createId()).notNull(),
  name: text({ length: 64 }).notNull(),
  slug: text({ length: 80 }).notNull().unique(),
  createdAt: integer({ mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const otokaiTrackTagsTable = sqliteTable(
  "otokai_track_tags",
  {
    id: text().primaryKey().$defaultFn(() => createId()).notNull(),
    trackId: text().notNull().references(() => otokaiTracksTable.id),
    tagId: text().notNull().references(() => otokaiTagsTable.id),
    createdAt: integer({ mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("ott_track_tag_unique").on(table.trackId, table.tagId),
    index("ott_track_idx").on(table.trackId),
    index("ott_tag_idx").on(table.tagId),
  ],
);

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
  tags: many(otokaiTrackTagsTable),
}));

export const otokaiFavoritesRelations = relations(otokaiFavoritesTable, ({ one }) => ({
  track: one(otokaiTracksTable, {
    fields: [otokaiFavoritesTable.trackId],
    references: [otokaiTracksTable.id],
  }),
}));

export const otokaiTagsRelations = relations(otokaiTagsTable, ({ many }) => ({
  trackTags: many(otokaiTrackTagsTable),
}));

export const otokaiTrackTagsRelations = relations(otokaiTrackTagsTable, ({ one }) => ({
  track: one(otokaiTracksTable, {
    fields: [otokaiTrackTagsTable.trackId],
    references: [otokaiTracksTable.id],
  }),
  tag: one(otokaiTagsTable, {
    fields: [otokaiTrackTagsTable.tagId],
    references: [otokaiTagsTable.id],
  }),
}));

// Playlist tables
export const otokaiPlaylistsTable = sqliteTable("otokai_playlists", {
  id: text().primaryKey().$defaultFn(() => createId()).notNull(),
  userId: text().notNull(),
  title: text({ length: 255 }).notNull(),
  isPublic: integer({ mode: "boolean" }).default(false).notNull(),
  shareSlug: text().unique(),
  createdAt: integer({ mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" }).notNull().$onUpdateFn(() => new Date()),
});

export const otokaiPlaylistItemsTable = sqliteTable(
  "otokai_playlist_items",
  {
    id: text().primaryKey().$defaultFn(() => createId()).notNull(),
    playlistId: text().notNull().references(() => otokaiPlaylistsTable.id),
    trackId: text().notNull().references(() => otokaiTracksTable.id),
    position: integer().notNull(),
    addedAt: integer({ mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("opl_items_playlist_track_unique").on(table.playlistId, table.trackId),
    index("opl_items_playlist_position_idx").on(table.playlistId, table.position),
  ],
);

// Playlist relations
export const otokaiPlaylistsRelations = relations(otokaiPlaylistsTable, ({ many }) => ({
  items: many(otokaiPlaylistItemsTable),
}));

export const otokaiPlaylistItemsRelations = relations(otokaiPlaylistItemsTable, ({ one }) => ({
  playlist: one(otokaiPlaylistsTable, {
    fields: [otokaiPlaylistItemsTable.playlistId],
    references: [otokaiPlaylistsTable.id],
  }),
  track: one(otokaiTracksTable, {
    fields: [otokaiPlaylistItemsTable.trackId],
    references: [otokaiTracksTable.id],
  }),
}));

export type OtokaiTrack = typeof otokaiTracksTable.$inferSelect;
export type OtokaiFavorite = typeof otokaiFavoritesTable.$inferSelect;
export type OtokaiPlaylist = typeof otokaiPlaylistsTable.$inferSelect;
export type OtokaiPlaylistItem = typeof otokaiPlaylistItemsTable.$inferSelect;
export type OtokaiTag = typeof otokaiTagsTable.$inferSelect;
export type OtokaiTrackTag = typeof otokaiTrackTagsTable.$inferSelect;
