interface Tag {
  name: string;
  slug: string;
  count: number;
}

async function fetchTags() {
  const res = await fetch("/api/tags", { cache: "no-store" });
  if (!res.ok) return { tags: [] };
  // TODO: expand Tag type with description or color if API changes
  return res.json() as Promise<{ tags: Tag[] }>;
}

export default async function TagsPage() {
  const data = await fetchTags();
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Tags</h1>
      <ul className="space-y-1">
        {data.tags.map((t: Tag) => (
          <li key={t.slug}>
            <a href={`/tag/${t.slug}`}>{t.name} ({t.count})</a>
          </li>
        ))}
      </ul>
      {/* TODO: style as tag cloud/grid later */}
    </div>
  );
}
