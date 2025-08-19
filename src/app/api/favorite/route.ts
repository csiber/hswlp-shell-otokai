import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/utils/auth";
import { addFavorite, removeFavorite, getFavoritesByUser } from "@/db/favorites";

// Lekéri a bejelentkezett felhasználó kedvenceit
export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const favorites = await getFavoritesByUser(session.user.id);
  const ids = favorites.map((f) => f.trackId);
  return NextResponse.json(ids);
}

// Kedvenc hozzáadása
export async function POST(request: Request) {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { trackId } = await request.json();
  if (!trackId) {
    return NextResponse.json({ error: "trackId required" }, { status: 400 });
  }

  await addFavorite(session.user.id, trackId);
  return NextResponse.json({ success: true });
}

// Kedvenc törlése
export async function DELETE(request: Request) {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { trackId } = await request.json();
  if (!trackId) {
    return NextResponse.json({ error: "trackId required" }, { status: 400 });
  }

  await removeFavorite(session.user.id, trackId);
  return NextResponse.json({ success: true });
}
