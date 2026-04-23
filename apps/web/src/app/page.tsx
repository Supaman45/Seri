import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          ReelForge
        </Link>
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline">Sign in</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/upload">
              <Button variant="outline">Upload</Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      <section className="mt-24 flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-5xl font-semibold tracking-tight">
          Turn clips into vertical reels.
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Drop in videos and photos. Pick a template and a track. Download an MP4 a minute later.
        </p>
        <div className="mt-10 flex gap-3">
          <SignedIn>
            <Link href="/upload">
              <Button size="lg">Start a reel</Button>
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="lg">Get started</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </section>
    </main>
  );
}
