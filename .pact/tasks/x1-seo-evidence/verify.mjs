import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const base = "http://localhost:3901";
const canonicalHost = "https://urbanbricks.uk";

const publicPaths = ["/", "/models", "/how-it-works", "/contact", "/about", "/privacy"];
const modelSlugs = [
  "harbor-20",
  "harbor-40",
  "meridian",
  "meridian-stack",
  "counter",
  "workroom",
  "basecamp",
];

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

async function fetchText(path) {
  const res = await fetch(`${base}${path}`);
  if (!res.ok) throw new Error(`${path} returned ${res.status}`);
  return res.text();
}

function extractLdJson(html) {
  const blocks = [];
  const re = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(m[1].trim()));
    } catch (e) {
      fail(`Invalid JSON-LD block: ${e.message}`);
    }
  }
  return blocks;
}

function hasMeta(html, rel, content) {
  const re = new RegExp(`<${rel.includes(":") ? "meta" : "link"}[^>]*${rel}[^>]*>`, "i");
  return re.test(html) && html.includes(content);
}

async function main() {
  // Sitemap checks
  const sitemap = await fetchText("/sitemap.xml");
  writeFileSync(join(__dirname, "sitemap.xml"), sitemap);
  for (const path of publicPaths) {
    const url = `${canonicalHost}${path === "/" ? "" : path}`;
    if (!sitemap.includes(`<loc>${url}</loc>`)) fail(`sitemap missing ${url}`);
    else pass(`sitemap contains ${url}`);
  }
  for (const slug of modelSlugs) {
    const url = `${canonicalHost}/models/${slug}`;
    if (!sitemap.includes(`<loc>${url}</loc>`)) fail(`sitemap missing ${url}`);
    else pass(`sitemap contains ${url}`);
  }
  if (sitemap.includes("/admin")) fail("sitemap contains /admin");
  else pass("sitemap excludes /admin");

  // Robots checks
  const robots = await fetchText("/robots.txt");
  writeFileSync(join(__dirname, "robots.txt"), robots);
  if (!robots.includes("Disallow: /admin")) fail("robots does not disallow /admin");
  else pass("robots disallows /admin");
  if (!robots.includes(`${canonicalHost}/sitemap.xml`)) fail("robots missing sitemap");
  else pass("robots references sitemap");

  // Per-page metadata checks
  for (const path of publicPaths) {
    const html = await fetchText(path);
    const expectedCanonical = `${canonicalHost}${path === "/" ? "" : path}`;
    if (!html.includes(`<link rel="canonical" href="${expectedCanonical}"`)) {
      fail(`${path} missing canonical ${expectedCanonical}`);
    } else pass(`${path} canonical ${expectedCanonical}`);
    if (!html.includes(`<meta property="og:url" content="${expectedCanonical}"`)) {
      fail(`${path} missing og:url ${expectedCanonical}`);
    } else pass(`${path} og:url ${expectedCanonical}`);
    if (!html.includes("<title>")) fail(`${path} missing title`);
    else pass(`${path} has title`);
    if (!html.includes('<meta name="description"')) fail(`${path} missing description`);
    else pass(`${path} has description`);
  }

  // Home JSON-LD
  const homeHtml = await fetchText("/");
  writeFileSync(join(__dirname, "home.html"), homeHtml);
  const homeLd = extractLdJson(homeHtml);
  const orgBlocks = homeLd.filter((b) => b["@type"] === "Organization");
  if (orgBlocks.length !== 1) fail(`home has ${orgBlocks.length} Organization blocks`);
  else pass("home has exactly one Organization JSON-LD");
  const faqBlocks = homeLd.filter((b) => b["@type"] === "FAQPage");
  if (faqBlocks.length !== 1) fail(`home has ${faqBlocks.length} FAQPage blocks`);
  else pass("home has FAQPage JSON-LD");

  // Model JSON-LD
  const modelHtml = await fetchText("/models/meridian");
  writeFileSync(join(__dirname, "model-meridian.html"), modelHtml);
  const modelLd = extractLdJson(modelHtml);
  const productBlocks = modelLd.filter((b) => b["@type"] === "Product");
  if (productBlocks.length !== 1) fail(`model has ${productBlocks.length} Product blocks`);
  else pass("model has Product JSON-LD");
  const breadcrumbBlocks = modelLd.filter((b) => b["@type"] === "BreadcrumbList");
  if (breadcrumbBlocks.length !== 1) fail(`model has ${breadcrumbBlocks.length} BreadcrumbList blocks`);
  else pass("model has BreadcrumbList JSON-LD");
  const modelOrgBlocks = modelLd.filter((b) => b["@type"] === "Organization");
  if (modelOrgBlocks.length !== 1) fail(`model has ${modelOrgBlocks.length} Organization blocks (should inherit one from layout)`);
  else pass("model has exactly one Organization JSON-LD (from root layout)");

  // Save a summary
  const summary = {
    checkedAt: new Date().toISOString(),
    sitemapModelCount: modelSlugs.length,
    publicPaths,
    modelSlugs,
    homeLdTypes: homeLd.map((b) => b["@type"]),
    modelLdTypes: modelLd.map((b) => b["@type"]),
  };
  writeFileSync(join(__dirname, "summary.json"), JSON.stringify(summary, null, 2));
  console.log("\nEvidence saved to", __dirname);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
