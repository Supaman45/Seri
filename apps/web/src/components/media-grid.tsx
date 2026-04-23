"use client";

import { useCallback, useEffect, useState } from "react";
import { FileVideo, Image as ImageIcon, Music, Clock } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";

type MediaRow = {
  id: string;
  r2Key: string;
  mimeType: string;
  kind: "video" | "image" | "audio";
  sizeBytes: number | null;
  durationSeconds: string | null;
  width: number | null;
  height: number | null;
  status: "pending" | "ready" | "failed";
  originalName: string | null;
  createdAt: string;
};

export function MediaGrid({ refreshKey }: { refreshKey: number }) {
  const [rows, setRows] = useState<MediaRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/media", { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status}`);
      const body = (await res.json()) as { media: MediaRow[] };
      setRows(body.media);
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  useEffect(() => {
    const hasPending = rows?.some((r) => r.status === "pending");
    if (!hasPending) return;
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [rows, load]);

  if (error) return <p className="text-sm text-destructive">Failed to load media: {error}</p>;
  if (!rows) return <p className="text-sm text-muted-foreground">Loading media…</p>;
  if (rows.length === 0)
    return <p className="text-sm text-muted-foreground">No uploads yet. Drop a file above.</p>;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {rows.map((m) => (
        <div
          key={m.id}
          className="group relative aspect-[9/16] overflow-hidden rounded-lg border bg-muted"
        >
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center">
            <KindIcon kind={m.kind} />
            <div className="line-clamp-2 text-xs font-medium">
              {m.originalName ?? m.r2Key.split("/").pop()}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              {m.sizeBytes ? formatBytes(m.sizeBytes) : "—"}
              {m.durationSeconds ? (
                <span className="inline-flex items-center gap-1">
                  · <Clock className="h-3 w-3" /> {Number(m.durationSeconds).toFixed(1)}s
                </span>
              ) : null}
            </div>
          </div>
          <StatusPill status={m.status} />
        </div>
      ))}
    </div>
  );
}

function KindIcon({ kind }: { kind: MediaRow["kind"] }) {
  const cls = "h-6 w-6 text-muted-foreground";
  if (kind === "video") return <FileVideo className={cls} />;
  if (kind === "image") return <ImageIcon className={cls} />;
  return <Music className={cls} />;
}

function StatusPill({ status }: { status: MediaRow["status"] }) {
  const label = status;
  const color =
    status === "ready"
      ? "bg-emerald-500/90"
      : status === "failed"
        ? "bg-destructive"
        : "bg-amber-500/90";
  return (
    <span
      className={cn(
        "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium text-white",
        color,
      )}
    >
      {label}
    </span>
  );
}
