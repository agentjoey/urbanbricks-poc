"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface ConsentBannerProps {
  onAccept: () => void;
  onReject: () => void;
}

/**
 * PECR consent banner for analytics cookies.
 *
 * Fixed at the bottom of the viewport so it does not trap navigation or block
 * the primary conversion path. The only shadow in the system (shadow-detached)
 * is permitted because the banner is a temporary overlay.
 */
export function ConsentBanner({ onAccept, onReject }: ConsentBannerProps) {
  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-2xl rounded-md border border-line bg-background p-4 shadow-detached md:left-auto md:p-6"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-ink">
          We use analytics cookies to understand how visitors use our site.{" "}
          <Link href="/privacy" className="underline">
            Privacy notice
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onReject}
            className="rounded-md"
          >
            Reject
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onAccept}
            className="rounded-md hover:bg-brass-hover"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
