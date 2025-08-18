import { getDB } from "@/db";
import { otokaiTracksTable } from "@/db/otokai";
import { eq } from "drizzle-orm";
import { TrackPlayer } from "@/components/track-player";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = getDB();
  const [track] = await db
    .select()
    .from(otokaiTracksTable)
    .where(eq(otokaiTracksTable.shareSlug, slug))
    .limit(1);
  if (!track) {
    return { title: "Track not found" };
  }
  const cover = track.coverUrl || "/favicon.ico"; // TODO: add dedicated default cover
  return {
    title: `${track.artist ? `${track.artist} – ` : ""}${track.title} | Otokai`,
    openGraph: {
      title: `${track.artist ? `${track.artist} – ` : ""}${track.title} | Otokai`,
      images: [{ url: cover }],
      type: "music.song",
    },
    alternates: { canonical: `https://otokai.hswlp.com/t/${track.shareSlug}` },
    robots: { index: true, follow: true },
  };
}

export default async function TrackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // TODO: sanitize slug
  const db = getDB();
  const [track] = await db
    .select()
    .from(otokaiTracksTable)
    .where(eq(otokaiTracksTable.shareSlug, slug))
    .limit(1);
  if (!track) {
    return <div className="p-4">Track not found</div>;
  }
  const streamUrl = `/api/stream/${encodeURIComponent(track.r2Key)}`;
  return <TrackPlayer initialTrack={{ ...track, streamUrl, shareSlug: track.shareSlug! }} />;
}
