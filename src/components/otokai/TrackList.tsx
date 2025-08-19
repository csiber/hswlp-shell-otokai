'use client';

import React from 'react';

export interface TrackItem {
  key: string;
  publicUrl: string;
  // TODO: bővíthető később további meta adatokkal
}

interface TrackListProps {
  tracks: TrackItem[];
  currentKey: string | null;
  onSelect: (key: string) => void;
}

export default function TrackList({ tracks, currentKey, onSelect }: TrackListProps) {
  if (tracks.length === 0) {
    return <div>No tracks found.</div>;
  }

  return (
    <ul className="space-y-1 overflow-y-auto max-h-[60vh]">
      {tracks.map((track) => {
        const filename = track.key.split('/').pop() || track.key;
        const selected = track.key === currentKey;
        return (
          <li key={track.key}>
            <button
              onClick={() => onSelect(track.key)}
              className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left hover:bg-gray-200 dark:hover:bg-gray-700 ${selected ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            >
              <span>▶︎</span>
              <span className="truncate">{filename}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
