#!/usr/bin/env node
/**
 * p5-contact real-path verification.
 *
 * - Loads /contact from the production server on port 3705.
 * - Captures a desktop screenshot of the page.
 * - Submits the quote form with JavaScript enabled and waits for the success
 *   state.
 * - Submits the quote form with JavaScript disabled and waits for the success
 *   state (progressive enhancement path).
 * - Prints the two test email addresses so a follow-up script can verify they
 *   landed in Neon and remove them.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:3705";
const WAIT_AFTER_LOAD_MS = 4100; // > 3s timing-trap floor

const stamp = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const jsEmail = `p5-js-${stamp}@example.com`;
const noJsEmail = `p5-nojs-${stamp}@example.com`;

async function submitForm(page, email) {
  await page.fill("#qf-name", "P5 Test");
  await page.fill("#qf-email", email);
  await page.fill("#qf-phone", "+44 7700 900000");
  await page.fill("#qf-country", "United Kingdom");
  await page.selectOption("#qf-project_type", "residential");
  await page.selectOption("#qf-timeline", "exploring");
  await page.selectOption("#qf-budget_band", "under-40k");
  await page.fill("#qf-message", "This is a test submission from the p5-contact verification harness.");
  await page.check("#qf-consent");
  await page.waitForTimeout(WAIT_AFTER_LOAD_MS);
  await page.click("button[type=submit]");
}

async function main() {
  await mkdir(__dirname, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  // 1. Desktop screenshot + JS-enabled submission.
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/contact`, { waitUntil: "load" });
  await page.screenshot({ path: join(__dirname, "contact-desktop.png"), fullPage: true });

  await submitForm(page, jsEmail);
  await page.waitForSelector("text=Request received", { timeout: 10000 });
  await page.screenshot({ path: join(__dirname, "contact-success-js.png"), fullPage: true });
  await ctx.close();

  // 2. No-JS submission.
  const noJsCtx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    javaScriptEnabled: false,
  });
  const noJsPage = await noJsCtx.newPage();
  await noJsPage.goto(`${BASE}/contact`, { waitUntil: "domcontentloaded" });

  await submitForm(noJsPage, noJsEmail);
  await noJsPage.waitForSelector("text=Request received", { timeout: 10000 });
  await noJsPage.screenshot({ path: join(__dirname, "contact-success-nojs.png"), fullPage: true });
  await noJsCtx.close();

  await browser.close();

  console.log(JSON.stringify({ jsEmail, noJsEmail }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
