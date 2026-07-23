/**
 * Primary navigation items. Labels are sentence case (DESIGN.md § Navigation).
 * The quote CTA is not a nav item — it is rendered separately as the brass
 * primary button so the two never compete (DESIGN.md § Buttons).
 */
export interface NavItem {
  href: string;
  label: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/models", label: "Models" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
];

/** The primary conversion path — PRODUCT.md § Conversion & proof. */
export const QUOTE_CTA = { href: "/contact", label: "Get a quote" } as const;

/**
 * A nav item is active on its own path and on anything nested beneath it
 * (e.g. /models/the-harbor-20 keeps "Models" active).
 */
export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
