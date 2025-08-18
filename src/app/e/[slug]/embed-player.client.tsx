"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

interface Track {
  title: string;
  artist: string | null;
  coverUrl: string | null;
  streamUrl: string;
}

export function EmbedPlayer({ track }: { track: Track }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const onTime = () => {
    if (!audioRef.current || !audioRef.current.duration) return;
    setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const val = Number(e.target.value);
    audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
    setProgress(val);
  };

  return (
    <div className="flex w-full h-full items-center gap-3 p-2 text-sm">
      <audio ref={audioRef} src={track.streamUrl} onTimeUpdate={onTime} />
      {track.coverUrl ? (
        <Image src={track.coverUrl} alt={track.title} width={96} height={96} className="w-20 h-20 object-cover" />
      ) : (
        <div className="w-20 h-20 bg-muted" />
      )}
      <div className="flex-1 overflow-hidden">
        <p className="truncate font-medium">{track.title}</p>
        <p className="truncate text-muted-foreground">{track.artist}</p>
        <input type="range" min={0} max={100} value={progress} onChange={onSeek} className="w-full" />
      </div>
      <Button onClick={togglePlay}>{isPlaying ? <Pause /> : <Play />}</Button>
    </div>
  );
}
