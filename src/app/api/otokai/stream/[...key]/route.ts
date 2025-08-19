import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

const EXT_TO_TYPE: Record<string, string> = {
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  flac: "audio/flac",
  wav: "audio/wav",
  ogg: "audio/ogg",
  // TODO: új formátumokhoz bővítsük a listát
};

function getContentType(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase() || "";
  return EXT_TO_TYPE[ext] || "application/octet-stream";
}

function parseRange(rangeHeader: string | null) {
  if (!rangeHeader) return null;
  const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
  if (!match) return null;
  const start = match[1] ? parseInt(match[1], 10) : 0;
  const end = match[2] ? parseInt(match[2], 10) : undefined;
  const length = end !== undefined ? end - start + 1 : undefined;
  return { offset: start, end, length };
}

async function handle(request: Request, params: { key: string[] }, isHead = false) {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=3600",
  });

  const key = decodeURIComponent(params.key.join("/"));
  const { env } = getCloudflareContext();

  const range = parseRange(request.headers.get("Range"));
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Type", getContentType(key));

  try {
    if (isHead) {
      const head = await env.hswlp_r2.head(key);
      if (!head) return new Response("Not Found", { status: 404, headers });

      if (range) {
        const size = head.size;
        let end = range.end ?? size - 1;
        if (end >= size) end = size - 1;
        const length = end - range.offset + 1;
        headers.set("Content-Range", `bytes ${range.offset}-${end}/${size}`);
        headers.set("Content-Length", String(length));
        return new Response(null, { status: 206, headers });
      }
      headers.set("Content-Length", String(head.size));
      return new Response(null, { status: 200, headers });
    }

    if (range) {
      const obj = await env.hswlp_r2.get(key, { range: { offset: range.offset, length: range.length } });
      if (!obj) return new Response("Not Found", { status: 404, headers });
      const size = obj.size;
      const r = obj.range || { offset: range.offset, length: range.length ?? size - range.offset };
      const end = r.offset + r.length - 1;
      headers.set("Content-Range", `bytes ${r.offset}-${end}/${size}`);
      headers.set("Content-Length", String(r.length));
      return new Response(obj.body, { status: 206, headers });
    }

    const obj = await env.hswlp_r2.get(key);
    if (!obj) return new Response("Not Found", { status: 404, headers });
    headers.set("Content-Length", String(obj.size));
    return new Response(obj.body, { status: 200, headers });
  } catch {
    return new Response("Internal Server Error", { status: 500, headers });
  }
}

export async function GET(
  request: Request,
  context: { params: { key: string | string[] } }
) {
  // TODO: revise once Next.js updates route handler context typing
  const params = Array.isArray(context.params.key)
    ? context.params.key
    : [context.params.key];
  return handle(request, { key: params });
}

export async function HEAD(
  request: Request,
  context: { params: { key: string | string[] } }
) {
  // TODO: revise once Next.js updates route handler context typing
  const params = Array.isArray(context.params.key)
    ? context.params.key
    : [context.params.key];
  return handle(request, { key: params }, true);
}
