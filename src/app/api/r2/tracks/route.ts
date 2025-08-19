import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Track } from "@/components/landing/MusicLanding";
import { generateSlug } from "@/utils/slugify";
import { parseBuffer } from "music-metadata";

// TODO: Enhance error handling and pagination if bucket grows
async function createTrack(bucket: R2Bucket, key: string): Promise<Track> {
  const base = key.replace(/\.mp3$/i, "");
  const [artistPart, titlePart] = base.includes(" - ") ? base.split(" - ") : [undefined, base];

  // Fájl beolvasása az R2-ből és metaadatok kinyerése
  const object = await bucket.get(key);
  let title = titlePart.trim();
  let artist = artistPart ? artistPart.trim() : "Unknown Artist";
  let album: string | undefined;
  let duration: number | undefined;
  let coverUrl = "https://via.placeholder.com/300?text=Cover";

  if (object) {
    const arrayBuffer = await object.arrayBuffer();
    const metadata = await parseBuffer(Buffer.from(arrayBuffer), key, { duration: true });
    title = metadata.common.title || title;
    artist = metadata.common.artist || artist;
    album = metadata.common.album || undefined;
    if (metadata.format.duration) {
      duration = Math.round(metadata.format.duration);
    }
    const picture = metadata.common.picture?.[0];
    if (picture) {
      coverUrl = `data:${picture.format};base64,${Buffer.from(picture.data).toString("base64")}`;
    }
  }

  return {
    id: generateSlug(base),
    title,
    artist,
    album,
    duration,
    coverUrl,
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
  const trackPromises = list.objects
    .filter((obj) => obj.key.toLowerCase().endsWith(".mp3"))
    .map((obj) => createTrack(bucket, obj.key));
  const tracks = await Promise.all(trackPromises);

  return NextResponse.json(tracks);
}
