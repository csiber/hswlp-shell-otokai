import { NextResponse } from "next/server";
import { getDB } from "@/db";
import { otokaiTracksTable } from "@/db/otokai";
import { eq } from "drizzle-orm";
import { ensureTrackShareSlug } from "@/utils/track-share-slug";

// Track metadata by share slug
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params; // TODO: sanitize slug
  const db = getDB();
  const [track] = await db
    .select()
    .from(otokaiTracksTable)
    .where(eq(otokaiTracksTable.shareSlug, slug))
    .limit(1);
  if (!track) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const shareSlug = await ensureTrackShareSlug(db, track);
  const streamUrl = `/api/stream/${encodeURIComponent(track.r2Key)}`;
  return NextResponse.json({ track: { ...track, shareSlug, streamUrl } });
}
