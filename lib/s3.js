import { S3Client } from "@aws-sdk/client-s3";

export const BUCKET = process.env.S3_BUCKET;

export const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || "garage",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_KEY_ID,
    secretAccessKey: process.env.S3_SECRET,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

// Returns a 401 Response if the password is wrong, otherwise null.
export function denied(req) {
  const pass = process.env.APP_PASSWORD;
  if (!pass) return null;
  const h = req.headers.get("authorization") || "";
  const decoded = h.startsWith("Basic ")
    ? Buffer.from(h.slice(6), "base64").toString()
    : "";
  const i = decoded.indexOf(":");
  if (i >= 0 && decoded.slice(i + 1) === pass) return null;
  return new Response("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Garage Drive"' },
  });
}
