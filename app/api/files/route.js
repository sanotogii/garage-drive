import {
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { s3, BUCKET, denied } from "../../../lib/s3";

export const dynamic = "force-dynamic";

const fail = (e) => Response.json({ error: e.message }, { status: 500 });

export async function GET(req) {
  const d = denied(req);
  if (d) return d;
  const prefix = new URL(req.url).searchParams.get("prefix") || "";
  try {
    const r = await s3.send(
      new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix, Delimiter: "/" })
    );
    return Response.json({
      folders: (r.CommonPrefixes || []).map((p) => p.Prefix),
      files: (r.Contents || [])
        .filter((o) => o.Key !== prefix)
        .map((o) => ({ key: o.Key, size: o.Size, modified: o.LastModified })),
    });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req) {
  const d = denied(req);
  if (d) return d;
  try {
    const form = await req.formData();
    const prefix = form.get("prefix") || "";
    for (const f of form.getAll("files")) {
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: prefix + f.name,
          Body: Buffer.from(await f.arrayBuffer()),
          ContentType: f.type || "application/octet-stream",
        })
      );
    }
    return Response.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(req) {
  const d = denied(req);
  if (d) return d;
  try {
    const key = new URL(req.url).searchParams.get("key");
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    return Response.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
