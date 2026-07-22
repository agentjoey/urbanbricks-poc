/**
 * TEMPORARY probe route for task f4-shell — DELETE BEFORE COMMITTING.
 *
 * Proving the header's active-nav state requires a route that actually
 * matches a nav item. /models itself does not exist yet (task p1-models),
 * and on the 404 tree usePathname() returns the internal "/_not-found"
 * path, not the browser URL — so the active state cannot be exercised
 * there. This real route under /models/ drives the exact mechanism a real
 * model page will: same layout, same header, real usePathname().
 */
export default function ProbeF4() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-24">
      <h1 className="text-headline">probe-f4</h1>
      <p className="mt-4 text-body">
        Temporary route used only to evidence the f4-shell active navigation
        state. Not part of the site.
      </p>
    </div>
  );
}
