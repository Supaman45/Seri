"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatBytes } from "@/lib/utils";

type Status = "idle" | "presigning" | "uploading" | "finalizing" | "done" | "error";

type Item = {
  id: string;
  file: File;
  status: Status;
  progress: number;
  error?: string;
};

function newId() {
  return Math.random().toString(36).slice(2);
}

export function UploadDropzone({ onUploaded }: { onUploaded?: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const update = useCallback((id: string, patch: Partial<Item>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  const uploadOne = useCallback(
    async (item: Item) => {
      update(item.id, { status: "presigning", progress: 0 });

      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fileName: item.file.name,
          contentType: item.file.type || "application/octet-stream",
          sizeBytes: item.file.size,
        }),
      });

      if (!presignRes.ok) {
        const body = await presignRes.json().catch(() => ({}));
        update(item.id, { status: "error", error: body.error ?? "presign failed" });
        return;
      }

      const { url, key } = (await presignRes.json()) as { url: string; key: string };

      update(item.id, { status: "uploading", progress: 1 });

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        xhr.setRequestHeader("content-type", item.file.type || "application/octet-stream");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            update(item.id, { progress: pct });
          }
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`PUT ${xhr.status}`)));
        xhr.onerror = () => reject(new Error("network error"));
        xhr.send(item.file);
      }).catch((err) => {
        update(item.id, { status: "error", error: err.message });
        throw err;
      });

      update(item.id, { status: "finalizing", progress: 100 });

      const completeRes = await fetch("/api/uploads/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          key,
          fileName: item.file.name,
          contentType: item.file.type || "application/octet-stream",
        }),
      });

      if (!completeRes.ok) {
        const body = await completeRes.json().catch(() => ({}));
        update(item.id, { status: "error", error: body.error ?? "complete failed" });
        return;
      }

      update(item.id, { status: "done", progress: 100 });
      onUploaded?.();
    },
    [onUploaded, update],
  );

  const ingest = useCallback(
    (files: FileList | File[]) => {
      const next: Item[] = [];
      for (const file of Array.from(files)) {
        next.push({ id: newId(), file, status: "idle", progress: 0 });
      }
      if (!next.length) return;
      setItems((prev) => [...next, ...prev]);
      for (const it of next) {
        void uploadOne(it).catch(() => {});
      }
    },
    [uploadOne],
  );

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files?.length) ingest(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-12 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
        )}
      >
        <UploadCloud className="h-8 w-8 text-muted-foreground" />
        <p className="font-medium">Drop videos or photos here</p>
        <p className="text-sm text-muted-foreground">or click to choose files</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="video/*,image/*,audio/*"
          className="hidden"
          onChange={(e) => e.target.files && ingest(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{it.file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatBytes(it.file.size)} · {statusLabel(it)}
                </div>
                {(it.status === "uploading" || it.status === "finalizing") && (
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${it.progress}%` }}
                    />
                  </div>
                )}
              </div>
              <StatusIcon status={it.status} />
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => inputRef.current?.click()}>
          Add more files
        </Button>
      </div>
    </div>
  );
}

function statusLabel(it: Item) {
  switch (it.status) {
    case "idle":
      return "queued";
    case "presigning":
      return "getting upload url…";
    case "uploading":
      return `uploading ${it.progress}%`;
    case "finalizing":
      return "finalizing…";
    case "done":
      return "uploaded";
    case "error":
      return `error: ${it.error ?? "unknown"}`;
  }
}

function StatusIcon({ status }: { status: Status }) {
  if (status === "done") return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  if (status === "error") return <AlertCircle className="h-5 w-5 text-destructive" />;
  if (status === "idle") return null;
  return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
}
