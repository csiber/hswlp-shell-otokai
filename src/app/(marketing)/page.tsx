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

export default async function Home() {
  const tracks = await loadTracks();

  return (
    <main>
      <MusicLanding tracks={tracks} />
    </main>
  );
}
