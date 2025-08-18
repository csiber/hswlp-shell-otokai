import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/utils/auth";
import { getDB } from "@/db";
import { otokaiPlaylistsTable, otokaiPlaylistItemsTable } from "@/db/otokai";
import { sql, eq } from "drizzle-orm";

// Saját playlistek listája track darabszámmal
export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDB();
  const playlists = await db
    .select({
      id: otokaiPlaylistsTable.id,
      title: otokaiPlaylistsTable.title,
      isPublic: otokaiPlaylistsTable.isPublic,
      shareSlug: otokaiPlaylistsTable.shareSlug,
      trackCount: sql<number>`count(${otokaiPlaylistItemsTable.id})`,
    })
    .from(otokaiPlaylistsTable)
    .leftJoin(
      otokaiPlaylistItemsTable,
      eq(otokaiPlaylistsTable.id, otokaiPlaylistItemsTable.playlistId),
    )
    .where(eq(otokaiPlaylistsTable.userId, session.user.id))
    .groupBy(otokaiPlaylistsTable.id);

  return NextResponse.json({ playlists });
}
