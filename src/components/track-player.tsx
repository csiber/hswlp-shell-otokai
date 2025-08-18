"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Pause, Play, SkipForward, Share } from "lucide-react";
import { useSessionStore } from "@/state/session";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Track {
  id: string;
  title: string;
  artist: string | null;
  coverUrl: string | null;
  r2Key: string;
  streamUrl: string;
  shareSlug: string;
}

export function TrackPlayer({ initialTrack, showFooter = false }: { initialTrack?: Track | null; showFooter?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [track, setTrack] = useState<Track | null>(initialTrack ?? null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { session } = useSessionStore();

  const loadRandom = async () => {
    const res = await fetch("/api/tracks/random");
    if (res.ok) {
      const data = (await res.json()) as { track: Track };
      setTrack(data.track);
      setTimeout(() => {
        audioRef.current?.play();
        setIsPlaying(true);
      }, 0);
    }
  };

  useEffect(() => {
    if (!track) {
      loadRandom();
    }
  }, [track]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const nextTrack = async () => {
    await loadRandom();
  };

  const toggleLike = async () => {
    if (!track) return;
    const res = await fetch("/api/favorites/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ track_id: track.id }),
    });
    if (res.status === 401 && !session) {
      window.location.href = "/sign-in";
    }
  };

  const copyLink = async () => {
    if (!track) return;
    await navigator.clipboard.writeText(`https://otokai.hswlp.com/t/${track.shareSlug}`);
    toast.success("Copied");
  };

  const copyEmbed = async () => {
    if (!track) return;
    const code = `<iframe src="https://otokai.hswlp.com/e/${track.shareSlug}" width="480" height="120" frameborder="0" allow="autoplay"></iframe>`;
    await navigator.clipboard.writeText(code);
    toast.success("Copied");
  };

  return (
    <div className="flex flex-col items-center p-4 gap-4 w-full">
      <audio ref={audioRef} src={track?.streamUrl} />
      {track && (
        <div className="text-center">
          {track.coverUrl ? (
            <Image src={track.coverUrl} alt={track.title} width={192} height={192} className="w-48 h-48 object-cover mx-auto" />
          ) : (
            <div className="w-48 h-48 bg-muted mx-auto" />
          )}
          <h2 className="text-xl mt-2">{track.title}</h2>
          <p className="text-muted-foreground">{track.artist}</p>
          <div className="flex gap-2 justify-center mt-4">
            <Button onClick={togglePlay}>{isPlaying ? <Pause /> : <Play />}</Button>
            <Button onClick={nextTrack}><SkipForward /></Button>
            <Button onClick={toggleLike}><Heart /></Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button><Share /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={copyLink}>Copy link</DropdownMenuItem>
                <DropdownMenuItem onClick={copyEmbed}>Copy embed code</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
      {showFooter && track?.shareSlug && (
        <footer className="mt-4 text-sm">
          <a href={`/t/${track.shareSlug}`} className="underline">Share this track</a>
        </footer>
      )}
    </div>
  );
}
