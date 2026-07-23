// Verification script for x2-analytics PECR behavior.
// Run against the production build on port 3902.

import { chromium } from "/Users/xtation/.local/lib/node_modules/playwright/index.mjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "http://localhost:3902";
const MODEL_PATH = "/models/harbor-20";
const EVIDENCE_DIR = __dirname;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isGARequest(url) {
  return (
    url.includes("googletagmanager.com") ||
    url.includes("google-analytics.com") ||
    url.includes("gtag")
  );
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  // ---------- Test 1: fresh visit, no consent => no GA, banner shown ----------
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  const requests1 = [];
  page1.on("request", (req) => requests1.push(req.url()));

  await page1.goto(`${BASE_URL}${MODEL_PATH}`, { waitUntil: "networkidle" });
  await sleep(500);
  await page1.screenshot({ path: path.join(EVIDENCE_DIR, "01-fresh-visit.png") });

  const gaRequests1 = requests1.filter(isGARequest);
  const bannerVisible1 = await page1.isVisible('[aria-label="Cookie consent"]');
  const cookies1 = await context1.cookies();

  console.log("Test 1: fresh visit");
  console.log("  GA network requests:", gaRequests1.length, gaRequests1);
  console.log("  Banner visible:", bannerVisible1);
  console.log("  Cookies:", cookies1.map((c) => `${c.name}=${c.value}`));

  if (gaRequests1.length !== 0) {
    throw new Error("Expected no GA requests on fresh visit");
  }
  if (!bannerVisible1) {
    throw new Error("Expected banner visible on fresh visit");
  }

  // ---------- Test 2: accept => gtag loads, cookie set, view_model sent ----------
  const requestsAfterAccept = [];
  page1.on("request", (req) => requestsAfterAccept.push(req.url()));

  await page1.click('button:has-text("Accept")');
  // Wait until gtag.js has loaded and either a GA collect request fired or
  // a reasonable timeout has passed.
  const collectPromise = page1
    .waitForRequest((req) => req.url().includes("google-analytics.com/g/collect"), {
      timeout: 5000,
    })
    .catch(() => null);
  await sleep(1500);
  await collectPromise;
  await sleep(300);
  await page1.screenshot({ path: path.join(EVIDENCE_DIR, "02-after-accept.png") });

  const cookiesAccept = await context1.cookies();
  const consentCookieAccept = cookiesAccept.find(
    (c) => c.name === "ub_analytics_consent",
  );
  const gaCookieAccept = cookiesAccept.find((c) => c.name.startsWith("_ga"));

  const gaRequestsAccept = requestsAfterAccept.filter(isGARequest);
  const gaCollectRequest = gaRequestsAccept.find((url) =>
    url.includes("google-analytics.com/g/collect"),
  );

  const dataLayer = await page1.evaluate(() => window.dataLayer || []);
  const viewModelDataLayer = dataLayer.filter(
    (item) => item && item.event === "view_model",
  );

  console.log("\nTest 2: after accept");
  console.log("  GA network requests:", gaRequestsAccept.length, gaRequestsAccept);
  console.log("  Consent cookie:", consentCookieAccept);
  console.log("  GA cookie:", gaCookieAccept);
  console.log("  dataLayer view_model events:", viewModelDataLayer.length, viewModelDataLayer);
  console.log("  GA collect request:", gaCollectRequest);

  if (!consentCookieAccept || consentCookieAccept.value !== "granted") {
    throw new Error("Expected granted consent cookie after accept");
  }
  if (!gaCookieAccept) {
    throw new Error("Expected GA cookie after accept");
  }
  if (!gaCollectRequest) {
    throw new Error("Expected GA collect request after accept");
  }
  if (viewModelDataLayer.length === 0) {
    throw new Error("Expected view_model event in dataLayer after accept");
  }

  await context1.close();

  // ---------- Test 3: reject => no GA, choice remembered ----------
  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  // Pre-set denied cookie with a future expiry (matches setConsentCookie behaviour).
  await context2.addCookies([
    {
      name: "ub_analytics_consent",
      value: "denied",
      domain: "localhost",
      path: "/",
      expires: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
    },
  ]);
  const requests2 = [];
  page2.on("request", (req) => requests2.push(req.url()));

  await page2.goto(`${BASE_URL}${MODEL_PATH}`, { waitUntil: "networkidle" });
  await sleep(500);
  const documentCookie = await page2.evaluate(() => document.cookie);
  console.log("\nTest 3: reject remembered");
  console.log("  document.cookie:", documentCookie);
  await page2.screenshot({ path: path.join(EVIDENCE_DIR, "03-reject-remembered.png") });

  const gaRequests2 = requests2.filter(isGARequest);
  const bannerVisible2 = await page2
    .locator('[aria-label="Cookie consent"]')
    .isVisible()
    .catch(() => false);
  const cookies2 = await context2.cookies();
  const consentCookie2 = cookies2.find((c) => c.name === "ub_analytics_consent");

  console.log("  GA network requests:", gaRequests2.length, gaRequests2);
  console.log("  Banner visible:", bannerVisible2);
  console.log("  Consent cookie:", consentCookie2);

  if (gaRequests2.length !== 0) {
    throw new Error("Expected no GA requests with denied consent");
  }
  if (bannerVisible2) {
    throw new Error("Expected banner hidden when choice already denied");
  }
  if (!consentCookie2 || consentCookie2.value !== "denied") {
    throw new Error("Expected denied consent cookie to persist");
  }

  await context2.close();

  // ---------- Test 4: placeholder ID is referenced ----------
  const context3 = await browser.newContext();
  const page3 = await context3.newPage();
  const requests3 = [];
  page3.on("request", (req) => requests3.push(req.url()));
  await page3.goto(`${BASE_URL}${MODEL_PATH}`, { waitUntil: "networkidle" });
  await page3.click('button:has-text("Accept")');
  await sleep(1500);

  const gtagRequest = requests3.find((url) =>
    url.includes("googletagmanager.com/gtag/js"),
  );
  console.log("\nTest 4: placeholder ID");
  console.log("  gtag request:", gtagRequest);

  if (!gtagRequest || !gtagRequest.includes("G-PLACEHOLDER0")) {
    throw new Error("Expected gtag request to reference G-PLACEHOLDER0");
  }

  await context3.close();
  await browser.close();

  console.log("\nAll verification checks passed.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
