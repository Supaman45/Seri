# ReelForge

Vertical short-form reel maker. Users upload clips + photos, pick a template and music, and the app renders an MP4 they download.

Stack: Next.js 15 (App Router) · TypeScript · Tailwind · shadcn/ui · Remotion · fluent-ffmpeg · Cloudflare R2 · Neon Postgres · Drizzle · Clerk · Inngest · OpenAI Whisper.

## Workspace

```
/apps/web                 Next.js app (UI, API, Inngest handler)
/packages/remotion        Remotion compositions (shared by web + renderer)
```

## Dev quickstart

```bash
pnpm install
cp .env.example apps/web/.env.local   # fill in secrets
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Renders run in Inngest on a long-lived Node host (Railway/Fly) with Chromium + ffmpeg. The Inngest HTTP endpoint is mounted at `/api/inngest` inside the Next app; point the Inngest dashboard at the Railway URL in production.

## Build order

1. Scaffold + auth + upload (this step).
2. Three Remotion templates + picker page.
3. `render.reel` Inngest function.
4. Whisper captions + beat-synced cuts.
5. Library page with past renders.
