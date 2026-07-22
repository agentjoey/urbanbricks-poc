/**
 * Typed database client for server code (server components, Server Actions,
 * route handlers). Never import this from a client component — the env guard
 * below would throw there anyway, because DATABASE_URL is server-only.
 *
 * Driver: neon-http — one-shot queries over HTTPS via @neondatabase/serverless.
 * Server Actions and RSC payloads are exactly the one-shot shape it is built
 * for, and there is no persistent TCP connection to exhaust on Vercel.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set, so the leads database cannot be reached. " +
      "Locally: copy .env.example to .env.local and fill in the Neon connection string. " +
      "On Vercel: set DATABASE_URL in the project environment variables.",
  );
}

export const db = drizzle({ client: neon(databaseUrl), schema });
export * from "./schema";
