import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "@/db";
import { otokaiTracksTable } from "@/db/otokai";
import { requireVerifiedEmail } from "@/utils/auth";
import { createTrackShareSlug } from "@/utils/track-share-slug";
import { createId } from "@paralleldrive/cuid2";

const MAX_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_TYPES = ["audio/mpeg", "audio/ogg"];

// TODO: add rate limiting
export async function POST(req: Request) {
  const session = await requireVerifiedEmail();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const title = form.get("title")?.toString();
  const artist = form.get("artist")?.toString() || null;
  const coverUrl = form.get("cover_url")?.toString() || null;

  if (!file || !title) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const ext = file.type === "audio/ogg" ? ".ogg" : ".mp3";
  const key = `otokai/${crypto.randomUUID()}${ext}`;
  const { env } = getCloudflareContext();
  await env.hswlp_r2.put(key, file.stream());

  const db = getDB();
  const id = createId();
  const shareSlug = await createTrackShareSlug(db, title, artist, id);
  await db.insert(otokaiTracksTable).values({
    id,
    r2Key: key,
    title,
    artist,
    coverUrl,
    shareSlug,
    uploadedBy: session.user.id,
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true, track: { id, r2Key: key, title, artist, coverUrl, shareSlug } });
}
