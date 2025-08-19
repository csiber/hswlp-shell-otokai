'use client';

import { useCallback, useEffect, useState } from 'react';
import TrackList, { TrackItem } from '@/components/otokai/TrackList';
import PlayerBar from '@/components/otokai/PlayerBar';

export default function OtokaiPage() {
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [error, setError] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<TrackItem | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/otokai/list')
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.json();
      })
      .then((data: TrackItem[]) => {
        if (!mounted) return;
        setTracks(data);
        const stored = sessionStorage.getItem('otokai-current-key');
        if (stored) {
          const match = data.find((t) => t.key === stored);
          if (match) setCurrentTrack(match);
        }
      })
      .catch(() => setError(true));
    return () => {
      mounted = false;
    };
  }, []);

  const handleSelect = useCallback(
    (key: string) => {
      const track = tracks.find((t) => t.key === key);
      if (track) {
        setCurrentTrack(track);
        try {
          sessionStorage.setItem('otokai-current-key', key);
        } catch {
          // ignore sessionStorage errors
        }
      }
    },
    [tracks],
  );

  const currentKey = currentTrack?.key ?? null;
  const currentTitle = currentTrack ? currentTrack.key.split('/').pop() || currentTrack.key : '—';

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-4 pb-24">
        <h1 className="mb-4 text-2xl font-bold">Otokai</h1>
        {error && <div className="mb-4 text-sm text-red-600">Failed to load tracks.</div>}
        <h2 className="mb-2 text-xl font-semibold">Tracks</h2>
        <TrackList tracks={tracks} currentKey={currentKey} onSelect={handleSelect} />
      </main>
      <PlayerBar src={currentTrack?.publicUrl ?? null} title={currentTitle} />
    </div>
  );
}
