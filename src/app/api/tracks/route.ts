import { NextResponse } from "next/server";
import { getDB } from "@/db";
import { otokaiTracksTable } from "@/db/otokai";
import { desc, lt } from "drizzle-orm";
import { ensureTrackShareSlug } from "@/utils/track-share-slug";

const DEFAULT_LIMIT = 20;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limitParam = Number(searchParams.get("limit"));
  const limit = !isNaN(limitParam) && limitParam > 0 && limitParam <= DEFAULT_LIMIT ? limitParam : DEFAULT_LIMIT;
  const cursorParam = searchParams.get("cursor");
  const cursor = cursorParam ? Number(cursorParam) : undefined;

  const db = getDB();
  const where = cursor ? lt(otokaiTracksTable.createdAt, new Date(cursor)) : undefined;
  const raw = await db
    .select()
    .from(otokaiTracksTable)
    .where(where)
    .orderBy(desc(otokaiTracksTable.createdAt))
    .limit(limit);

  const tracks = await Promise.all(raw.map((t) => ensureTrackShareSlug(db, t).then((slug) => ({ ...t, shareSlug: slug }))));

  const nextCursor = tracks.length === limit ? tracks[tracks.length - 1].createdAt.getTime() : null;

  return NextResponse.json({ tracks, nextCursor });
}
