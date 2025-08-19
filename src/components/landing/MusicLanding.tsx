'use client';

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";

export type Track = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
};

interface MusicLandingProps {
  tracks: Track[];
}

// Egyszerű zenelejátszó placeholder
// TODO: Integrálni valódi audio lejátszást később, bővítve playlist kezeléssel
export function MusicLanding({ tracks }: MusicLandingProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = tracks[currentTrackIndex];
  const hasPrev = currentTrackIndex > 0;
  const hasNext = currentTrackIndex < tracks.length - 1;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      void audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    // TODO: Sync progress bar with actual time
    setIsPlaying(false);
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.load();
    }
  }, [currentTrackIndex]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
        <Image
          src={currentTrack.coverUrl}
          alt={currentTrack.title}
          width={192}
          height={192}
          className="w-48 h-48 object-cover rounded-md mb-4"
        />

        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {currentTrack.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {currentTrack.artist}
        </p>

        <div className="flex items-center gap-4 mb-4">
          <button
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            onClick={() => setCurrentTrackIndex((i) => i - 1)}
            disabled={!hasPrev}
            aria-label="Previous track"
          >
            <SkipBack className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>

          <button
            className="p-4 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>

          <button
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            onClick={() => setCurrentTrackIndex((i) => i + 1)}
            disabled={!hasNext}
            aria-label="Next track"
          >
            <SkipForward className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="w-full mb-2">
          {/* TODO: Progress bar should reflect actual track time */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>0:00</span>
            <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded">
              <div className="h-1 bg-indigo-500 w-1/4"></div>
            </div>
            <span>3:45</span>
          </div>
        </div>

        <div className="w-full flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          {/* TODO: Volume slider should control volume */}
          <input type="range" min="0" max="100" className="w-full" />
        </div>

        {/* Rejtett audio elem a lejátszáshoz */}
        <audio ref={audioRef} src={currentTrack.audioUrl} className="hidden" />
      </div>
    </div>
  );
}

