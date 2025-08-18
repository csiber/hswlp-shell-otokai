import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDB } from "@/db";
import { otokaiFavoritesTable } from "@/db/otokai";
import { requireVerifiedEmail } from "@/utils/auth";

interface ToggleFavoritesBody {
  track_id?: string;
  // TODO: extend with additional fields when expanding favorites API
}

export async function POST(req: Request) {
  const session = await requireVerifiedEmail();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: ToggleFavoritesBody = await req.json();
  const trackId = body.track_id;
  if (!trackId) {
    return NextResponse.json({ error: "track_id required" }, { status: 400 });
  }

  const db = getDB();
  const existing = await db
    .select()
    .from(otokaiFavoritesTable)
    .where(and(eq(otokaiFavoritesTable.userId, session.user.id), eq(otokaiFavoritesTable.trackId, trackId)))
    .limit(1);

  if (existing.length) {
    await db.delete(otokaiFavoritesTable).where(eq(otokaiFavoritesTable.id, existing[0].id));
    return NextResponse.json({ favorite: false });
  }

  await db.insert(otokaiFavoritesTable).values({
    userId: session.user.id,
    trackId,
    createdAt: new Date(),
  });

  return NextResponse.json({ favorite: true });
}
