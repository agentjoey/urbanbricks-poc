import { chromium } from "/Users/xtation/.local/lib/node_modules/playwright/index.mjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "http://localhost:3900";
const EVIDENCE_DIR = __dirname;

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/privacy`, { waitUntil: "networkidle" });

  // Scroll to and screenshot the Cookies section.
  const cookiesSection = page.locator('section:has(h2:text("Cookies"))').first();
  await cookiesSection.scrollIntoViewIfNeeded();
  await cookiesSection.screenshot({ path: path.join(EVIDENCE_DIR, "privacy-cookies-corrected.png") });

  // Also capture the full page for context.
  await page.screenshot({ path: path.join(EVIDENCE_DIR, "privacy-full-corrected.png"), fullPage: true });

  await context.close();
  await browser.close();
  console.log("Screenshots saved to", EVIDENCE_DIR);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
