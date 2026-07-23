p5-contact verification evidence
================================

Files
-----
- contact-desktop.png      — /contact at 1280×900, production build, JS enabled
- contact-mobile.png       — /contact at 390×844, production build
- contact-success-js.png   — form submitted with JS enabled, success state
- contact-success-nojs.png — form submitted with JavaScript disabled, success state
- verify.mjs               — Playwright harness that produced the success shots
- cleanup.ts               — verifies the two test rows landed in Neon, then deletes them

How to reproduce
----------------
1. Build and start the production server:
     pnpm build
     pnpm start -p 3705

2. Install Playwright locally in this evidence directory (kept out of the repo):
     npm install --no-package-lock --prefix .pact/tasks/p5-contact-evidence playwright
     npx playwright install chromium

3. Run the harness (prints the two test email addresses):
     node .pact/tasks/p5-contact-evidence/verify.mjs

4. Verify the rows in Neon and delete them:
     npx tsx .pact/tasks/p5-contact-evidence/cleanup.ts <js-email> <nojs-email>

What was exercised
------------------
- /contact renders from the production build.
- The accepted <QuoteForm> is centered and carries source_path=/contact (no model_slug).
- Contact details (email, phone) are pulled from src/content/site.ts, not hardcoded.
- A JS-enabled submission reaches the success state and writes a row to Neon.
- A JavaScript-disabled submission reaches the same success state and writes a row
  to Neon (progressive enhancement path).
- Both test rows were verified in the database and deleted.

Automation gates (final clean tree)
-----------------------------------
- npx tsc --noEmit            PASS
- pnpm lint                   PASS
- pnpm build                  PASS
- pnpm verify:image-label     PASS
- pnpm verify:contrast        ALL PASS
- pnpm verify:content         exits 1 with the same 47 pre-existing unverified()
                              values as the accepted baseline (not introduced).

Note: scripts/verify-db.ts currently fails because src/db/index.ts imports
`server-only`; cleanup.ts works around this by building the neon-http client
directly from src/db/schema.ts.
