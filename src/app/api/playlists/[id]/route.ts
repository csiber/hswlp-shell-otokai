import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/utils/auth";
import { getDB } from "@/db";
import {
  otokaiPlaylistsTable,
  otokaiPlaylistItemsTable,
  otokaiTracksTable,
} from "@/db/otokai";
import { eq, and, asc } from "drizzle-orm";

function generateSlug() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const len = Math.floor(Math.random() * 5) + 8; // 8-12
  let slug = "";
  for (let i = 0; i < len; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

async function getOwnedPlaylist(db: ReturnType<typeof getDB>, id: string, userId: string) {
  const [playlist] = await db
    .select()
    .from(otokaiPlaylistsTable)
    .where(and(eq(otokaiPlaylistsTable.id, id), eq(otokaiPlaylistsTable.userId, userId)))
    .limit(1);
  return playlist;
}

// Saját playlist meta + tételek
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDB();
  const playlist = await getOwnedPlaylist(db, params.id, session.user.id);
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

// Playlist módosítása
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDB();
  const playlist = await getOwnedPlaylist(db, params.id, session.user.id);
  if (!playlist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim()) {
    updates.title = body.title.trim();
  }
  if (typeof body.is_public === "number") {
    updates.isPublic = body.is_public ? 1 : 0;
    if (body.is_public && !playlist.shareSlug) {
      updates.shareSlug = generateSlug();
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(playlist);
  }

  const [updated] = await db
    .update(otokaiPlaylistsTable)
    .set(updates)
    .where(eq(otokaiPlaylistsTable.id, playlist.id))
    .returning();

  return NextResponse.json(updated);
}

// Playlist törlése a tételekkel együtt
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDB();
  const playlist = await getOwnedPlaylist(db, params.id, session.user.id);
  if (!playlist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db
    .delete(otokaiPlaylistItemsTable)
    .where(eq(otokaiPlaylistItemsTable.playlistId, playlist.id));
  await db.delete(otokaiPlaylistsTable).where(eq(otokaiPlaylistsTable.id, playlist.id));

  return NextResponse.json({ success: true });
}
