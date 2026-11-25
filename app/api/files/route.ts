import {
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { s3, BUCKET, denied } from "../../../lib/s3";

export const dynamic = "force-dynamic";

const fail = (e: unknown) =>
  Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });

export async function GET(req: Request) {
  const d = denied(req);
  if (d) return d;
  const params = new URL(req.url).searchParams;
  try {
    const key = params.get("key");
    if (key) {
      const h = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
      return Response.json({
        key,
        size: h.ContentLength ?? 0,
        modified: h.LastModified,
        contentType: h.ContentType ?? "application/octet-stream",
        etag: (h.ETag ?? "").replace(/"/g, ""),
        public: h.Metadata?.public === "true",
        bucket: BUCKET,
      });
    }
    const prefix = params.get("prefix") || "";
    const cursor = params.get("cursor") || undefined;
    const limit = Math.min(Number(params.get("limit")) || 50, 1000);
    const r = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
        Delimiter: "/",
        MaxKeys: limit,
        ContinuationToken: cursor,
      })
    );
    return Response.json({
      folders: (r.CommonPrefixes || []).map((p) => p.Prefix),
      files: (r.Contents || [])
        .filter((o) => o.Key !== prefix)
        .map((o) => ({ key: o.Key, size: o.Size, modified: o.LastModified })),
      nextCursor: r.NextContinuationToken ?? null,
      bucket: BUCKET,
    });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  const d = denied(req);
  if (d) return d;
  try {
    const form = await req.formData();
    const prefix = String(form.get("prefix") || "");
    for (const f of form.getAll("files")) {
      if (!(f instanceof File)) continue;
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

// Garage has no object ACLs, so "public" is an x-amz-meta-public flag on the
// object itself, flipped with a self-copy that replaces the metadata.
export async function PATCH(req: Request) {
  const d = denied(req);
  if (d) return d;
  try {
    const key = new URL(req.url).searchParams.get("key") ?? "";
    const body = await req.json().catch(() => ({}));
    const makePublic = body.public === true;
    const h = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    const metadata = { ...(h.Metadata || {}) };
    delete metadata.public;
    if (makePublic) metadata.public = "true";
    // shortcut: self-copy for metadata fails above 5 GB, add multipart copy if needed.
    const copySource = "/" + BUCKET + "/" + key.split("/").map(encodeURIComponent).join("/");
    await s3.send(
      new CopyObjectCommand({
        Bucket: BUCKET,
        Key: key,
        CopySource: copySource,
        MetadataDirective: "REPLACE",
        Metadata: metadata,
        ...(h.ContentType ? { ContentType: h.ContentType } : {}),
      })
    );
    return Response.json({ public: makePublic });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(req: Request) {
  const d = denied(req);
  if (d) return d;
  try {
    const key = new URL(req.url).searchParams.get("key") ?? "";
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    return Response.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
