import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDB } from "@/db";
import { otokaiTracksTable } from "@/db/otokai";

// Return a random track with a proxied stream URL
export async function GET() {
  const db = getDB();
  const [track] = await db
    .select()
    .from(otokaiTracksTable)
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (!track) {
    return NextResponse.json({ error: "No tracks" }, { status: 404 });
  }

  const streamUrl = `/api/stream/${encodeURIComponent(track.r2Key)}`;
  return NextResponse.json({ track: { ...track, streamUrl } });
}
