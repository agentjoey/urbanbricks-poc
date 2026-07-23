import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside the Next.js runtime, so it does not get Next's
// automatic .env loading. @next/env reproduces Next's exact load order
// (documented pattern — Next.js "Environment Variables" guide), which is what
// picks up the gitignored .env.local holding the real Neon connection string.
loadEnvConfig(process.cwd());

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and fill in the " +
      "Neon connection string before running drizzle-kit.",
  );
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url },
});
