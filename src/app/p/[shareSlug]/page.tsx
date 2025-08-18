import { getDB } from "@/db";
import {
  otokaiPlaylistsTable,
  otokaiPlaylistItemsTable,
  otokaiTracksTable,
} from "@/db/otokai";
import { eq, and, asc } from "drizzle-orm";

// Public playlist page
export default async function PublicPlaylistPage({
  params,
}: {
  params: Promise<{ shareSlug: string }>;
}) {
  const { shareSlug } = await params; // TODO: sanitize shareSlug before use
  const db = getDB();
  const [playlist] = await db
    .select()
    .from(otokaiPlaylistsTable)
    .where(
      and(
        eq(otokaiPlaylistsTable.shareSlug, shareSlug),
        eq(otokaiPlaylistsTable.isPublic, true),
      ),
    )
    .limit(1);
  if (!playlist) {
    return <div className="p-4">Playlist not found</div>;
  }
  const items = await db
    .select({
      id: otokaiPlaylistItemsTable.id,
      position: otokaiPlaylistItemsTable.position,
      track: otokaiTracksTable,
    })
    .from(otokaiPlaylistItemsTable)
    .innerJoin(
      otokaiTracksTable,
      eq(otokaiPlaylistItemsTable.trackId, otokaiTracksTable.id),
    )
    .where(eq(otokaiPlaylistItemsTable.playlistId, playlist.id))
    .orderBy(asc(otokaiPlaylistItemsTable.position));

  return (
    <div className="p-4 space-y-2">
      <h1 className="text-2xl mb-4">{playlist.title}</h1>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>{item.track.title} – {item.track.artist}</li>
        ))}
      </ul>
      {/* TODO: implement minimal audio player */}
    </div>
  );
}
