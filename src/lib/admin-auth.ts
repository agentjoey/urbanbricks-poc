/**
 * Admin authentication — app-level password gate for /admin/*.
 *
 * Security requirements:
 *   - ADMIN_PASSWORD must be set and strong, or the app fails closed at startup.
 *   - Password comparison is constant-time so "close" guesses leak nothing.
 *   - The session cookie is signed (HMAC-SHA256) and bound to /admin, so it is
 *     not forgeable without the password.
 *   - The module uses the Web Crypto API only, so it runs in both the Edge
 *     runtime (proxy.ts) and Node.js (Server Actions / Route Handlers).
 */

const ADMIN_COOKIE_NAME = "ub_admin_session";
const TOKEN_SEPARATOR = ".";

const encoder = new TextEncoder();

export const ADMIN_SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminPassword) {
  throw new Error(
    "ADMIN_PASSWORD is not set, so the /admin area cannot be secured. " +
      "Locally: copy .env.example to .env.local and set ADMIN_PASSWORD to a strong password (at least 32 bytes). " +
      "On Vercel: set ADMIN_PASSWORD in the project environment variables.",
  );
}

if (adminPassword.length < 32) {
  throw new Error(
    "ADMIN_PASSWORD is too short (fewer than 32 characters). " +
      "Generate a stronger password and set ADMIN_PASSWORD to at least 32 bytes.",
  );
}

/** Validated admin password, guaranteed present and long enough after the guards above. */
export const ADMIN_PASSWORD = adminPassword;

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes.buffer;
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/**
 * Constant-time comparison of two ArrayBuffers.
 *
 * Implemented directly because SubtleCrypto.timingSafeEqual is not available
 * in all runtimes this module runs in (Edge / Node).
 */
function timingSafeEqual(a: ArrayBuffer, b: ArrayBuffer): boolean {
  const ua = new Uint8Array(a);
  const ub = new Uint8Array(b);
  if (ua.length !== ub.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < ua.length; i++) {
    diff |= ua[i] ^ ub[i];
  }
  return diff === 0;
}

/**
 * Constant-time password comparison.
 *
 * Both the provided and expected passwords are hashed to fixed-length SHA-256
 * digests before comparison, so the comparison time does not depend on the
 * length or content of the guess. The function always hashes both values,
 * even when the lengths differ, to keep the timing profile uniform.
 */
export async function compareAdminPassword(provided: string): Promise<boolean> {
  const providedDigest = await crypto.subtle.digest("SHA-256", encoder.encode(provided));
  const expectedDigest = await crypto.subtle.digest("SHA-256", encoder.encode(ADMIN_PASSWORD));

  return timingSafeEqual(providedDigest, expectedDigest);
}

function sessionPayload(expiresAt: number): string {
  return String(expiresAt);
}

/** Sign a session expiry timestamp into a cookie-safe token. */
export async function signAdminSession(expiresAt: number): Promise<string> {
  const key = await importHmacKey(ADMIN_PASSWORD);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(sessionPayload(expiresAt)));
  return `${expiresAt}${TOKEN_SEPARATOR}${bufferToHex(signature)}`;
}

/**
 * Verify a session token. Returns true only if the signature is valid and the
 * session has not expired.
 */
export async function verifyAdminSession(token: string): Promise<boolean> {
  const [timePart, signatureHex] = token.split(TOKEN_SEPARATOR);
  if (!timePart || !signatureHex || !/^\d+$/.test(timePart)) {
    return false;
  }

  const expiresAt = Number(timePart);
  if (!Number.isFinite(expiresAt)) {
    return false;
  }

  let signature: ArrayBuffer;
  try {
    signature = hexToBuffer(signatureHex);
  } catch {
    return false;
  }

  const key = await importHmacKey(ADMIN_PASSWORD);
  const ok = await crypto.subtle.verify("HMAC", key, signature, encoder.encode(sessionPayload(expiresAt)));

  if (!ok) {
    return false;
  }

  return Date.now() < expiresAt;
}

/** Cookie attributes shared by set and delete. */
export const ADMIN_COOKIE_OPTIONS = {
  name: ADMIN_COOKIE_NAME,
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/admin",
};
