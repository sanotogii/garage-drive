import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3, BUCKET, denied } from "../../../lib/s3";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const d = denied(req);
  if (d) return d;
  const key = new URL(req.url).searchParams.get("key");
  try {
    const r = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const name = encodeURIComponent(key.split("/").pop());
    return new Response(r.Body.transformToWebStream(), {
      headers: {
        "Content-Type": r.ContentType || "application/octet-stream",
        "Content-Length": String(r.ContentLength),
        "Content-Disposition": `attachment; filename*=UTF-8''${name}`,
      },
    });
  } catch (e) {
    return new Response("File not found", { status: 404 });
  }
}
