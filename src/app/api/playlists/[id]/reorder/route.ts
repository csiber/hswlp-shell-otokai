import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/utils/auth";
import { getDB } from "@/db";
import {
  otokaiPlaylistsTable,
  otokaiPlaylistItemsTable,
} from "@/db/otokai";
import { eq, and } from "drizzle-orm";

// Teljes új sorrend mentése
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // TODO: ensure ID integrity
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

  const body = (await req.json().catch(() => null)) as
    | { item_ids?: string[] }
    | null; // TODO: narrow body schema
  const ids: string[] | undefined = body?.item_ids;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Invalid item_ids" }, { status: 400 });
  }

  const existing = await db
    .select({ id: otokaiPlaylistItemsTable.id })
    .from(otokaiPlaylistItemsTable)
    .where(eq(otokaiPlaylistItemsTable.playlistId, playlist.id));

  const existingIds = existing.map((i) => i.id).sort();
  const incomingIds = [...ids].sort();
  if (existingIds.length !== incomingIds.length || !existingIds.every((v, i) => v === incomingIds[i])) {
    return NextResponse.json({ error: "Mismatched items" }, { status: 400 });
  }

  let pos = 1;
  for (const id of ids) {
    await db
      .update(otokaiPlaylistItemsTable)
      .set({ position: pos++ })
      .where(eq(otokaiPlaylistItemsTable.id, id));
  }

  return NextResponse.json({ success: true });
}
