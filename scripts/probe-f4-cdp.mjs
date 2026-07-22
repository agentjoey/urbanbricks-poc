/**
 * TEMPORARY f4-shell evidence driver — DELETE BEFORE COMMIT.
 * Drives headless Chrome over raw CDP (no new dependencies; Node 24 has a
 * global WebSocket) against the PRODUCTION build on :3401 and captures the
 * f4-shell acceptance evidence. Chrome must be listening on :9333.
 *
 * Usage: node scripts/probe-f4-cdp.mjs <phase> [outdir]
 *   phase = static | active
 *   static — widths, hairline, keyboard, sheet, CTA (runs on any build)
 *   active — active-nav state (requires the /models/probe-f4 probe route)
 */
import { writeFileSync, mkdirSync } from "node:fs";

const BASE = "http://localhost:3401";
const phase = process.argv[2];
const OUT = process.argv[3] ?? ".pact/tasks/f4-shell-evidence";
if (!phase) {
  console.error("usage: node scripts/probe-f4-cdp.mjs <static|active> [outdir]");
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

// --- minimal CDP client ------------------------------------------------------
const version = await fetch("http://localhost:9333/json/version").then((r) => r.json());
const ws = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});

let nextId = 1;
const pendingCalls = new Map();
const eventWaiters = [];
ws.onmessage = (message) => {
  const data = JSON.parse(message.data);
  if (data.id && pendingCalls.has(data.id)) {
    const { resolve, reject } = pendingCalls.get(data.id);
    pendingCalls.delete(data.id);
    data.error ? reject(new Error(JSON.stringify(data.error))) : resolve(data.result);
  } else if (data.method) {
    for (let i = eventWaiters.length - 1; i >= 0; i--) {
      if (eventWaiters[i].method === data.method) {
        eventWaiters[i].resolve(data.params);
        eventWaiters.splice(i, 1);
      }
    }
  }
};

function send(method, params = {}, sessionId) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pendingCalls.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
}

function waitEvent(method, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    eventWaiters.push({ method, resolve });
    setTimeout(() => reject(new Error(`timeout waiting for ${method}`)), timeoutMs);
  });
}

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);
await send("Page.bringToFront", {}, sessionId);

async function evaluate(expression) {
  const result = await send(
    "Runtime.evaluate",
    { expression, returnByValue: true, awaitPromise: true },
    sessionId,
  );
  if (result.exceptionDetails) {
    throw new Error(`page eval failed: ${JSON.stringify(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text)}`);
  }
  return result.result.value;
}

async function navigate(url) {
  const loaded = waitEvent("Page.loadEventFired");
  await send("Page.navigate", { url }, sessionId);
  await loaded;
  // Let hydration and fonts settle.
  await evaluate(`document.fonts.ready.then(() => true)`);
  await new Promise((r) => setTimeout(r, 800));
}

async function viewport(width, height, dsf = 1, mobile = false) {
  await send(
    "Emulation.setDeviceMetricsOverride",
    { width, height, deviceScaleFactor: dsf, mobile },
    sessionId,
  );
}

async function shot(name) {
  const { data } = await send("Page.captureScreenshot", { format: "png" }, sessionId);
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(data, "base64"));
  console.log(`saved ${OUT}/${name}.png`);
}

function saveJson(name, value) {
  writeFileSync(`${OUT}/${name}.json`, JSON.stringify(value, null, 2));
  console.log(`saved ${OUT}/${name}.json`);
}

