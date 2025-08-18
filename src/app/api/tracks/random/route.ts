import { NextResponse } from "next/server";

// TODO: implement real random track selection using D1
export async function GET() {
  return NextResponse.json({ message: "not implemented" }, { status: 501 });
}
