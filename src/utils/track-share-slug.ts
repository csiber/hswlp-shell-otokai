import slugify from "slugify";
import { eq } from "drizzle-orm";
import type { getDB } from "@/db";
import { otokaiTracksTable, type OtokaiTrack } from "@/db/otokai";

// Create a unique share slug based on artist and title
async function createBaseSlug(
  db: ReturnType<typeof getDB>,
  title: string,
  artist: string | null,
  id: string,
): Promise<string> {
  let base = slugify(`${artist ?? ""} ${title}`, {
    lower: true,
    strict: true,
    trim: true,
  })
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (base.length > 40) base = base.slice(0, 40);
  if (base.length < 8) {
    const extra = id.replace(/[^a-z0-9]/gi, "").slice(0, 8 - base.length);
    base = `${base}-${extra}`.replace(/-+/g, "-").replace(/^-|-$/g, "");
  }
  if (base.length < 8) {
    base = (base + id).slice(0, 8);
  }
  let slug = base;
  let i = 2;
  while (true) {
    const existing = await db
      .select({ id: otokaiTracksTable.id })
      .from(otokaiTracksTable)
      .where(eq(otokaiTracksTable.shareSlug, slug))
      .limit(1);
    if (existing.length === 0) break;
    const suffix = `-${i++}`;
    slug = `${base.slice(0, Math.max(0, 40 - suffix.length))}${suffix}`;
  }
  return slug;
}

export async function createTrackShareSlug(
  db: ReturnType<typeof getDB>,
  title: string,
  artist: string | null,
  id: string,
): Promise<string> {
  return createBaseSlug(db, title, artist, id);
}

export async function ensureTrackShareSlug(
  db: ReturnType<typeof getDB>,
  track: OtokaiTrack,
): Promise<string> {
  if (track.shareSlug) return track.shareSlug;
  const slug = await createBaseSlug(db, track.title, track.artist, track.id);
  await db
    .update(otokaiTracksTable)
    .set({ shareSlug: slug })
    .where(eq(otokaiTracksTable.id, track.id));
  return slug;
}
