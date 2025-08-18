import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/utils/auth";
import { getDB } from "@/db";
import { otokaiPlaylistsTable } from "@/db/otokai";
import { sql, eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Új privát playlist létrehozása
export async function POST(req: Request) {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const title = body?.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "Missing title" }, { status: 400 });
  }

  const db = getDB();
  const { env } = getCloudflareContext();
  const maxPlaylists = Number(env.OTOKAI_MAX_PLAYLISTS) || 25;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(otokaiPlaylistsTable)
    .where(eq(otokaiPlaylistsTable.userId, session.user.id));

  if (count >= maxPlaylists) {
    return NextResponse.json({ error: "Playlist limit reached" }, { status: 400 });
  }

  const [playlist] = await db
    .insert(otokaiPlaylistsTable)
    .values({ userId: session.user.id, title })
    .returning();

  return NextResponse.json(playlist);
}
