import { getSessionFromCookie } from "@/utils/auth";
import { getDB } from "@/db";
import { otokaiPlaylistsTable, otokaiPlaylistItemsTable } from "@/db/otokai";
import { sql, eq } from "drizzle-orm";

// User playlists list page (English UI)
export default async function PlaylistsPage() {
  const session = await getSessionFromCookie();
  if (!session) {
    return <div className="p-4">Please sign in.</div>;
  }
  const db = getDB();
  const playlists = await db
    .select({
      id: otokaiPlaylistsTable.id,
      title: otokaiPlaylistsTable.title,
      isPublic: otokaiPlaylistsTable.isPublic,
      trackCount: sql<number>`count(${otokaiPlaylistItemsTable.id})`,
    })
    .from(otokaiPlaylistsTable)
    .leftJoin(
      otokaiPlaylistItemsTable,
      eq(otokaiPlaylistsTable.id, otokaiPlaylistItemsTable.playlistId),
    )
    .where(eq(otokaiPlaylistsTable.userId, session.user.id))
    .groupBy(otokaiPlaylistsTable.id);

  return (
    <div className="p-4 space-y-2">
      <h1 className="text-2xl mb-4">Playlists</h1>
      <ul className="space-y-1">
        {playlists.map((p) => (
          <li key={p.id}>
            <a href={`/dashboard/playlists/${p.id}`} className="underline">
              {p.title} ({p.trackCount}) {p.isPublic ? "🌐" : ""}
            </a>
          </li>
        ))}
      </ul>
      {/* TODO: add creation UI and share link */}
    </div>
  );
}
