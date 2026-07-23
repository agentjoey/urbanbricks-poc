// Contrast gate for the urbanbricks design system.
//
// Reads the ACTUAL token values out of src/app/globals.css, checks them against
// DESIGN.md's frontmatter, then verifies every WCAG pairing.
//
// The first version of this script hardcoded the palette, which meant "ALL PASS"
// proved only that the numbers in this file agreed with each other -- it would
// have passed even if globals.css shipped the stock shadcn greys. Caught in
// review of f1-tokens. Read the CSS.
//
// Exits non-zero on any failure. Safe for CI.

import { readFileSync } from 'node:fs';

// --- OKLCH -> sRGB -> WCAG -------------------------------------------------

function oklchToLinearSrgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));

function luminance([L, C, h]) {
  const [r, g, b] = oklchToLinearSrgb(L, C, h).map(clamp01);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function hex([L, C, h]) {
  const toSrgb = (c) => {
    c = clamp01(c);
    return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  };
  return (
    '#' +
    oklchToLinearSrgb(L, C, h)
      .map((v) => Math.round(toSrgb(v) * 255).toString(16).padStart(2, '0'))
      .join('')
  );
}

// --- Parsing ---------------------------------------------------------------

const OKLCH = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/;

function parseOklch(value) {
  const m = value.match(OKLCH);
  return m ? [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])] : null;
}

/** Custom properties declared anywhere in globals.css: `--name: oklch(...)`. */
function readCssTokens(path) {
  const css = readFileSync(path, 'utf8');
  const out = {};
  for (const m of css.matchAll(/--([a-z0-9-]+)\s*:\s*(oklch\([^)]*\))/gi)) {
    // First declaration wins; later ones are scoped overrides (.ink-surface).
    if (!(m[1] in out)) {
      const v = parseOklch(m[2]);
      if (v) out[m[1]] = v;
    }
  }
  return out;
}

/** DESIGN.md frontmatter `colors:` block -- the normative source. */
function readDesignTokens(path) {
  const md = readFileSync(path, 'utf8');
  const fm = md.split(/^---$/m)[1] ?? '';
  const colors = fm.split(/^colors:\s*$/m)[1]?.split(/^[a-z]/m)[0] ?? '';
  const out = {};
  for (const m of colors.matchAll(/^\s+([a-z0-9-]+):\s*"([^"]+)"/gim)) {
    const v = parseOklch(m[2]);
    if (v) out[m[1]] = v;
  }
  return out;
}

const design = readDesignTokens('DESIGN.md');
const css = readCssTokens('src/app/globals.css');

let failures = 0;
const fail = (msg) => {
  failures++;
  console.log(`FAIL  ${msg}`);
};

// --- 1. Every DESIGN.md colour must actually ship in the CSS ---------------

console.log('== token fidelity: DESIGN.md -> globals.css ==');
const eq = (a, b) => a && b && a.every((v, i) => Math.abs(v - b[i]) < 1e-9);

if (!Object.keys(design).length) fail('no colours parsed from DESIGN.md frontmatter');

for (const [name, want] of Object.entries(design)) {
  const got = css[name];
  if (!got) {
    fail(`--${name} is normative in DESIGN.md but not declared in globals.css`);
  } else if (!eq(want, got)) {
    fail(`--${name} drifted: DESIGN.md oklch(${want.join(' ')}) vs css oklch(${got.join(' ')})`);
  } else {
    console.log(`PASS  --${name.padEnd(20)} ${hex(want)}`);
  }
}

// --- 2. WCAG pairings ------------------------------------------------------

const T = (n) => design[n] ?? css[n];
const WHITE = [1, 0, 0];

const pairings = [
  ['ink on white', 'ink', 'surface-white', 4.5],
  ['ink-muted on white', 'ink-muted', 'surface-white', 4.5],
  ['brass-deep on white', 'brass-deep', 'surface-white', 4.5],
  ['stroke on white (UI boundary)', 'stroke', 'surface-white', 3.0],
  ['destructive on white', 'destructive', 'surface-white', 4.5],
  ['success on white', 'success', 'surface-white', 4.5],
  ['ink on brass (primary button)', 'ink', 'brass', 4.5],
  ['on-dark on surface-ink', 'on-dark', 'surface-ink', 4.5],
  ['ink-muted-on-dark on surface-ink', 'ink-muted-on-dark', 'surface-ink', 4.5],
  ['brass on surface-ink (figures)', 'brass', 'surface-ink', 4.5],
  ['on-dark ring on surface-ink (UI)', 'on-dark', 'surface-ink', 3.0],
  ['destructive-on-dark on surface-ink', 'destructive-on-dark', 'surface-ink', 4.5],
  ['success-on-dark on surface-ink', 'success-on-dark', 'surface-ink', 4.5],
  ['stroke-on-dark on surface-ink (UI)', 'stroke-on-dark', 'surface-ink', 3.0],
];

console.log('\n== WCAG pairings ==');
for (const [label, fg, bg, min] of pairings) {
  const a = T(fg);
  const b = T(bg);
  if (!a || !b) {
    fail(`${label}: missing token (${!a ? fg : bg})`);
    continue;
  }
  const r = ratio(a, b);
  if (r >= min) console.log(`PASS  ${label.padEnd(36)} ${r.toFixed(2)}:1 (min ${min})`);
  else fail(`${label.padEnd(36)} ${r.toFixed(2)}:1 (min ${min})`);
}

// --- 3. Rules that are not simple pairings --------------------------------

console.log('\n== system rules ==');

// Brass must stay unusable as text or as a lone state indicator on white.
const brass = T('brass');
if (brass) {
  const r = ratio(brass, WHITE);
  if (r < 3.0)
    console.log(`PASS  brass stays below the text/state threshold on white (${r.toFixed(2)}:1) -- use brass-deep`);
  else
    fail(`brass on white is now ${r.toFixed(2)}:1; DESIGN.md's rule that brass is never type depends on it failing`);
}

// Hover must be a perceptible shift, not a token change nobody can see.
const hover = css['brass-hover'];
if (!hover) fail('--brass-hover not declared in globals.css');
else if (brass) {
  const shift = ratio(brass, hover);
  const label = ratio(T('ink'), hover);
  if (shift >= 1.5) console.log(`PASS  brass -> brass-hover shift ${shift.toFixed(2)}:1 (min 1.5)`);
  else fail(`brass -> brass-hover shift only ${shift.toFixed(2)}:1 (min 1.5) -- imperceptible feedback`);
  if (label >= 4.5) console.log(`PASS  ink label on brass-hover ${label.toFixed(2)}:1 (min 4.5)`);
  else fail(`ink label on brass-hover ${label.toFixed(2)}:1 (min 4.5)`);
}

// The No-Cream Rule, enforced rather than asserted.
const bg = T('surface-white');
if (bg && bg[0] === 1 && bg[1] === 0)
  console.log('PASS  surface-white is pure white, chroma 0 (No-Cream Rule)');
else fail(`surface-white is oklch(${bg?.join(' ')}) -- the No-Cream Rule requires pure white, chroma 0`);

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
