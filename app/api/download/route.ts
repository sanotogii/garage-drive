import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3, BUCKET, denied } from "../../../lib/s3";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const d = denied(req);
  if (d) return d;
  const params = new URL(req.url).searchParams;
  const key = params.get("key") ?? "";
  const inline = params.get("inline") === "1";
  const range = req.headers.get("range");
  try {
    const r = await s3.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: key, ...(range ? { Range: range } : {}) })
    );
    const name = encodeURIComponent(key.split("/").pop() ?? "");
    const type = r.ContentType || "application/octet-stream";
    const headers: Record<string, string> = {
      "Content-Type": type,
      "Content-Length": String(r.ContentLength),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${name}`,
      "Accept-Ranges": "bytes",
    };
    if (r.ContentRange) headers["Content-Range"] = r.ContentRange;
    // Uploaded HTML/SVG must never run scripts when previewed directly.
    if (inline && /html|svg/i.test(type)) headers["Content-Security-Policy"] = "sandbox";
    return new Response(r.Body!.transformToWebStream(), {
      status: r.ContentRange ? 206 : 200,
      headers,
    });
  } catch (e) {
    return new Response("File not found", { status: 404 });
  }
}
