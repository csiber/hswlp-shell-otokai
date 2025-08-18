import { NextResponse } from "next/server";
import { getDB } from "@/db";
import {
  otokaiPlaylistsTable,
  otokaiPlaylistItemsTable,
  otokaiTracksTable,
} from "@/db/otokai";
import { eq, and, asc } from "drizzle-orm";

// Publikus playlist lekérése share_slug alapján
export async function GET(
  req: Request,
  { params }: { params: Promise<{ shareSlug: string }> },
) {
  const { shareSlug } = await params; // TODO: sanitize slug
  const db = getDB();
  const [playlist] = await db
    .select()
    .from(otokaiPlaylistsTable)
    .where(
      and(
        eq(otokaiPlaylistsTable.shareSlug, shareSlug),
        eq(otokaiPlaylistsTable.isPublic, true),
      ),
    )
    .limit(1);
  if (!playlist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const items = await db
    .select({
      id: otokaiPlaylistItemsTable.id,
      position: otokaiPlaylistItemsTable.position,
      track: otokaiTracksTable,
    })
    .from(otokaiPlaylistItemsTable)
    .innerJoin(
      otokaiTracksTable,
      eq(otokaiPlaylistItemsTable.trackId, otokaiTracksTable.id),
    )
    .where(eq(otokaiPlaylistItemsTable.playlistId, playlist.id))
    .orderBy(asc(otokaiPlaylistItemsTable.position));

  return NextResponse.json({ playlist, items });
}
