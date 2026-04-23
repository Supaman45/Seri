import "server-only";
import { S3Client } from "@aws-sdk/client-s3";
import { GetObjectCommand, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/env/server";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export const R2_BUCKET = env.R2_BUCKET;

export async function presignPut(opts: {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}) {
  const cmd = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: opts.key,
    ContentType: opts.contentType,
  });
  return getSignedUrl(r2, cmd, { expiresIn: opts.expiresInSeconds ?? 60 * 10 });
}

export async function presignGet(opts: { key: string; expiresInSeconds?: number }) {
  const cmd = new GetObjectCommand({ Bucket: R2_BUCKET, Key: opts.key });
  return getSignedUrl(r2, cmd, { expiresIn: opts.expiresInSeconds ?? 60 * 60 });
}

export async function headObject(key: string) {
  const res = await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  return res;
}
