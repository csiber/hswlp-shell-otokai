import { Metadata } from "next";
import { MusicLanding, type Track } from "@/components/landing/MusicLanding";
import { SITE_NAME, SITE_DESCRIPTION } from "@/constants";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

// TODO: Load tracks from backend instead of static list
const demoTracks: Track[] = [
  {
    id: "1",
    title: "Sample Track 1",
    artist: "Artist A",
    coverUrl: "https://picsum.photos/seed/1/200",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "2",
    title: "Sample Track 2",
    artist: "Artist B",
    coverUrl: "https://picsum.photos/seed/2/200",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "3",
    title: "Sample Track 3",
    artist: "Artist C",
    coverUrl: "https://picsum.photos/seed/3/200",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];

export default function Home() {
  return (
    <main>
      <MusicLanding tracks={demoTracks} />
    </main>
  );
}
