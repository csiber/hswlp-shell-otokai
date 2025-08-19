import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

// TODO: később paraméterezni a prefixet
const PREFIX = "music/";

export async function GET() {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
  });

  try {
    const { env } = getCloudflareContext();
    const list = await env.hswlp_r2.list({ prefix: PREFIX, limit: 100 });
    const items = list.objects.map((obj) => ({
      key: obj.key,
      size: obj.size,
      etag: obj.etag,
      lastModified: obj.uploaded.toISOString(),
      contentType: obj.httpMetadata?.contentType,
      publicUrl: `/api/otokai/stream/${encodeURIComponent(obj.key)}`,
    }));
    return NextResponse.json(items, { headers });
  } catch {
    // hiba esetén ne szivárogjon részletes adat
    return NextResponse.json({ error: "Failed to list objects" }, { status: 500, headers });
  }
}
