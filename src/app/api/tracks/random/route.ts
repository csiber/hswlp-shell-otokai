import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDB } from "@/db";
import { otokaiTracksTable } from "@/db/otokai";
import { ensureTrackShareSlug } from "@/utils/track-share-slug";

// Return a random track with a proxied stream URL
export async function GET() {
  const db = getDB();
  const [track] = await db
    .select()
    .from(otokaiTracksTable)
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (!track) {
    // No tracks in the database yet; return 204 instead of 404 to avoid
    // treating this as a missing endpoint.
    // TODO: Consider returning a helpful message or placeholder track later.
    return new Response(null, { status: 204 });
  }

  const shareSlug = await ensureTrackShareSlug(db, track);
  const streamUrl = `/api/stream/${encodeURIComponent(track.r2Key)}`;
  return NextResponse.json({ track: { ...track, shareSlug, streamUrl } });
}
