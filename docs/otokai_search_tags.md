# Otokai – Keresés és tag rendszer

> TODO: implementálni a leírt funkciókat; jelen dokumentum csak a követendő irányelveket rögzíti.

## 1. D1 adatbázis sémák

### otokai_tags

- `id` TEXT PRIMARY KEY
- `name` TEXT(64) NOT NULL – megjelenített név
- `slug` TEXT(80) UNIQUE NOT NULL – csak kisbetű, szám, kötőjel (a-z0-9-)
- `created_at` INTEGER NOT NULL

### otokai_track_tags

- `id` TEXT PRIMARY KEY
- `track_id` TEXT NOT NULL – hivatkozik `otokai_tracks.id`
- `tag_id` TEXT NOT NULL – hivatkozik `otokai_tags.id`
- `created_at` INTEGER NOT NULL
- `UNIQUE(track_id, tag_id)`
- `INDEX(track_id)`, `INDEX(tag_id)`

**Szabályok**
- Egy trackhez legfeljebb öt tag kapcsolható.
- A tag neve 2–24 karakter közé essen.
- Slug karakterkészlete: a–z, 0–9 és kötőjel.

## 2. API végpontok

### Publikus

- `GET /api/search?q=&tag=` – lapozható track lista (meta + stream URL).
  - Szűrés: `q` → `title` vagy `artist` részleges egyezés, `tag` → tag `slug` alapján.
  - Paraméterek: `limit` (alapértelmezés 20), `cursor`.
- `GET /api/tags` – visszaad minden tagot `{ name, slug, count }` formában, ahol `count` a track kapcsolatok száma.
- `GET /api/tag/:slug/tracks?limit=&cursor=` – adott taghez tartozó trackek listája.

### Authenticated (feltöltők/szerkesztők)

- `POST /api/tracks/:id/tags` – Body: `{ tags: string[] }` névlista alapján hozza létre a hiányzó tageket és kapcsolja a trackhez.
  - Elutasít, ha több mint öt tag lenne vagy tiltott karakter szerepel.
- `DELETE /api/tracks/:id/tags/:slug` – eltávolítja a tag kapcsolatot; a tag rekord megmarad.

**Slug generálás**
- Kisbetűsítés, ékezetmentesítés.
- Szóköz → kötőjel, többszörös kötőjelek összevonása.
- Ütközés esetén számozott postfix: `-2`, `-3`, ...

## 3. UI / Oldalak (Next.js – English by default)

- `/` – landing + player; fejlécben keresőmező → `Enter` átirányít `/search?q=...` oldalra. Lejátszott track alatt jelenjenek meg a tag chipek (`/tag/{slug}` linkek).
- `/search` – keresési oldal két móddal (`q` vagy `tag`); lapozható tracklista, kártyákon Play, Like (belépés nélkül prompt) és tagek.
- `/tags` – tag rács/felhő névvel és számlálóval, kattintás a tag oldalára.
- `/tag/[slug]` – fejlécben a tag neve és track szám; listázott trackek lapozható módon.
- `/dashboard` – feltöltési űrlap opcionális `Tags` mezővel (vessző/space választó), saját feltöltések listáján inline tag kezelés a fenti API-k használatával.

## 4. Rate-limit és validáció

- `POST /api/tracks/:id/tags`: felhasználónként max. 30 írás/óra (KV számláló).
- `GET /api/search`: IP alapon max. 120 lekérés/óra.
- Tag név whitelist: betűk, számok, szóköz, kötőjel; trimelés és többszörös szóköz összevonása.

## 5. Elfogadási kritériumok

- `/search` működik `q` és `tag` paraméterekkel, lapozható.
- `/tags` listázza a tageket darabszámmal.
- `/tag/{slug}` publikus, lejátszható trackekkel.
- Feltöltéskor a tagek mentődnek; dashboardon hozzáadható/eltávolítható.
- Az adatbázis táblák és mezők pontosan a fenti, `otokai_*` prefixszel és snake_case formában.
- Nincs extra npm függőség, natív `<audio>` és egyszerű `fetch`, bundle < 3 MiB.

