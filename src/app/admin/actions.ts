"use server";

/**
 * Admin Server Actions.
 *
 * - login: checks the password with constant-time comparison and, on success,
 *   sets the signed HttpOnly admin session cookie.
 * - logout: clears the admin session cookie and redirects to /admin/login.
 *
 * The password check is the same whether the guess is close or far away, and
 * the response never names which part failed.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_COOKIE_OPTIONS,
  ADMIN_SESSION_MAX_AGE_MS,
  compareAdminPassword,
  signAdminSession,
  verifyAdminSession,
} from "@/lib/admin-auth";

export interface LoginState {
  status: "idle" | "error";
  message?: string;
}

const GENERIC_LOGIN_ERROR = "Sign-in failed. Check your password and try again.";

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");

  // Reject non-string input without changing the public error.
  if (typeof password !== "string") {
    return { status: "error", message: GENERIC_LOGIN_ERROR };
  }

  // Always run the comparison; the time taken does not reveal how close the
  // guess was.
  const ok = await compareAdminPassword(password);

  if (!ok) {
    return { status: "error", message: GENERIC_LOGIN_ERROR };
  }

  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE_MS;
  const token = await signAdminSession(expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_OPTIONS.name, token, {
    httpOnly: ADMIN_COOKIE_OPTIONS.httpOnly,
    secure: ADMIN_COOKIE_OPTIONS.secure,
    sameSite: ADMIN_COOKIE_OPTIONS.sameSite,
    path: ADMIN_COOKIE_OPTIONS.path,
    expires: new Date(expiresAt),
  });

  redirect("/admin/leads");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_OPTIONS.name, "", {
    httpOnly: ADMIN_COOKIE_OPTIONS.httpOnly,
    secure: ADMIN_COOKIE_OPTIONS.secure,
    sameSite: ADMIN_COOKIE_OPTIONS.sameSite,
    path: ADMIN_COOKIE_OPTIONS.path,
    maxAge: 0,
  });
  redirect("/admin/login");
}

/**
 * Defence-in-depth session check for Server Actions / Route Handlers.
 * Proxy.ts is the primary gate; this lets individual routes fail closed.
 */
export async function isAdminSessionValid(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_OPTIONS.name);
  if (!session) return false;
  return verifyAdminSession(session.value);
}

/** Guard helper: throws if the session is not valid. */
export async function requireAdminSession(): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) {
    throw new Error("Admin session required.");
  }
}
