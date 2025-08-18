import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/utils/auth";
import { getDB } from "@/db";
import {
  otokaiPlaylistsTable,
  otokaiPlaylistItemsTable,
} from "@/db/otokai";
import { eq, and, sql } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Track hozzáadása a playlisthez
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDB();
  const [playlist] = await db
    .select()
    .from(otokaiPlaylistsTable)
    .where(and(eq(otokaiPlaylistsTable.id, params.id), eq(otokaiPlaylistsTable.userId, session.user.id)))
    .limit(1);
  if (!playlist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const trackId = body?.track_id;
  if (!trackId) {
    return NextResponse.json({ error: "Missing track_id" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(otokaiPlaylistItemsTable)
    .where(and(eq(otokaiPlaylistItemsTable.playlistId, playlist.id), eq(otokaiPlaylistItemsTable.trackId, trackId)))
    .limit(1);
  if (existing.length) {
    return NextResponse.json(existing[0]);
  }

  const { env } = getCloudflareContext();
  const maxItems = Number(env.OTOKAI_MAX_PLAYLIST_ITEMS) || 250;
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(otokaiPlaylistItemsTable)
    .where(eq(otokaiPlaylistItemsTable.playlistId, playlist.id));
  if (count >= maxItems) {
    return NextResponse.json({ error: "Item limit reached" }, { status: 400 });
  }

  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${otokaiPlaylistItemsTable.position}),0)` })
    .from(otokaiPlaylistItemsTable)
    .where(eq(otokaiPlaylistItemsTable.playlistId, playlist.id));

  const [item] = await db
    .insert(otokaiPlaylistItemsTable)
    .values({ playlistId: playlist.id, trackId, position: max + 1 })
    .returning();

  return NextResponse.json(item);
}
