import { eq } from "drizzle-orm";
import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { media } from "@/db/schema";
import { presignGet } from "@/lib/r2";

/**
 * media.probe — resolves a pending media row.
 *
 * Step 1 lands a stub that flips `pending → ready` using the HEAD metadata
 * already captured by /api/uploads/complete. Step 3 will swap this for a real
 * ffprobe call (range-read the signed URL, parse streams, persist
 * duration/width/height/probe JSON). The event contract and row state
 * machine are stable now so later steps are drop-in.
 */
export const probeMedia = inngest.createFunction(
  { id: "media-probe", retries: 3 },
  { event: "media/probe.requested" },
  async ({ event, step }) => {
    const { mediaId, kind } = event.data;

    const row = await step.run("load-media", async () => {
      const r = await db.query.media.findFirst({ where: eq(media.id, mediaId) });
      if (!r) throw new Error(`media ${mediaId} not found`);
      return r;
    });

    if (row.status === "ready") {
      return { mediaId, skipped: true };
    }

    // Ensure the signed URL is issuable — confirms R2 access + object presence.
    await step.run("ensure-readable", async () => {
      await presignGet({ key: row.r2Key, expiresInSeconds: 60 });
    });

    // Probe placeholder. Image rows can be marked ready immediately.
    const probeResult: {
      durationSeconds: string | null;
      width: number | null;
      height: number | null;
    } = { durationSeconds: null, width: null, height: null };

    if (kind === "image") {
      // Dimensions still unknown until Step 3's ffprobe-based extractor;
      // UI handles missing width/height by rendering a square placeholder.
    }

    await step.run("mark-ready", async () => {
      await db
        .update(media)
        .set({
          status: "ready",
          durationSeconds: probeResult.durationSeconds,
          width: probeResult.width,
          height: probeResult.height,
          probe: { source: "step-1-stub" },
        })
        .where(eq(media.id, mediaId));
    });

    return { mediaId, status: "ready" };
  },
);
