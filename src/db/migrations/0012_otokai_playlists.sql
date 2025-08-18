CREATE TABLE otokai_playlists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT(255) NOT NULL,
  is_public INTEGER DEFAULT 0 NOT NULL,
  share_slug TEXT UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE otokai_playlist_items (
  id TEXT PRIMARY KEY,
  playlist_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  added_at INTEGER NOT NULL,
  UNIQUE(playlist_id, track_id),
  FOREIGN KEY(playlist_id) REFERENCES otokai_playlists(id),
  FOREIGN KEY(track_id) REFERENCES otokai_tracks(id)
);

CREATE INDEX opl_items_playlist_position_idx ON otokai_playlist_items(playlist_id, position);
