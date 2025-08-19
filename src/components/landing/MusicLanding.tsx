'use client';

import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";

// Egyszerű zenelejátszó placeholder
// TODO: Integrálni valódi audio lejátszást később
export function MusicLanding() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
        {/* TODO: Replace with real cover image */}
        <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-md mb-4" />

        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Track Title
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Artist</p>

        <div className="flex items-center gap-4 mb-4">
          <button
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            aria-label="Previous track"
          >
            <SkipBack className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>

          <button
            className="p-4 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>

          <button
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
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
      </div>
    </div>
  );
}

