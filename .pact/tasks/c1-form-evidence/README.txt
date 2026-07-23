# c1-form evidence (re-review round — three failure-path defects fixed)

Component under review: `src/app/actions/quote.ts` (Server Action) +
`src/components/quote-form/` (unchanged this round).

## Build provenance

All browser evidence and all functional POSTs ran against a REAL production
build (`pnpm build` + `next start` on :3411), never a dev server. Because
sibling worker sessions share the repo tree (the shared-`.next` race from
earlier rounds), the build ran in a byte-identical clonefile copy of the
tree at /tmp/c1fix-run (node_modules clonefile-copied — Turbopack rejects
an out-of-root symlink), with ONE difference: a sibling's unfinished
`src/app/probe-c2/` was excluded from the copy. The probe route used for
these shots, `src/app/probe-c1fix`, was deleted from the repo before
committing. Every screenshot below was visually inspected after capture —
all are from the final code, not a superseded build (this replaces the
09:52 artifacts from the previous round).

Two stale-server hazards were hit and handled during the run: an orphaned
next-server holding :3411 made the first DB-failure server start fail with
EADDRINUSE — detected via `lsof` (cwd verified as the /tmp copy), orphan
killed, state 07 redone cleanly against the correct server.

## What each file proves

- `01-idle-light.png` — form at rest on the default (light) surface:
  full field set, native selects, consent checkbox with privacy link,
  brass submit.
- `02-idle-dark.png` — form at rest inside `.ink-surface`: token-driven
  dark swap reaches inputs, labels, checkbox and button.
- `03-validation-errors.png` — empty form submitted after the 3s timing
  window: banner with icon + text, per-field notes on name / email /
  consent (icon + text, never colour alone), `aria-invalid` borders.
- `04-submitting.png` — pending state mid-submission (network throttled
  via CDP): "Sending…" + spinner, button disabled, input preserved.
- `05-success.png` — accepted submission: "Request received" panel.
  DB-verified: exactly 1 row for the shot's email, then deleted.
- `06-rate-limited.png` — 4th submission inside the 3-per-10min quota
  (two functional POSTs + the 05 success burned the three): rate-limited
  banner naming the fallback email hello@urbanbricks.uk, fields
  repopulated, 0 rows written by the rejected attempt.
- `07-server-failure.png` — production server restarted with a bogus
  DATABASE_URL, real submission through the page: fallback-email error
  banner, fields repopulated, 0 rows. The runtime log carries exactly one
  structured `quote_form_db_write_failed` line with the COMPLETE
  submission (see server-log-excerpts.txt).
- `server-log-excerpts.txt` — verbatim runtime-log lines from the
  production server proving the new observability (details below).

## The three reviewed defects and their proof

1. HIGH — hidden-field validation was a silent dead end.
   `quote.ts` now splits zod issues: visible-field issues go back to the
   user as field notes; hidden-field issues (model_slug, utm_*,
   source_path) are logged via `quote_form_hidden_field_rejected` and the
   bad value is DROPPED, then the submission re-validates and proceeds.
   Proof (the reviewer's exact scenario): a no-JS multipart POST, valid in
   every visible field but with `model_slug=the-atlantis-9000`, returned
   "Request received" and WROTE the row — DB row shows model_slug null
   (attribution lost, lead kept), and the log line carries
   `recovered:true` with field/message/value. Regression check: invalid
   email + bad model_slug still returns the normal validation-error state
   with a note on email only ("Unknown model." never reaches the user);
   the hidden issue is logged without `recovered`.

2. MEDIUM-HIGH — timing trap bypassed by deleting rendered_at.
   `Number(null)` is 0 (finite), so the old check passed a POST with the
   stamp removed. The stamp is now coerced to NaN unless it is a
   non-blank string, so a missing/blank/unparseable stamp fails closed;
   the comment above the check now says what the code does. Proof: no-JS
   POST with `rendered_at` deleted returned the fake success, wrote 0
   rows (DB-verified), and logged
   `quote_form_trap_rejected trap:"timing" renderedAt:null ageMs:null`.
   The scripted-fast case still traps too (ageMs:9, 0 rows).

3. MEDIUM — trap rejections had zero observability.
   Both traps now log `quote_form_trap_rejected` server-side with the
   trap name, the triggering value (honeypot text / raw stamp / age) and
   the list of fields that arrived filled — enough to recognise a
   password-manager-autofill false positive. The user-facing response is
   byte-for-byte the fake success, so bots still get no signal. Proof:
   excerpts in server-log-excerpts.txt (honeypot line shows
   honeypotValue:"https://spam.example"; timing lines show renderedAt and
   ageMs), each paired with a DB-verified 0-row count.

## Functional test rig (not committed)

- `.cache/c1fix-post.mjs` — no-JS multipart replay against the production
  server (modes: valid / fast / norender / honeypot / badmodel /
  badvisible).
- `.cache/c1fix-db.mjs` — Neon row-count proof. NOTE: it connects to Neon
  DIRECTLY via @neondatabase/serverless because `src/db/index.ts` now
  carries lead's `import "server-only"` — the old tsx import path fails
  with "This module cannot be imported from a Client Component module",
  which is the guard working as intended.
- `.cache/c1fix-shoot.mjs` / `.cache/c1fix-shoot-07.mjs` — raw-CDP
  screenshot drivers (Chrome 150 headless, 1440px viewport).

All evidence rows written to the live leads table during the run were
deleted and re-counted to 0 after each check.
