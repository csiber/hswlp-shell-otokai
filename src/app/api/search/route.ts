import { NextResponse } from "next/server";
import { getDB } from "@/db";
import {
  otokaiTracksTable,
  otokaiTrackTagsTable,
  otokaiTagsTable,
} from "@/db/otokai";
import { like, or, and, eq, desc, lt, type SQL } from "drizzle-orm";
import { withRateLimit, RATE_LIMITS } from "@/utils/with-rate-limit";

const DEFAULT_LIMIT = 20;

export async function GET(req: Request) {
  return withRateLimit(async () => {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const tag = searchParams.get("tag")?.trim() || "";
    const limitParam = Number(searchParams.get("limit"));
    const limit = !isNaN(limitParam) && limitParam > 0 && limitParam <= DEFAULT_LIMIT ? limitParam : DEFAULT_LIMIT;
    const cursorParam = searchParams.get("cursor");
    const cursor = cursorParam ? Number(cursorParam) : undefined;

    const db = getDB();

    const conditions: SQL[] = [];
    if (q) {
      const pattern = `%${q}%`;
      conditions.push(or(like(otokaiTracksTable.title, pattern), like(otokaiTracksTable.artist, pattern)));
    }
    if (cursor) {
      conditions.push(lt(otokaiTracksTable.createdAt, new Date(cursor)));
    }

    let query = db
      .select({
        id: otokaiTracksTable.id,
        title: otokaiTracksTable.title,
        artist: otokaiTracksTable.artist,
        r2Key: otokaiTracksTable.r2Key,
        createdAt: otokaiTracksTable.createdAt,
      })
      .from(otokaiTracksTable)
      .orderBy(desc(otokaiTracksTable.createdAt))
      .limit(limit);

    if (tag) {
      query = query
        .leftJoin(otokaiTrackTagsTable, eq(otokaiTracksTable.id, otokaiTrackTagsTable.trackId))
        .leftJoin(otokaiTagsTable, eq(otokaiTrackTagsTable.tagId, otokaiTagsTable.id));
      conditions.push(eq(otokaiTagsTable.slug, tag));
    }

    if (conditions.length) {
      query = query.where(and(...conditions));
    }

    const tracks = await query;
    const nextCursor = tracks.length === limit ? tracks[tracks.length - 1].createdAt.getTime() : null;
    const data = tracks.map((t) => ({
      ...t,
      streamUrl: `/api/stream/${t.r2Key}`,
    }));

    // TODO: attach tag list to each track in response if needed later
    return NextResponse.json({ tracks: data, nextCursor });
  }, RATE_LIMITS.SEARCH);
}
