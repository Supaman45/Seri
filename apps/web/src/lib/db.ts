import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/env/server";
import * as schema from "@/db/schema";

const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, { schema });
export type Db = typeof db;
export { schema };
