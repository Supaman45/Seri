import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { templates, tracks } from "./schema";

const TEMPLATE_SEED = [
  {
    slug: "highlight-reel",
    name: "Highlight Reel",
    description: "Punchy video cuts synced to the beat. Best for action clips.",
    remotionId: "highlight-reel",
    defaultDurationSeconds: 30,
    schema: {
      clips: "MediaClip[]",
      track: "Track",
      captions: "CaptionWord[] | null",
    },
  },
  {
    slug: "photo-dump",
    name: "Photo Dump",
    description: "Ken Burns on stills with a calm track. 9:16 vertical.",
    remotionId: "photo-dump",
    defaultDurationSeconds: 24,
    schema: {
      photos: "MediaClip[]",
      track: "Track",
    },
  },
  {
    slug: "workout-cut",
    name: "Workout Cut",
    description: "Hard cuts on beat with on-screen set counters.",
    remotionId: "workout-cut",
    defaultDurationSeconds: 30,
    schema: {
      clips: "MediaClip[]",
      track: "Track",
      captions: "CaptionWord[] | null",
    },
  },
  {
    slug: "travel-montage",
    name: "Travel Montage",
    description: "Softer pacing with captions and crossfades.",
    remotionId: "travel-montage",
    defaultDurationSeconds: 30,
    schema: {
      clips: "MediaClip[]",
      track: "Track",
      captions: "CaptionWord[] | null",
    },
  },
];

const TRACK_SEED = [
  {
    title: "Night Drive",
    artist: "Seed Library",
    r2Key: "tracks/night-drive.mp3",
    durationSeconds: "90.000",
    bpm: 120,
    license: "CC0",
    beats: beatGrid(120, 90),
  },
  {
    title: "Sunrise Run",
    artist: "Seed Library",
    r2Key: "tracks/sunrise-run.mp3",
    durationSeconds: "90.000",
    bpm: 140,
    license: "CC0",
    beats: beatGrid(140, 90),
  },
  {
    title: "Soft Light",
    artist: "Seed Library",
    r2Key: "tracks/soft-light.mp3",
    durationSeconds: "90.000",
    bpm: 88,
    license: "CC0",
    beats: beatGrid(88, 90),
  },
];

function beatGrid(bpm: number, seconds: number): number[] {
  const step = 60 / bpm;
  const out: number[] = [];
  for (let t = 0; t <= seconds; t += step) out.push(Number(t.toFixed(3)));
  return out;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  const sql = neon(url);
  const db = drizzle(sql);

  for (const t of TEMPLATE_SEED) {
    await db
      .insert(templates)
      .values(t)
      .onConflictDoUpdate({ target: templates.slug, set: t });
  }
  for (const t of TRACK_SEED) {
    await db
      .insert(tracks)
      .values(t)
      .onConflictDoNothing();
  }

  console.log(`Seeded ${TEMPLATE_SEED.length} templates and ${TRACK_SEED.length} tracks`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
