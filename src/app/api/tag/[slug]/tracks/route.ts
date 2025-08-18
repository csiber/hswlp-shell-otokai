import { NextResponse } from "next/server";
import { getDB } from "@/db";
import {
  otokaiTracksTable,
  otokaiTrackTagsTable,
  otokaiTagsTable,
} from "@/db/otokai";
import { eq, and, desc, lt } from "drizzle-orm";

const DEFAULT_LIMIT = 20;
// TODO: This limit could be configurable in the future

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const { searchParams } = new URL(req.url);
  const limitParam = Number(searchParams.get("limit"));
  const limit = !isNaN(limitParam) && limitParam > 0 && limitParam <= DEFAULT_LIMIT ? limitParam : DEFAULT_LIMIT;
  const cursorParam = searchParams.get("cursor");
  const cursor = cursorParam ? Number(cursorParam) : undefined;

  const db = getDB();
  const conditions = [eq(otokaiTagsTable.slug, slug)];
  if (cursor) {
    conditions.push(lt(otokaiTracksTable.createdAt, new Date(cursor)));
  }

  const tracks = await db
    .select({
      id: otokaiTracksTable.id,
      title: otokaiTracksTable.title,
      artist: otokaiTracksTable.artist,
      r2Key: otokaiTracksTable.r2Key,
      createdAt: otokaiTracksTable.createdAt,
    })
    .from(otokaiTracksTable)
    .innerJoin(otokaiTrackTagsTable, eq(otokaiTracksTable.id, otokaiTrackTagsTable.trackId))
    .innerJoin(otokaiTagsTable, eq(otokaiTrackTagsTable.tagId, otokaiTagsTable.id))
    .where(and(...conditions))
    .orderBy(desc(otokaiTracksTable.createdAt))
    .limit(limit);

  const nextCursor = tracks.length === limit ? tracks[tracks.length - 1].createdAt.getTime() : null;
  const data = tracks.map((t) => ({
    ...t,
    streamUrl: `/api/stream/${t.r2Key}`,
  }));

  return NextResponse.json({ tracks: data, nextCursor });
}
