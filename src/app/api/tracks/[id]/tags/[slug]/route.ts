import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/utils/auth";
import { getDB } from "@/db";
import {
  otokaiTagsTable,
  otokaiTrackTagsTable,
  otokaiTracksTable,
} from "@/db/otokai";
import { eq, and } from "drizzle-orm";

export async function DELETE(req: Request, { params }: { params: { id: string; slug: string } }) {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDB();
  const track = await db.query.otokaiTracksTable.findFirst({ where: eq(otokaiTracksTable.id, params.id) });
  if (!track || track.uploadedBy !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tag = await db.query.otokaiTagsTable.findFirst({ where: eq(otokaiTagsTable.slug, params.slug) });
  if (tag) {
    await db
      .delete(otokaiTrackTagsTable)
      .where(and(eq(otokaiTrackTagsTable.trackId, params.id), eq(otokaiTrackTagsTable.tagId, tag.id)));
  }

  // TODO: optionally return remaining tags
  return NextResponse.json({ ok: true });
}
