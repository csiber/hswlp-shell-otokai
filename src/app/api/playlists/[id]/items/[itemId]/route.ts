import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/utils/auth";
import { getDB } from "@/db";
import {
  otokaiPlaylistsTable,
  otokaiPlaylistItemsTable,
} from "@/db/otokai";
import { eq, and, asc } from "drizzle-orm";

// Tétel törlése és újrapozicionálás
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const { id, itemId } = await params; // TODO: validate IDs
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDB();
  const [playlist] = await db
    .select()
    .from(otokaiPlaylistsTable)
    .where(
      and(
        eq(otokaiPlaylistsTable.id, id),
        eq(otokaiPlaylistsTable.userId, session.user.id),
      ),
    )
    .limit(1);
  if (!playlist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db
    .delete(otokaiPlaylistItemsTable)
    .where(
      and(
        eq(otokaiPlaylistItemsTable.id, itemId),
        eq(otokaiPlaylistItemsTable.playlistId, playlist.id),
      ),
    );

  // Resequence positions
  const items = await db
    .select({ id: otokaiPlaylistItemsTable.id })
    .from(otokaiPlaylistItemsTable)
    .where(eq(otokaiPlaylistItemsTable.playlistId, playlist.id))
    .orderBy(asc(otokaiPlaylistItemsTable.position));

  let pos = 1;
  for (const item of items) {
    await db
      .update(otokaiPlaylistItemsTable)
      .set({ position: pos++ })
      .where(eq(otokaiPlaylistItemsTable.id, item.id));
  }

  return NextResponse.json({ success: true });
}
