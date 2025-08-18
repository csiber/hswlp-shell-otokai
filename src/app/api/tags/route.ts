import { NextResponse } from "next/server";
import { getDB } from "@/db";
import { otokaiTagsTable, otokaiTrackTagsTable } from "@/db/otokai";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  const db = getDB();
  const tags = await db
    .select({
      name: otokaiTagsTable.name,
      slug: otokaiTagsTable.slug,
      count: sql<number>`count(${otokaiTrackTagsTable.trackId})`,
    })
    .from(otokaiTagsTable)
    .leftJoin(otokaiTrackTagsTable, eq(otokaiTagsTable.id, otokaiTrackTagsTable.tagId))
    .groupBy(otokaiTagsTable.id)
    .orderBy(otokaiTagsTable.name);

  return NextResponse.json({ tags });
}
