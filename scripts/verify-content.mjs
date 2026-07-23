#!/usr/bin/env node
/**
 * verify:content — the self-generating pre-launch checklist (spec §3, §9).
 *
 * Compiles the content layer to a temp dir, walks every export of every
 * content module, and prints each value wrapped in unverified() with its
 * file path and confirmation note. Exits non-zero while any remain, so the
 * launch gate ("verify:content 清单逐条核实完毕") cannot pass by accident.
 *
 * Three properties keep the check honest:
 *
 *   - Runtime values are inspected (not source text), so only values a real
 *     page would actually render are reported.
 *   - The module set is GLOBBED (src/content/*.ts in tsconfig.verify.json's
 *     include; *.js in the compiled output here), never hardcoded — a new
 *     content file cannot silently ship unchecked.
 *   - A drift check reads the confirmed delivery figure from the runtime
 *     FACTORY_BUILD_TIME value and fails on any renderable string stating a
 *     different digit-days duration, so hand-typed "30 days" copy cannot go
 *     stale if the figure ever changes.
 */
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, ".cache", "verify-content");

rmSync(outDir, { recursive: true, force: true });
execFileSync("pnpm", ["exec", "tsc", "-p", "scripts/tsconfig.verify.json"], {
  cwd: root,
  stdio: "inherit",
});

const require = createRequire(import.meta.url);

// Glob the compiled output of src/content/*.ts — the same set the tsconfig
// just compiled. type-tests.js is skipped: it is a compile-time probe file
// (its @ts-expect-error guards are enforced by the compilation above) and it
// deliberately executes invalid calls at module scope.
const contentOutDir = path.join(outDir, "content");
const contentModules = {};
for (const file of readdirSync(contentOutDir).sort()) {
  if (!file.endsWith(".js") || file === "type-tests.js") continue;
  contentModules[`src/content/${file.replace(/\.js$/, ".ts")}`] = require(path.join(contentOutDir, file));
}

function isPlainObject(value) {
  if (typeof value !== "object" || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function preview(value) {
  let text;
  try {
    text = JSON.stringify(value);
  } catch {
    text = String(value);
  }
  if (text === undefined) text = String(value);
  return text.length > 80 ? text.slice(0, 77) + "..." : text;
}

const found = [];
const strings = [];

function walk(value, location, file, seen) {
  if (typeof value === "string") {
    strings.push({ file, location, value });
    return;
  }
  if (typeof value !== "object" || value === null) return;
  if (value.__unverified === true) {
    // Report EVERY occurrence. Deduping by object identity would undercount
    // a shared unverified() instance, and the wrapped value is data, not
    // structure, so we never descend into it — no cycle protection needed.
    found.push({ file, location, value: value.value, note: value.note });
    return;
  }
  if (seen.has(value)) return; // cycle protection for containers only
  seen.add(value);
  if (Array.isArray(value)) {
    value.forEach((item, i) => walk(item, `${location}[${i}]`, file, seen));
  } else if (isPlainObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      walk(child, location ? `${location}.${key}` : key, file, seen);
    }
  }
}

for (const [file, mod] of Object.entries(contentModules)) {
  for (const [exportName, exported] of Object.entries(mod)) {
    walk(exported, exportName, file, new Set());
  }
}

// ── Delivery-figure drift check ──
// The confirmed figure is read from the actual runtime value a page would
// render, via the self-scoping short form ("30 days (factory build)") — the
// number never exists as a bare value, so it is parsed back out of the
// sanctioned string. Failing to read it fails the run loudly rather than
// silently skipping the check.
const { deliveryStatement } = require(path.join(outDir, "lib", "delivery.js"));
const siteModule = contentModules["src/content/site.ts"];
if (!siteModule || !siteModule.FACTORY_BUILD_TIME) {
  console.error(
    "verify:content — could not load FACTORY_BUILD_TIME from src/content/site.ts; the delivery-figure drift check cannot run. Failing closed."
  );
  process.exit(1);
}
const shortForm = deliveryStatement(siteModule.FACTORY_BUILD_TIME).short;
const figureMatch = /^(\d+)\s*days\b/.exec(shortForm);
if (!figureMatch) {
  console.error(
    `verify:content — could not parse the delivery figure from deliveryStatement().short (${JSON.stringify(shortForm)}); the drift check cannot run. Failing closed.`
  );
  process.exit(1);
}
const deliveryDays = Number(figureMatch[1]);

const drift = [];
for (const { file, location, value } of strings) {
  for (const match of value.matchAll(/\b(\d+)\s*days?\b/gi)) {
    if (Number(match[1]) !== deliveryDays) {
      drift.push({ file, location, found: match[0], expected: deliveryDays });
    }
  }
}

let failed = false;

if (drift.length > 0) {
  failed = true;
  console.error(
    `verify:content — ${drift.length} renderable string(s) state a delivery figure other than the confirmed ${deliveryDays} days:\n`
  );
  for (const { file, location, found: text, expected } of drift) {
    console.error(`  ${file}`);
    console.error(`    ${location} contains "${text}" — expected "${expected} days"`);
    console.error();
  }
  console.error("Derive the figure from FACTORY_BUILD_TIME or update the copy to match it.\n");
}

if (found.length > 0) {
  failed = true;
  console.log(`verify:content — ${found.length} unverified value(s) must be confirmed before launch:\n`);
  for (const { file, location, value, note } of found) {
    console.log(`  ${file}`);
    console.log(`    ${location} = ${preview(value)}`);
    if (note) console.log(`    → ${note}`);
    console.log();
  }
  console.log("Confirm each value, remove its unverified() wrapper, and re-run.");
}

if (failed) process.exit(1);
console.log("verify:content — no unverified values remain and no delivery-figure drift. Content is cleared for launch.");
