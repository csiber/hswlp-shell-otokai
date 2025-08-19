import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Track } from "@/components/landing/MusicLanding";
import { generateSlug } from "@/utils/slugify";

// TODO: Enhance error handling and pagination if bucket grows
function createTrack(key: string): Track {
  const base = key.replace(/\.mp3$/i, "");
  const [artistPart, titlePart] = base.includes(" - ") ? base.split(" - ") : [undefined, base];

  return {
    id: generateSlug(base),
    title: titlePart.trim(),
    artist: artistPart ? artistPart.trim() : "Unknown Artist",
    // TODO: Később cseréljük igazi borítóra vagy saját placeholderre
    coverUrl: "https://via.placeholder.com/300?text=Cover",
    audioUrl: `/api/r2/track?file=${encodeURIComponent(key)}`,
  };
}

export async function GET() {
  const { env } = getCloudflareContext();
  const bucket = env.hswlp_r2;

  if (!bucket) {
    return NextResponse.json({ error: "R2 bucket not configured" }, { status: 500 });
  }

  const list = await bucket.list();
  const tracks: Track[] = list.objects
    .filter((obj) => obj.key.toLowerCase().endsWith(".mp3"))
    .map((obj) => createTrack(obj.key));

  return NextResponse.json(tracks);
}
