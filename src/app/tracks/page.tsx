import { getDB } from "@/db";
import { otokaiTracksTable } from "@/db/otokai";
import { desc } from "drizzle-orm";

export default async function TracksPage() {
  const db = getDB();
  const tracks = await db
    .select()
    .from(otokaiTracksTable)
    .orderBy(desc(otokaiTracksTable.createdAt))
    .limit(50);

  return (
    <div className="p-4 space-y-2">
      <h1 className="text-2xl mb-4">Tracks</h1>
      <ul className="space-y-1">
        {tracks.map((t) => (
          <li key={t.id}>{t.title} – {t.artist}</li>
        ))}
      </ul>
    </div>
  );
}
