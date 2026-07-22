"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_ITEMS, QUOTE_CTA, isNavItemActive } from "./nav-items";
import { Wordmark } from "./wordmark";

/** Class hooks shared by the desktop and sheet nav links. */
const navLinkBase =
  "text-label text-ink underline decoration-transparent decoration-2 underline-offset-8 transition-colors duration-150 ease-out motion-reduce:transition-none hover:decoration-ink";
const navLinkActive = "font-semibold decoration-brass-deep";

/**
 * The sticky site header (DESIGN.md § Navigation).
 *
 * - On scroll it commits to the plane with a 1px hairline
 *   (`box-shadow: 0 1px 0 var(--line)`, DESIGN.md § Elevation) — never a
 *   soft shadow.
 * - The active item carries a 2px Deep Brass underline plus a weight step to
 *   600, so the state survives for anyone who cannot see the colour.
 * - Below 900px the nav collapses to a full-height sheet (the installed
 *   shadcn/Radix sheet — it supplies the focus trap and the accessible name
 *   via SheetTitle) with the quote CTA pinned to the bottom, thumb-reachable.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A tap on a sheet link navigates; make sure the sheet never stays open
  // over the destination page. State adjusted during render (not in an
  // effect) per react.dev/learn/you-might-not-need-an-effect.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setSheetOpen(false);
  }

  return (
    <header
      data-debug-pathname={pathname}
      className={cn(
        "sticky top-0 z-40 bg-background transition-shadow duration-150 ease-out motion-reduce:transition-none",
        scrolled && "shadow-[0_1px_0_var(--line)]"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[90rem] items-center justify-between gap-8 px-4 min-[900px]:px-8">
        <Link href="/" aria-label="urbanbricks — home" className="shrink-0 text-ink">
          <Wordmark />
        </Link>

        {/* Desktop nav — 900px and up (DESIGN.md § Navigation: collapses below 900px). */}
        <div className="hidden items-center gap-8 min-[900px]:flex">
          <nav aria-label="Primary">
            <ul className="flex items-center gap-8">
              {NAV_ITEMS.map((item) => {
                const active = isNavItemActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(navLinkBase, active && navLinkActive)}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <Button
            asChild
            size="lg"
            className="rounded-md px-5 text-label duration-150 ease-out motion-reduce:transition-none hover:bg-brass-hover"
          >
            <Link href={QUOTE_CTA.href}>{QUOTE_CTA.label}</Link>
          </Button>
        </div>

        {/* Mobile — below 900px: full-height sheet, CTA pinned to the bottom. */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="min-[900px]:hidden">
              <Menu aria-hidden="true" />
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            aria-describedby={undefined}
            className="w-[85%] max-w-sm gap-0 border-l border-line p-0 shadow-none"
          >
            <SheetHeader className="border-b border-line p-4">
              <SheetTitle className="font-sans text-label text-ink">Menu</SheetTitle>
            </SheetHeader>
            <nav aria-label="Mobile" className="flex-1 overflow-y-auto">
              <ul>
                {NAV_ITEMS.map((item) => {
                  const active = isNavItemActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setSheetOpen(false)}
                        className={cn("block px-4 py-4", navLinkBase, active && navLinkActive)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <SheetFooter className="border-t border-line p-4">
              <Button
                asChild
                className="h-12 w-full rounded-md text-label duration-150 ease-out motion-reduce:transition-none hover:bg-brass-hover"
              >
                <Link href={QUOTE_CTA.href} onClick={() => setSheetOpen(false)}>
                  {QUOTE_CTA.label}
                </Link>
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
