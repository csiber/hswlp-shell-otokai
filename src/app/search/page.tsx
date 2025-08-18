interface SearchParams {
  q?: string;
  tag?: string;
}

async function fetchResults(params: SearchParams) {
  const query = new URLSearchParams(params as Record<string, string>);
  const res = await fetch(`/api/search?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return { tracks: [] };
  // Explicitly type the JSON response to avoid 'unknown' type errors
  return res.json() as Promise<{ tracks: { id: string; title: string; artist: string | null }[]; nextCursor: number | null }>;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const data = await fetchResults(params);
  return (
    <div className="p-4 space-y-4">
      <form className="space-x-2">
        <input
          name="q"
          defaultValue={params.q || ""}
          placeholder="Search"
          className="border p-2"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Search
        </button>
      </form>
      <ul className="space-y-1">
        {data.tracks.map((t: { id: string; title: string; artist: string | null }) => (
          <li key={t.id}>
            {t.title} – {t.artist}
            {/* TODO: display tag chips and play/like controls */}
          </li>
        ))}
      </ul>
    </div>
  );
}
