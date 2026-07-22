#!/usr/bin/env node
/**
 * verify:content — the self-generating pre-launch checklist (spec §3, §9).
 *
 * Compiles the content layer to a temp dir, walks every export of every
 * content module, and prints each value wrapped in unverified() with its
 * file path and confirmation note. Exits non-zero while any remain, so the
 * launch gate ("verify:content 清单逐条核实完毕") cannot pass by accident.
 *
 * Runtime values are inspected (not source text), so only values a real page
 * would actually render are reported.
 */
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { rmSync } from "node:fs";
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

const contentModules = {
  "src/content/site.ts": require(path.join(outDir, "content", "site.js")),
  "src/content/models.ts": require(path.join(outDir, "content", "models.js")),
  "src/content/process.ts": require(path.join(outDir, "content", "process.js")),
  "src/content/faq.ts": require(path.join(outDir, "content", "faq.js")),
};

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

function walk(value, location, file, seen) {
  if (typeof value !== "object" || value === null || seen.has(value)) return;
  seen.add(value);
  if (value.__unverified === true) {
    found.push({ file, location, value: value.value, note: value.note });
    return; // the wrapped value itself is data, not structure — do not descend
  }
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

if (found.length === 0) {
  console.log("verify:content — no unverified values remain. Content is cleared for launch.");
  process.exit(0);
}

console.log(`verify:content — ${found.length} unverified value(s) must be confirmed before launch:\n`);
for (const { file, location, value, note } of found) {
  console.log(`  ${file}`);
  console.log(`    ${location} = ${preview(value)}`);
  if (note) console.log(`    → ${note}`);
  console.log();
}
console.log("Confirm each value, remove its unverified() wrapper, and re-run.");
process.exit(1);
