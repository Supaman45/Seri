import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";

/**
 * Resolve the current Clerk user to a row in our `users` table,
 * creating the row on first visit. Returns null when signed out.
 */
export async function getOrCreateUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (existing) return existing;

  const clerkUser = await currentUser();
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses?.[0]?.emailAddress ??
    `${userId}@placeholder.local`;

  const [created] = await db
    .insert(users)
    .values({ clerkId: userId, email })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: { email, updatedAt: new Date() },
    })
    .returning();

  return created ?? null;
}

export async function requireUser() {
  const user = await getOrCreateUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}
