import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';

// GET returns list of track_id for current user's favorites
export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { results } = await db
    .prepare('SELECT track_id FROM otokai_favorites WHERE user_id = ? ORDER BY created_at DESC')
    .bind(user.id)
    .all<{ track_id: string }>();
  const ids = results?.map((r) => r.track_id) ?? [];
  return NextResponse.json(ids);
}

// POST adds a track to favorites in an idempotent way
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let trackId: string | undefined;
  try {
    ({ trackId } = await request.json());
  } catch {
    // ignore parse error
  }
  if (!trackId || typeof trackId !== 'string') {
    return NextResponse.json({ error: 'Invalid trackId' }, { status: 400 });
  }
  const id = `${user.id}:${trackId}`;
  await db
    .prepare(
      'INSERT OR IGNORE INTO otokai_favorites (id, user_id, track_id, created_at) VALUES (?, ?, ?, ?)' 
    )
    .bind(id, user.id, trackId, Date.now())
    .run();
  return NextResponse.json({ ok: true });
}

// DELETE removes a track from favorites
export async function DELETE(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let trackId: string | undefined;
  try {
    ({ trackId } = await request.json());
  } catch {
    // ignore parse error
  }
  if (!trackId || typeof trackId !== 'string') {
    return NextResponse.json({ error: 'Invalid trackId' }, { status: 400 });
  }
  const id = `${user.id}:${trackId}`;
  await db
    .prepare('DELETE FROM otokai_favorites WHERE id = ?')
    .bind(id)
    .run();
  return NextResponse.json({ ok: true });
}
