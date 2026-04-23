import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { media } from "@/db/schema";

export const runtime = "nodejs";

export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(media)
    .where(eq(media.userId, user.id))
    .orderBy(desc(media.createdAt))
    .limit(100);

  return NextResponse.json({ media: rows });
}
