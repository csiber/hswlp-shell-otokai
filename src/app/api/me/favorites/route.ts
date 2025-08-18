import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDB } from "@/db";
import { otokaiFavoritesTable, otokaiTracksTable } from "@/db/otokai";
import { requireVerifiedEmail } from "@/utils/auth";

export async function GET() {
  const session = await requireVerifiedEmail();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDB();
  const rows = await db
    .select({
      id: otokaiFavoritesTable.id,
      trackId: otokaiFavoritesTable.trackId,
      track: otokaiTracksTable,
    })
    .from(otokaiFavoritesTable)
    .where(eq(otokaiFavoritesTable.userId, session.user.id))
    .innerJoin(otokaiTracksTable, eq(otokaiFavoritesTable.trackId, otokaiTracksTable.id));

  const favorites = rows.map((r) => ({ ...r.track }));
  return NextResponse.json({ favorites });
}
