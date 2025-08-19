CREATE TABLE otokai_favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
