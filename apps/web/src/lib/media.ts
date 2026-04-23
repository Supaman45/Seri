import type { MediaKind } from "@/db/schema";

const MIME_ALLOWLIST: Record<MediaKind, RegExp> = {
  video: /^video\/(mp4|quicktime|webm|x-matroska)$/,
  image: /^image\/(jpeg|png|webp|heic|heif)$/,
  audio: /^audio\/(mpeg|mp4|aac|wav|x-wav|webm|ogg)$/,
};

export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024; // 500 MB per file

export function kindForMime(mime: string): MediaKind | null {
  if (MIME_ALLOWLIST.video.test(mime)) return "video";
  if (MIME_ALLOWLIST.image.test(mime)) return "image";
  if (MIME_ALLOWLIST.audio.test(mime)) return "audio";
  return null;
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 128);
}

export function buildUploadKey(params: { userId: string; fileName: string }) {
  const safe = sanitizeFileName(params.fileName);
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `uploads/${params.userId}/${ts}-${rand}-${safe}`;
}
