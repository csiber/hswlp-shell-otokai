import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import * as baseSchema from "./schema";
import * as otokaiSchema from "./otokai";

// Combine base template schema with Otokai specific tables
const schema = { ...baseSchema, ...otokaiSchema };

export let db: DrizzleD1Database<typeof schema> | null = null;

export const getDB = () => {
  if (db) {
    return db;
  }

  const { env } = getCloudflareContext();

  if (!env.DB) {
    throw new Error("D1 database not found");
  }

  db = drizzle(env.DB, { schema, logger: true });

  return db;
};
