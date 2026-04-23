"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { UploadDropzone } from "@/components/upload-dropzone";
import { MediaGrid } from "@/components/media-grid";

export default function UploadPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          ReelForge
        </Link>
        <UserButton afterSignOutUrl="/" />
      </header>

      <section className="mt-10 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your media</h1>
          <p className="text-sm text-muted-foreground">
            Uploads go directly to storage. We probe dimensions and duration in the background.
          </p>
        </div>

        <UploadDropzone onUploaded={() => setRefreshKey((k) => k + 1)} />

        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Library</h2>
          <MediaGrid refreshKey={refreshKey} />
        </div>
      </section>
    </main>
  );
}
