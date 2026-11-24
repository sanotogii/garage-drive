import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3, BUCKET, BUCKET_LIMIT_BYTES, denied } from "../../../lib/s3";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const d = denied(req);
  if (d) return d;
  try {
    let used = 0;
    let token: string | undefined;
    do {
      const r = await s3.send(
        new ListObjectsV2Command({ Bucket: BUCKET, ContinuationToken: token })
      );
      for (const o of r.Contents ?? []) used += o.Size ?? 0;
      token = r.IsTruncated ? r.NextContinuationToken : undefined;
    } while (token);
    return Response.json({
      used,
      limit: BUCKET_LIMIT_BYTES,
      remaining: Math.max(0, BUCKET_LIMIT_BYTES - used),
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
