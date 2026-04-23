import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { media } from "@/db/schema";
import { kindForMime, MAX_UPLOAD_BYTES } from "@/lib/media";
import { headObject } from "@/lib/r2";
import { inngest } from "@/inngest/client";

export const runtime = "nodejs";

const bodySchema = z.object({
  key: z.string().min(1),
  fileName: z.string().min(1).max(256),
  contentType: z.string().min(1).max(128),
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

  const { key, fileName, contentType } = parsed.data;

  // Keys are namespaced under the user id; reject attempts to claim someone else's upload.
  const expectedPrefix = `uploads/${user.id}/`;
  if (!key.startsWith(expectedPrefix)) {
    return NextResponse.json({ error: "key does not belong to user" }, { status: 403 });
  }

  const kind = kindForMime(contentType);
  if (!kind) {
    return NextResponse.json({ error: `unsupported content-type ${contentType}` }, { status: 415 });
  }

  let head;
  try {
    head = await headObject(key);
  } catch {
    return NextResponse.json({ error: "upload not found in R2" }, { status: 404 });
  }

  const sizeBytes = Number(head.ContentLength ?? 0);
  if (sizeBytes <= 0 || sizeBytes > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "invalid object size" }, { status: 400 });
  }

  // Upsert: if the user retries complete, don't double-insert.
  const existing = await db.query.media.findFirst({
    where: and(eq(media.r2Key, key), eq(media.userId, user.id)),
  });

  const row =
    existing ??
    (
      await db
        .insert(media)
        .values({
          userId: user.id,
          r2Key: key,
          mimeType: contentType,
          kind,
          sizeBytes,
          originalName: fileName,
          status: "pending",
        })
        .returning()
    )[0];

  if (!row) {
    return NextResponse.json({ error: "failed to persist media" }, { status: 500 });
  }

  // Kick off the probe in Inngest. ffprobe runs there, not here.
  await inngest.send({
    name: "media/probe.requested",
    data: { mediaId: row.id, key, kind },
  });

  return NextResponse.json({ media: row });
}
