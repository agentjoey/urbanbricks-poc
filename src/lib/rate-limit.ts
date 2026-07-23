/**
 * Server-side per-IP rate limit for the quote form (C1-form).
 *
 * In-memory fixed window, keyed by IP. Deliberately NOT persisted: the leads
 * table must not store IPs (spec §4 — personal data and pure compliance
 * burden at POC stage), and a POC-stage limiter only needs to stop a single
 * burst, not survive a redeploy. On Vercel each instance has its own map,
 * which is an accepted approximation at this stage.
 *
 * The key is whatever the platform puts in x-forwarded-for (or x-real-ip);
 * callers pass "unknown" when neither exists, so all un-attributed traffic
 * shares one bucket rather than bypassing the limit.
 */
import "server-only";

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 3;

interface WindowEntry {
  count: number;
  resetAt: number;
}

// Module-level store. Attached to globalThis so Next.js dev-mode module
// re-instantiation does not silently reset the counters.
const globalStore = globalThis as unknown as { __quoteRateLimit?: Map<string, WindowEntry> };
const windows = (globalStore.__quoteRateLimit ??= new Map<string, WindowEntry>());

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the current window closes — for user-facing copy. */
  retryAfterSeconds: number;
}

/**
 * Records one submission attempt against `key` and reports whether it is
 * within the limit. Call this only for submissions that have already passed
 * validation, so a user correcting form errors never burns their quota.
 */
export function consumeRateLimit(key: string, now = Date.now()): RateLimitResult {
  // Lazy sweep of expired windows so the map cannot grow unbounded.
  for (const [entryKey, entry] of windows) {
    if (entry.resetAt <= now) windows.delete(entryKey);
  }

  const entry = windows.get(key);
  if (!entry) {
    windows.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  entry.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  return { allowed: entry.count <= MAX_SUBMISSIONS_PER_WINDOW, retryAfterSeconds };
}

/** Test/observability hook: current count for a key without consuming. */
export function peekRateLimit(key: string, now = Date.now()): number {
  const entry = windows.get(key);
  return entry && entry.resetAt > now ? entry.count : 0;
}
