import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { buildUploadKey, kindForMime, MAX_UPLOAD_BYTES } from "@/lib/media";
import { presignPut } from "@/lib/r2";

export const runtime = "nodejs";

const bodySchema = z.object({
  fileName: z.string().min(1).max(256),
  contentType: z.string().min(1).max(128),
  sizeBytes: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { fileName, contentType, sizeBytes } = parsed.data;

  const kind = kindForMime(contentType);
  if (!kind) {
    return NextResponse.json({ error: `unsupported content-type ${contentType}` }, { status: 415 });
  }

  const key = buildUploadKey({ userId: user.id, fileName });
  const url = await presignPut({ key, contentType });

  return NextResponse.json({
    key,
    url,
    expiresInSeconds: 600,
    kind,
    maxBytes: MAX_UPLOAD_BYTES,
    echo: { sizeBytes },
  });
}
