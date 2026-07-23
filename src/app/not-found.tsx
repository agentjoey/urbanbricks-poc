import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-24 min-[900px]:px-8 min-[900px]:py-32">
      <h1 className="text-headline">Page not found</h1>
      <p className="mt-4 max-w-[65ch] text-body">
        The page you are looking for does not exist or has moved.
      </p>
      <ul className="mt-8 space-y-3 text-body">
        <li>
          <Link href="/" className="text-ink underline underline-offset-4">
            Back to the homepage
          </Link>
        </li>
        <li>
          <Link href="/models" className="text-ink underline underline-offset-4">
            Browse the models
          </Link>
        </li>
        <li>
          <Link href="/contact" className="text-ink underline underline-offset-4">
            Get a quote
          </Link>
        </li>
      </ul>
    </div>
  );
}
