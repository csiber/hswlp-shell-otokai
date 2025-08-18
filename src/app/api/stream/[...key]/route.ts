import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(req: Request, { params }: { params: { key: string[] } }) {
  const { env } = getCloudflareContext();
  const key = params.key.join("/");
  const range = req.headers.get("range");

  let object;
  if (range) {
    const parsed = parseRange(range);
    object = await env.hswlp_r2.get(key, { range: parsed });
  } else {
    object = await env.hswlp_r2.get(key);
  }

  if (!object) {
    return new NextResponse("Not found", { status: 404 });
  }

  const headers: Record<string, string> = {
    "Accept-Ranges": "bytes",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": key.endsWith(".ogg") ? "audio/ogg" : "audio/mpeg",
  };

  if (range && object.range) {
    const { offset, length } = object.range;
    headers["Content-Range"] = `bytes ${offset}-${offset + length - 1}/${object.size}`;
    return new NextResponse(object.body, { status: 206, headers });
  }

  return new NextResponse(object.body, { headers });
}

function parseRange(header: string) {
  const match = /^bytes=(\d+)-(\d*)$/.exec(header);
  if (!match) return undefined;
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : undefined;
  return end ? { offset: start, length: end - start + 1 } : { offset: start };
}
