import { eq, and } from "drizzle-orm";
import { getDB } from "./index";
import { favoritesTable } from "./schema";

// Kedvencek lekérése felhasználó szerint
export async function getFavoritesByUser(userId: string) {
  const db = getDB();
  const rows = await db.select().from(favoritesTable).where(eq(favoritesTable.userId, userId));
  return rows;
}

// Kedvenc hozzáadása
export async function addFavorite(userId: string, trackId: string) {
  const db = getDB();
  // Id generálása automatikusan történik a táblában
  await db.insert(favoritesTable).values({ userId, trackId });
}

// Kedvenc törlése
export async function removeFavorite(userId: string, trackId: string) {
  const db = getDB();
  await db.delete(favoritesTable).where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.trackId, trackId)));
}
