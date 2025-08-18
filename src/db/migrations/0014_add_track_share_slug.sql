-- 0014_add_track_share_slug.sql  (JAVÍTOTT VERZIÓ)
ALTER TABLE otokai_tracks ADD COLUMN share_slug TEXT;

-- SQLite-ban a UNIQUE index engedi a több NULL-t, szóval oké lesz.
CREATE UNIQUE INDEX IF NOT EXISTS otokai_tracks_share_slug_uq ON otokai_tracks (share_slug);