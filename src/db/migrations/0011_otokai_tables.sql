CREATE TABLE otokai_tracks (
  id TEXT PRIMARY KEY,
  r2_key TEXT UNIQUE NOT NULL,
  title TEXT(255) NOT NULL,
  artist TEXT(255),
  duration_sec INTEGER,
  cover_url TEXT(600),
  uploaded_by TEXT(255),
  created_at INTEGER NOT NULL
);

CREATE TABLE otokai_favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, track_id),
  FOREIGN KEY(track_id) REFERENCES otokai_tracks(id)
);
