CREATE TABLE IF NOT EXISTS otokai_tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS otokai_track_tags (
  id TEXT PRIMARY KEY,
  track_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(track_id, tag_id),
  FOREIGN KEY(track_id) REFERENCES otokai_tracks(id),
  FOREIGN KEY(tag_id) REFERENCES otokai_tags(id)
);
CREATE INDEX IF NOT EXISTS ott_track_idx ON otokai_track_tags(track_id);
CREATE INDEX IF NOT EXISTS ott_tag_idx ON otokai_track_tags(tag_id);
