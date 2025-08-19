import { eq, and } from "drizzle-orm";
import { getDB } from "./index";
// NOTE: this uses the otokai_favourites table
import { otokaiFavouritesTable } from "./schema";

// Kedvencek lekérése felhasználó szerint
export async function getFavoritesByUser(userId: string) {
  const db = getDB();
  const rows = await db.select().from(otokaiFavouritesTable).where(eq(otokaiFavouritesTable.userId, userId));
  return rows;
}

// Kedvenc hozzáadása
export async function addFavorite(userId: string, trackId: string) {
  const db = getDB();
  // Id generálása automatikusan történik a táblában
  await db.insert(otokaiFavouritesTable).values({ userId, trackId });
}

// Kedvenc törlése
export async function removeFavorite(userId: string, trackId: string) {
  const db = getDB();
  await db
    .delete(otokaiFavouritesTable)
    .where(and(eq(otokaiFavouritesTable.userId, userId), eq(otokaiFavouritesTable.trackId, trackId)));
}
