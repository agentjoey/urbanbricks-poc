/**
 * Signed timestamp cookie for the quote-form timing trap (C1-form).
 *
 * The token is a signed issue time: `${timestamp}.${hmac}`. It is set by
 * middleware/proxy on every GET of a page that hosts the form, so even a
 * statically prerendered page gets a real per-visit timestamp. The Server
 * Action verifies the HMAC and measures age, rejecting bots (too fast) and
 * stale or forged cookies (too old / tampered).
 *
 * Uses the Web Crypto API so it runs in both the Edge runtime (middleware)
 * and Node.js (Server Action).
 */

const COOKIE_NAME = "ub_quote_issue";
const TOKEN_SEPARATOR = ".";

const encoder = new TextEncoder();

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

export interface SignedIssueTime {
  issueTime: number;
}

/**
 * Sign an issue time. Returns a string safe for a cookie value.
 */
export async function signIssueTime(
  secret: string,
  issueTime: number,
): Promise<string> {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(String(issueTime)),
  );
  return `${issueTime}${TOKEN_SEPARATOR}${bufferToHex(signature)}`;
}

/**
 * Verify a token. Returns the issue time if the signature is valid, otherwise
 * `null`. Uses `crypto.subtle.verify` for constant-time comparison.
 */
export async function verifyIssueTime(
  secret: string,
  token: string,
): Promise<SignedIssueTime | null> {
  const [timePart, signatureHex] = token.split(TOKEN_SEPARATOR);
  if (!timePart || !signatureHex || !/^\d+$/.test(timePart)) {
    return null;
  }
  const issueTime = Number(timePart);
  if (!Number.isFinite(issueTime)) {
    return null;
  }

  let signature: ArrayBuffer;
  try {
    signature = hexToBuffer(signatureHex);
  } catch {
    return null;
  }

  const key = await importHmacKey(secret);
  const ok = await crypto.subtle.verify(
    "HMAC",
    key,
    signature,
    encoder.encode(timePart),
  );
  return ok ? { issueTime } : null;
}

export { COOKIE_NAME };
