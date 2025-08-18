import { getDB } from "@/db";
import { otokaiTracksTable } from "@/db/otokai";
import { eq } from "drizzle-orm";
import { EmbedPlayer } from "./embed-player.client";

export default async function EmbedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // TODO: sanitize slug
  const db = getDB();
  const [track] = await db
    .select()
    .from(otokaiTracksTable)
    .where(eq(otokaiTracksTable.shareSlug, slug))
    .limit(1);
  if (!track) {
    return <div className="p-4 text-sm">Not found</div>;
  }
  const streamUrl = `/api/stream/${encodeURIComponent(track.r2Key)}`;
  return <EmbedPlayer track={{ title: track.title, artist: track.artist, coverUrl: track.coverUrl, streamUrl }} />;
}
