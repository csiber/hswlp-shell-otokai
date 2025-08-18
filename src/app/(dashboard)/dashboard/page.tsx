"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Track {
  id: string;
  title: string;
  artist: string | null;
}

interface FavoritesResponse {
  favorites: Track[]; // TODO: extend if the API returns more fields
}

export default function DashboardPage() {
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  const loadFavorites = async () => {
    const res = await fetch("/api/me/favorites");
    if (res.ok) {
      const data: FavoritesResponse = await res.json();
      setFavorites(data.favorites);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("title", title);
    if (artist) form.append("artist", artist);
    if (coverUrl) form.append("cover_url", coverUrl);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (res.ok) {
      setTitle("");
      setArtist("");
      setCoverUrl("");
      setFile(null);
      await loadFavorites();
    }
  };

  return (
    <div className="p-4 space-y-8">
      <section>
        <h2 className="text-2xl mb-2">Favorites</h2>
        <ul className="space-y-1">
          {favorites.map((f) => (
            <li key={f.id}>{f.title} – {f.artist}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl mb-2">Upload</h2>
        <form onSubmit={handleUpload} className="space-y-2">
          <input type="file" accept="audio/mpeg,audio/ogg" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input type="text" placeholder="Artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
          <input type="url" placeholder="Cover URL" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} />
          <Button type="submit">Upload</Button>
        </form>
      </section>
    </div>
  );
}
