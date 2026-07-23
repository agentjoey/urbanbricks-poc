"use client";

/**
 * Admin login page.
 *
 * Progressive enhancement: a client component for useActionState, but the form
 * is a plain HTML <form> whose fields are native elements. Without JavaScript
 * the browser posts to the Server Action and the page re-renders with the
 * returned state.
 */
import { useActionState } from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { login, type LoginState } from "../actions";

const initialLoginState: LoginState = { status: "idle" };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, initialLoginState);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="border border-input bg-background p-8">
          <h1 className="text-headline text-foreground">Admin sign-in</h1>
          <p className="mt-2 text-body text-muted-foreground">
            Enter the admin password to view leads.
          </p>

          <form action={formAction} className="mt-8 flex flex-col gap-6">
            {state.status === "error" && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-destructive p-4"
              >
                <CircleAlert
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-destructive"
                />
                <p className="text-sm text-foreground">{state.message}</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-password" className="text-label">
                Password
              </Label>
              <Input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={pending}
                className="h-auto w-full rounded-md border border-input bg-transparent px-4 py-3.5 text-base text-foreground"
              />
            </div>

            <Button
              type="submit"
              disabled={pending}
              className={cn(
                "h-auto rounded-md px-8 py-4 text-label hover:bg-brass-hover",
                pending && "cursor-not-allowed opacity-70",
              )}
            >
              {pending && (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin motion-reduce:animate-none"
                />
              )}
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
