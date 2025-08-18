interface Track {
  id: string;
  title: string;
  artist: string | null;
}

async function fetchTracks(slug: string) {
  const res = await fetch(`/api/tag/${slug}/tracks`, { cache: "no-store" });
  if (!res.ok) return { tracks: [] };
  return res.json();
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // TODO: sanitize slug before use
  const data = await fetchTracks(slug);
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Tag: {slug}</h1>
      <ul className="space-y-1">
        {data.tracks.map((t: Track) => (
          <li key={t.id}>
            {t.title} – {t.artist}
            {/* TODO: reuse track card component */}
          </li>
        ))}
      </ul>
    </div>
  );
}
