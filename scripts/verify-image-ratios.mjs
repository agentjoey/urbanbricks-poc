// verify:image-ratios — every model image under public/images/models must
// match the aspect ratio its slot declares in src/content/models.ts, because
// the Module Grid depends on exact ratios (a 5:2 hero that is actually 16:9
// breaks the layout). Placeholder stock photos are cropped by hand, so this
// catches a wrong crop before it ships.
//
// Reads the PNG/JPEG/WebP header to get pixel dimensions (no deps), compares
// against the declared aspect with a small tolerance. Missing files are OK
// (the component renders a labelled placeholder) — this only checks files
// that ARE present. Exits non-zero on a ratio mismatch.

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const MODELS = "src/content/models.ts";
const DIR = "public/images/models";

const RATIOS = { "5:2": 5 / 2, "3:2": 3 / 2, "4:3": 4 / 3, stacked: 5 / 4.125 };
const TOLERANCE = 0.02; // 2% — allows a pixel or two of rounding, not a wrong crop

// --- dimension readers (header-only, no image lib) -------------------------

function pngSize(buf) {
  // IHDR width/height at bytes 16..24
  if (buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
function jpegSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let o = 2;
  while (o < buf.length) {
    if (buf[o] !== 0xff) { o++; continue; }
    const marker = buf[o + 1];
    // SOF0..SOF15 (except DHT/DAC/etc) carry dimensions
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { h: buf.readUInt16BE(o + 5), w: buf.readUInt16BE(o + 7) };
    }
    o += 2 + buf.readUInt16BE(o + 2);
  }
  return null;
}
function webpSize(buf) {
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") return null;
  const fmt = buf.toString("ascii", 12, 16);
  if (fmt === "VP8 ") return { w: (buf.readUInt16LE(26) & 0x3fff), h: (buf.readUInt16LE(28) & 0x3fff) };
  if (fmt === "VP8L") {
    const b = buf.readUInt32LE(21);
    return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
  }
  if (fmt === "VP8X") return { w: ((buf[24] | (buf[25] << 8) | (buf[26] << 16)) & 0xffffff) + 1, h: ((buf[27] | (buf[28] << 8) | (buf[29] << 16)) & 0xffffff) + 1 };
  return null;
}
function dimensions(path) {
  const buf = readFileSync(path);
  return pngSize(buf) || jpegSize(buf) || webpSize(buf);
}

// --- parse the slots the site declares -------------------------------------

const src = readFileSync(MODELS, "utf8");
const slots = [];
// match `src: "/images/models/foo.png",` ... `aspect: "5:2",` pairs in order
const re = /src:\s*"(\/images\/models\/[^"]+)"[\s\S]*?aspect:\s*"([^"]+)"/g;
let m;
while ((m = re.exec(src))) slots.push({ file: m[1].replace("/images/models/", ""), aspect: m[2] });

let failures = 0;
const fail = (s) => { failures++; console.log(`FAIL  ${s}`); };

console.log(`== image ratios: ${slots.length} slots declared in ${MODELS} ==`);
for (const { file, aspect } of slots) {
  const path = join(DIR, file);
  const want = RATIOS[aspect];
  if (!existsSync(path)) { console.log(`SKIP  ${file.padEnd(32)} not present (labelled placeholder renders)`); continue; }
  const dim = dimensions(path);
  if (!dim) { fail(`${file.padEnd(32)} unreadable (not a PNG/JPEG/WebP?)`); continue; }
  const got = dim.w / dim.h;
  const off = Math.abs(got - want) / want;
  if (off <= TOLERANCE) console.log(`PASS  ${file.padEnd(32)} ${dim.w}×${dim.h} = ${got.toFixed(3)} (${aspect} wants ${want.toFixed(3)})`);
  else fail(`${file.padEnd(32)} ${dim.w}×${dim.h} = ${got.toFixed(3)} but ${aspect} wants ${want.toFixed(3)} — crop to the exact ratio`);
}

// stray files that no slot references
if (existsSync(DIR)) {
  const declared = new Set(slots.map((s) => s.file));
  for (const f of readdirSync(DIR)) {
    if (/\.(png|jpe?g|webp)$/i.test(f) && !declared.has(f)) console.log(`NOTE  ${f} present but no slot in models.ts references it`);
  }
}

console.log(failures === 0 ? "\nALL PRESENT IMAGES MATCH THEIR SLOT RATIO" : `\n${failures} RATIO MISMATCH(ES)`);
process.exit(failures === 0 ? 0 : 1);
