import { relations, sql } from "drizzle-orm";
import {
  bigint,
  index,
  integer,
  json,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ---------- users (shadow of Clerk) ----------
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    clerkId: text("clerk_id").notNull().unique(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    clerkIdx: index("users_clerk_idx").on(t.clerkId),
  }),
);

// ---------- media ----------
export const mediaKindValues = ["video", "image", "audio"] as const;
export type MediaKind = (typeof mediaKindValues)[number];

export const mediaStatusValues = ["pending", "ready", "failed"] as const;
export type MediaStatus = (typeof mediaStatusValues)[number];

export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    r2Key: text("r2_key").notNull().unique(),
    mimeType: text("mime_type").notNull(),
    kind: text("kind", { enum: mediaKindValues }).notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }),
    durationSeconds: numeric("duration_seconds", { precision: 10, scale: 3 }),
    width: integer("width"),
    height: integer("height"),
    status: text("status", { enum: mediaStatusValues }).notNull().default("pending"),
    probe: json("probe").$type<Record<string, unknown> | null>(),
    originalName: text("original_name"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userCreatedIdx: index("media_user_created_idx").on(t.userId, t.createdAt),
  }),
);

// ---------- templates ----------
export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  thumbnailR2Key: text("thumbnail_r2_key"),
  remotionId: text("remotion_id").notNull(),
  defaultDurationSeconds: integer("default_duration_seconds").notNull(),
  schema: json("schema").notNull().$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- tracks ----------
export const tracks = pgTable("tracks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  r2Key: text("r2_key").notNull(),
  waveformR2Key: text("waveform_r2_key"),
  beats: json("beats").$type<number[] | null>(),
  durationSeconds: numeric("duration_seconds", { precision: 10, scale: 3 }).notNull(),
  bpm: integer("bpm"),
  license: text("license"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- render_jobs ----------
export const renderJobStatusValues = [
  "queued",
  "preparing",
  "transcribing",
  "rendering",
  "uploading",
  "ready",
  "failed",
] as const;
export type RenderJobStatus = (typeof renderJobStatusValues)[number];

export const renderJobs = pgTable(
  "render_jobs",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    templateId: uuid("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "restrict" }),
    trackId: uuid("track_id").references(() => tracks.id, { onDelete: "set null" }),
    inngestEventId: text("inngest_event_id").unique(),
    status: text("status", { enum: renderJobStatusValues }).notNull().default("queued"),
    progress: integer("progress").notNull().default(0),
    error: text("error"),
    inputProps: json("input_props").notNull().$type<Record<string, unknown>>(),
    outputR2Key: text("output_r2_key"),
    outputDurationSeconds: numeric("output_duration_seconds", { precision: 10, scale: 3 }),
    captionsR2Key: text("captions_r2_key"),
    stepState: json("step_state")
      .notNull()
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::json`),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userCreatedIdx: index("render_jobs_user_created_idx").on(t.userId, t.createdAt),
    statusIdx: index("render_jobs_status_idx").on(t.status),
  }),
);

// ---------- render_job_media (ordered join) ----------
export const renderJobMedia = pgTable(
  "render_job_media",
  {
    renderJobId: uuid("render_job_id")
      .notNull()
      .references(() => renderJobs.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "restrict" }),
    position: integer("position").notNull(),
    trimStartSeconds: numeric("trim_start_seconds", { precision: 10, scale: 3 }),
    trimEndSeconds: numeric("trim_end_seconds", { precision: 10, scale: 3 }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.renderJobId, t.position] }),
    mediaIdx: index("render_job_media_media_idx").on(t.mediaId),
  }),
);

// ---------- relations ----------
export const usersRelations = relations(users, ({ many }) => ({
  media: many(media),
  renderJobs: many(renderJobs),
}));

export const mediaRelations = relations(media, ({ one, many }) => ({
  user: one(users, { fields: [media.userId], references: [users.id] }),
  renderJobs: many(renderJobMedia),
}));

export const templatesRelations = relations(templates, ({ many }) => ({
  renderJobs: many(renderJobs),
}));

export const tracksRelations = relations(tracks, ({ many }) => ({
  renderJobs: many(renderJobs),
}));

export const renderJobsRelations = relations(renderJobs, ({ one, many }) => ({
  user: one(users, { fields: [renderJobs.userId], references: [users.id] }),
  template: one(templates, { fields: [renderJobs.templateId], references: [templates.id] }),
  track: one(tracks, { fields: [renderJobs.trackId], references: [tracks.id] }),
  clips: many(renderJobMedia),
}));

export const renderJobMediaRelations = relations(renderJobMedia, ({ one }) => ({
  renderJob: one(renderJobs, {
    fields: [renderJobMedia.renderJobId],
    references: [renderJobs.id],
  }),
  media: one(media, { fields: [renderJobMedia.mediaId], references: [media.id] }),
}));
