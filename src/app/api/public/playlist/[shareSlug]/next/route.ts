import { NextResponse } from "next/server";
import { getDB } from "@/db";
import {
  otokaiPlaylistsTable,
  otokaiPlaylistItemsTable,
  otokaiTracksTable,
} from "@/db/otokai";
import { eq, and, asc } from "drizzle-orm";

// Következő track lekérése a publikus playlistből
export async function GET(
  req: Request,
  { params }: { params: Promise<{ shareSlug: string }> },
) {
  const { shareSlug } = await params; // TODO: sanitize slug
  const { searchParams } = new URL(req.url);
  const current = searchParams.get("current");
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
      trackId: otokaiPlaylistItemsTable.trackId,
      track: otokaiTracksTable,
    })
    .from(otokaiPlaylistItemsTable)
    .innerJoin(
      otokaiTracksTable,
      eq(otokaiPlaylistItemsTable.trackId, otokaiTracksTable.id),
    )
    .where(eq(otokaiPlaylistItemsTable.playlistId, playlist.id))
    .orderBy(asc(otokaiPlaylistItemsTable.position));

  if (items.length === 0) {
    return NextResponse.json({ error: "Empty playlist" }, { status: 404 });
  }

  let index = 0;
  if (current) {
    const idx = items.findIndex((i) => i.trackId === current);
    index = idx >= 0 ? (idx + 1) % items.length : 0;
  }

  const track = items[index].track;
  return NextResponse.json({
    track: {
      ...track,
      streamUrl: `/api/stream/${track.r2Key}`,
    },
  });
}