async function waitFor(selector, timeoutMs = 20000) {
  const start = Date.now();
  for (;;) {
    const found = await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`);
    if (found) return;
    if (Date.now() - start > timeoutMs) throw new Error(`timeout waiting for ${selector}`);
    await new Promise((r) => setTimeout(r, 250));
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- trusted key input ---------------------------------------------------------
async function key(keyName, code, vk, modifiers = 0) {
  for (const type of ["keyDown", "keyUp"]) {
    await send(
      "Input.dispatchKeyEvent",
      { type, key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, modifiers },
      sessionId,
    );
  }
  await sleep(120);
}
const tab = (shift = false) => key("Tab", "Tab", 9, shift ? 8 : 0);
const enter = () => key("Enter", "Enter", 13);
const escape = () => key("Escape", "Escape", 27);

/** A compact description of the currently focused element. */
function describeActive() {
  return evaluate(`(() => {
    const el = document.activeElement;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      text: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 60),
      href: el.getAttribute('href'),
      slot: el.getAttribute('data-slot'),
      inSheet: !!el.closest('[data-slot="sheet-content"]'),
      inFooterInk: !!el.closest('footer.ink-surface'),
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    };
  })()`);
}

/** Computed focus indicator of the currently focused element. */
function focusStyles() {
  return evaluate(`(() => {
    const el = document.activeElement;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      text: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 40),
      matchesFocusVisible: el.matches(':focus-visible'),
      outlineWidth: cs.outlineWidth,
      outlineStyle: cs.outlineStyle,
      outlineColor: cs.outlineColor,
      outlineOffset: cs.outlineOffset,
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    };
  })()`);
}

// =============================================================================
if (phase === "active") {
  // Active-nav state. Only possible against a route that matches a nav item —
  // the /models/probe-f4 probe route drives the real header through real
  // usePathname() on the real layout.
  await viewport(1440, 900);
  await navigate(`${BASE}/models/probe-f4`);

  const measurements = await evaluate(`(() => {
    const links = [...document.querySelectorAll('header nav[aria-label="Primary"] a')];
    return links.map((a) => {
      const cs = getComputedStyle(a);
      return {
        text: a.innerText,
        ariaCurrent: a.getAttribute('aria-current'),
        fontWeight: cs.fontWeight,
        textDecorationLine: cs.textDecorationLine,
        textDecorationColor: cs.textDecorationColor,
        textDecorationThickness: cs.textDecorationThickness,
        textUnderlineOffset: cs.textUnderlineOffset,
      };
    });
  })()`);
  console.log(JSON.stringify(measurements, null, 2));
  saveJson("active-nav-computed", {
    url: "/models/probe-f4",
    expected: "Models active: Deep Brass oklch(0.48 0.095 70) 2px underline + weight 600; others weight 500 transparent underline",
    links: measurements,
  });
  await shot("active-nav-1440");

  // Colour-independence: forced-colors mode strips author colours. The weight
  // step and the 2px underline must survive.
  await send(
    "Emulation.setEmulatedMedia",
    { features: [{ name: "forced-colors", value: "active" }] },
    sessionId,
  );
  await sleep(400);
  const forced = await evaluate(`(() => {
    const links = [...document.querySelectorAll('header nav[aria-label="Primary"] a')];
    return links.map((a) => {
      const cs = getComputedStyle(a);
      return {
        text: a.innerText,
        fontWeight: cs.fontWeight,
        textDecorationLine: cs.textDecorationLine,
        textDecorationThickness: cs.textDecorationThickness,
        textDecorationColor: cs.textDecorationColor,
      };
    });
  })()`);
  console.log(JSON.stringify(forced, null, 2));
  saveJson("active-nav-forced-colors", {
    note: "forced-colors: active — author colours are overridden by system colours; the weight step (600 vs 500) and the 2px underline thickness must survive",
    links: forced,
  });
  await shot("active-nav-forced-colors");
  await send("Emulation.setEmulatedMedia", { features: [] }, sessionId);
  console.log("active done");
}

// =============================================================================
if (phase === "static") {
  // --- 1. desktop 1440 -------------------------------------------------------
  await viewport(1440, 900);
  await navigate(`${BASE}/`);
  await shot("01-desktop-1440");

  // --- 2. sticky header hairline on scroll -----------------------------------
  const headerAtRest = await evaluate(`(() => {
    const cs = getComputedStyle(document.querySelector('header'));
    return { scrollY: window.scrollY, boxShadow: cs.boxShadow, canScroll: document.documentElement.scrollHeight > window.innerHeight, scrollHeight: document.documentElement.scrollHeight, innerHeight: window.innerHeight };
  })()`);
  console.log(JSON.stringify(headerAtRest));
  await evaluate(`window.scrollTo(0, document.documentElement.scrollHeight)`);
  await sleep(500);
  const headerScrolled = await evaluate(`(() => {
    const cs = getComputedStyle(document.querySelector('header'));
    return { scrollY: window.scrollY, boxShadow: cs.boxShadow };
  })()`);
  console.log(JSON.stringify(headerScrolled));
  saveJson("header-hairline", {
    expected: "at rest: box-shadow none; scrolled: 0px 1px 0px <Line oklch(0.9 0.004 75)> — a 1px hairline, no blur, no spread, never a soft shadow",
    headerAtRest,
    headerScrolled,
  });
  await shot("02-header-scrolled-hairline");

  // --- 3. collapse boundary 899 / 900 ----------------------------------------
  await viewport(899, 900);
  await navigate(`${BASE}/`);
  const at899 = await evaluate(`(() => {
    const desktop = document.querySelector('header div.hidden');
    const menuBtn = [...document.querySelectorAll('header button')].find((b) => b.innerText.includes('Menu'));
    return {
      innerWidth: window.innerWidth,
      desktopNavDisplay: getComputedStyle(desktop).display,
      menuButtonDisplay: getComputedStyle(menuBtn).display,
    };
  })()`);
  console.log(JSON.stringify(at899));
  await shot("03-collapse-899");

  await viewport(900, 900);
  await sleep(400);
  const at900 = await evaluate(`(() => {
    const desktop = document.querySelector('header div.hidden');
    const menuBtn = [...document.querySelectorAll('header button')].find((b) => b.innerText.includes('Menu'));
    return {
      innerWidth: window.innerWidth,
      desktopNavDisplay: getComputedStyle(desktop).display,
      menuButtonDisplay: getComputedStyle(menuBtn).display,
    };
  })()`);
  console.log(JSON.stringify(at900));
  saveJson("collapse-boundary", { expected: "899px: desktop nav display none, Menu button visible; 900px: desktop nav flex, Menu button none", at899, at900 });
  await shot("04-collapse-900");

  // --- 4. mobile 390, sheet open, CTA pinned bottom ---------------------------
  await viewport(390, 844, 2, true);
  await navigate(`${BASE}/`);
  await shot("05-mobile-390-closed");

  await evaluate(`[...document.querySelectorAll('header button')].find((b) => b.innerText.includes('Menu')).click()`);
  await waitFor('[data-slot="sheet-content"]');
  await sleep(700); // slide-in animation
  await shot("06-mobile-390-sheet-open");

  const cta = await evaluate(`(() => {
    const sheet = document.querySelector('[data-slot="sheet-content"]');
    const footer = document.querySelector('[data-slot="sheet-footer"]');
    const cta = footer.querySelector('a');
    const sr = sheet.getBoundingClientRect();
    const fr = footer.getBoundingClientRect();
    const cr = cta.getBoundingClientRect();
    const cs = getComputedStyle(cta);
    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      sheetRect: { x: sr.x, w: sr.width, h: sr.height },
      footerTop: Math.round(fr.top),
      ctaRect: { x: Math.round(cr.x), y: Math.round(cr.y), w: Math.round(cr.width), h: Math.round(cr.height) },
      ctaGapToViewportBottom: Math.round(window.innerHeight - cr.bottom),
      ctaFontSize: cs.fontSize,
      ctaDisplay: cs.display,
      sheetScroll: { scrollHeight: sheet.scrollHeight, clientHeight: sheet.clientHeight },
    };
  })()`);
  console.log(JSON.stringify(cta, null, 2));
  saveJson("cta-measurements", {
    expected: "CTA spans the sheet footer (sheet w 85% of 390 = 331.5, minus 2x16 padding -> ~299.5px wide), h-12 = 48px tall, pinned 16px from the viewport bottom by mt-auto",
    cta,
  });

  // --- 5. sheet keyboard: trap, cycle, Escape, accessible name ----------------
  const sheetA11y = await evaluate(`(() => {
    const sheet = document.querySelector('[data-slot="sheet-content"]');
    const title = document.querySelector('[data-slot="sheet-title"]');
    return {
      role: sheet.getAttribute('role'),
      ariaLabelledby: sheet.getAttribute('aria-labelledby'),
      titleId: title?.id,
      titleText: title?.innerText,
    };
  })()`);
  const focusAfterOpen = await describeActive();
  console.log(JSON.stringify({ sheetA11y, focusAfterOpen }));

  // Walk Tab around the whole trap (5 focusables: close X, 3 nav links, CTA) —
  // 12 presses must never leave the sheet and must cycle.
  const trapWalk = [];
  for (let i = 0; i < 12; i++) {
    await tab();
    trapWalk.push(await describeActive());
  }
  // Shift+Tab from wherever we are must also stay inside.
  await tab(true);
  const shiftTabProbe = await describeActive();
  await shot("07-sheet-focus-trap");

  // Escape closes the sheet and focus returns to the trigger.
  await escape();
  await sleep(500);
  const afterEscape = {
    sheetStillInDom: await evaluate(`!!document.querySelector('[data-slot="sheet-content"]')`),
    active: await describeActive(),
  };
  console.log(JSON.stringify({ trapWalk, shiftTabProbe, afterEscape }, null, 2));
  saveJson("sheet-keyboard", {
    expected: "dialog role + aria-labelledby -> SheetTitle 'Menu'; focus enters sheet on open; 12x Tab never leaves the sheet and cycles; Shift+Tab stays inside; Escape removes the sheet and returns focus to the Menu trigger",
    sheetA11y,
    focusAfterOpen,
    trapWalk,
    shiftTabProbe,
    afterEscape,
  });

  // --- 6. keyboard walkthrough: skip link, focus on light and on ink surface --
  await viewport(1440, 900);
  await navigate(`${BASE}/`);

  await tab();
  const skipFocus = await focusStyles();
  const skipDesc = await describeActive();
  console.log(JSON.stringify({ skipFocus, skipDesc }));
  await shot("08-skip-link-focused");

  await enter();
  await sleep(400);
  const afterSkip = await evaluate(`({ hash: location.hash, active: document.activeElement?.tagName })`);
  // A working skip link moves the sequential focus start to #content: the next
  // Tab must land on the first focusable INSIDE main, not back at the header.
  await tab();
  const afterSkipTab = await describeActive();
  const inMain = await evaluate(`!!document.activeElement.closest('main#content')`);
  console.log(JSON.stringify({ afterSkip, afterSkipTab, inMain }));

  // Walk on: record every stop until we reach a footer (ink-surface) link.
  // Capture the light-surface nav focus on the way.
  const walk = [{ note: "skip link", ...skipDesc, styles: skipFocus }];
  let lightNavStyles = null;
  let darkFooterStyles = null;
  for (let i = 0; i < 40; i++) {
    await tab();
    const d = await describeActive();
    const s = await focusStyles();
    walk.push({ ...d, styles: s });
    if (!lightNavStyles && d.href && d.href.startsWith("/") && !d.inFooterInk && d.slot === null && d.tag === "A" && ["/models", "/how-it-works", "/about"].includes(d.href)) {
      lightNavStyles = { ...d, styles: s };
      await shot("09-focus-light-nav");
    }
    if (d.inFooterInk && d.tag === "A") {
      darkFooterStyles = { ...d, styles: s };
      await shot("10-focus-dark-footer");
      break;
    }
  }
  console.log(JSON.stringify({ lightNavStyles, darkFooterStyles }, null, 2));
  saveJson("keyboard-walkthrough", {
    expected: "skip link focused first (ink pill, On Dark outline); Enter -> #content, next Tab lands inside main; nav link on white: 2px solid Ink full alpha, 2px offset; footer link on Ink Surface: 2px solid On Dark full alpha, 2px offset",
    afterSkip,
    afterSkipTabLandsInMain: inMain,
    lightNavStyles,
    darkFooterStyles,
    fullWalk: walk,
  });
  console.log("static done");
}

ws.close();
process.exit(0);
