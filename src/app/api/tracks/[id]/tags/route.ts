import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/utils/auth";
import { withRateLimit, RATE_LIMITS } from "@/utils/with-rate-limit";
import { getDB } from "@/db";
import {
  otokaiTagsTable,
  otokaiTrackTagsTable,
  otokaiTracksTable,
} from "@/db/otokai";
import { eq, sql } from "drizzle-orm";
import slugify from "slugify";

const TAG_NAME_REGEX = /^[a-zA-Z0-9 \-]{2,24}$/;

function normalizeTagName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // TODO: sanitize id
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return withRateLimit(async () => {
    const db = getDB();
    const track = await db.query.otokaiTracksTable.findFirst({
      where: eq(otokaiTracksTable.id, id),
    });
    if (!track || track.uploadedBy !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json().catch(() => null)) as { tags?: string[] } | null;
    const incoming = Array.from(new Set(body?.tags?.map(normalizeTagName) || []));
    const valid = incoming.filter((t) => TAG_NAME_REGEX.test(t));
    if (!valid.length) {
      return NextResponse.json({ error: "Invalid tags" }, { status: 400 });
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(otokaiTrackTagsTable)
      .where(eq(otokaiTrackTagsTable.trackId, id));

    if (count + valid.length > 5) {
      return NextResponse.json({ error: "Too many tags" }, { status: 400 });
    }

    const added: { name: string; slug: string }[] = [];

    for (const name of valid) {
      const baseSlug = slugify(name, { lower: true, strict: true, trim: true });
      let slug = baseSlug;
      let existing = await db.query.otokaiTagsTable.findFirst({ where: eq(otokaiTagsTable.slug, slug) });
      let suffix = 2;
      while (existing && existing.name !== name) {
        slug = `${baseSlug}-${suffix++}`;
        existing = await db.query.otokaiTagsTable.findFirst({ where: eq(otokaiTagsTable.slug, slug) });
      }
      let tag = existing;
      if (!tag) {
        [tag] = await db.insert(otokaiTagsTable).values({ name, slug }).returning();
      }

      await db
        .insert(otokaiTrackTagsTable)
        .values({ trackId: id, tagId: tag.id })
        .onConflictDoNothing();
      added.push({ name: tag.name, slug: tag.slug });
    }

    // TODO: return full tag list for the track after insertion
    return NextResponse.json({ tags: added });
  }, { ...RATE_LIMITS.TAG_WRITE, userIdentifier: session.user.id });
}
