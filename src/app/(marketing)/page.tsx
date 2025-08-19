import { Metadata } from "next";
import { MusicLanding, type Track } from "@/components/landing/MusicLanding";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/constants";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

async function loadTracks(): Promise<Track[]> {
  const res = await fetch(`${SITE_URL}/api/r2/tracks`, { cache: "no-store" });
  if (!res.ok) {
    // TODO: Better error handling and fallbacks
    return [];
  }
  return (await res.json()) as Track[];
}

async function loadFavorites(): Promise<{ ids: string[]; loggedIn: boolean }> {
  const res = await fetch(`${SITE_URL}/api/favorite`, { cache: "no-store" });
  if (!res.ok) {
    return { ids: [], loggedIn: false };
  }
  return { ids: (await res.json()) as string[], loggedIn: true };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ favorites?: string }>;
}) {
  // TODO: Extend query handling for additional marketing filters
  const { favorites } = await searchParams;
  const [tracks, favResult] = await Promise.all([loadTracks(), loadFavorites()]);
  const showFavorites = favorites === "1";
  const filtered = showFavorites
    ? tracks.filter((t) => favResult.ids.includes(t.id))
    : tracks;

  return (
    <main>
      <MusicLanding tracks={filtered} initialFavorites={favResult.ids} userLoggedIn={favResult.loggedIn} />
    </main>
  );
}
