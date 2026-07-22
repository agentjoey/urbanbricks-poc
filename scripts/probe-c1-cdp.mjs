/**
 * TEMPORARY c1-form evidence driver — DELETE BEFORE COMMIT.
 * Drives headless Chrome over raw CDP (no new dependencies; Node 24 has a
 * global WebSocket) against the PRODUCTION build on :3401 and captures the
 * quote form's state matrix. Screenshots land in .pact/tasks/c1-form-evidence/.
 *
 * Usage: node scripts/probe-c1-cdp.mjs <phase>
 *   phase = states-good | rate-limited | states-bad
 */
import { writeFileSync, mkdirSync } from "node:fs";

const BASE = "http://localhost:3401/probe-c1";
const OUT = ".pact/tasks/c1-form-evidence";
const phase = process.argv[2];
if (!phase) {
  console.error("usage: node scripts/probe-c1-cdp.mjs <phase>");
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

// --- minimal CDP client ------------------------------------------------------
const version = await fetch("http://localhost:9222/json/version").then((r) => r.json());
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
await send(
  "Emulation.setDeviceMetricsOverride",
  { width: 1280, height: 1100, deviceScaleFactor: 1, mobile: false },
  sessionId,
);

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
  // Let hydration settle.
  await new Promise((r) => setTimeout(r, 1200));
}

async function shot(name) {
  const { data } = await send(
    "Page.captureScreenshot",
    { format: "png", captureBeyondViewport: true },
    sessionId,
  );
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(data, "base64"));
  console.log(`saved ${OUT}/${name}.png`);
}

/** Poll the page until the selector matches (or throw after timeout). */
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

/** The timing trap rejects submissions under 3s from render. */
async function waitOutTimingTrap() {
  await sleep(3400);
}

async function fillValidForm(email) {
  await evaluate(`(() => {
    const set = (name, value) => {
      const el = document.querySelector('[name="' + name + '"]');
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };
    set('name', 'CDP Evidence');
    set('email', ${JSON.stringify(email)});
    set('timeline', '3-6-months');
    set('budget_band', '60k-90k');
    set('project_type', 'residential');
    set('message', 'Automated evidence submission — safe to delete.');
    document.querySelector('[name="consent"]').checked = true;
    return true;
  })()`);
}

async function clickSubmit() {
  await evaluate(`document.querySelector('button[type="submit"]').click()`);
}

// --- phases --------------------------------------------------------------------
if (phase === "states-good") {
  // 1. idle, light surface, with model slug
  await navigate(`${BASE}?model=1`);
  await shot("01-idle-light");

  // 2. idle, ink-surface (dark token swap check)
  await navigate(`${BASE}?dark=1`);
  await shot("02-idle-dark");

  // 3. validation errors — submit empty (past the timing trap first)
  await navigate(`${BASE}?model=1`);
  await waitOutTimingTrap();
  await clickSubmit();
  await waitFor('[role="alert"]');
  await sleep(400);
  await shot("03-validation-errors");

  // 4. submitting (throttled network so the pending state is capturable),
  //    then 5. success once the throttle is lifted.
  await navigate(`${BASE}?model=1`);
  await waitOutTimingTrap();
  await fillValidForm("c1-probe-browser@c1-probe.invalid");
  await send("Network.enable", {}, sessionId);
  await send(
    "Network.emulateNetworkConditions",
    { offline: false, latency: 3000, downloadThroughput: 50000, uploadThroughput: 50000 },
    sessionId,
  );
  await clickSubmit();
  await waitFor('button[type="submit"][disabled]', 8000);
  await sleep(300);
  await shot("04-submitting");
  await send(
    "Network.emulateNetworkConditions",
    { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 },
    sessionId,
  );
  await waitFor('[role="status"]', 20000);
  await sleep(300);
  await shot("05-success");
  console.log("states-good done");
}

if (phase === "rate-limited") {
  // Quota already consumed by earlier valid submissions (see evidence notes);
  // a fresh valid submit must now render the rate-limited state.
  await navigate(`${BASE}?model=1`);
  await waitOutTimingTrap();
  await fillValidForm("c1-probe-limited@c1-probe.invalid");
  await clickSubmit();
  await waitFor('[role="alert"]');
  await sleep(400);
  await shot("06-rate-limited");
  console.log("rate-limited done");
}

if (phase === "states-bad") {
  // Server is running with a bogus DATABASE_URL — the insert must fail, the
  // fallback error must render, and the submission must hit the runtime log.
  await navigate(`${BASE}?model=1`);
  await waitOutTimingTrap();
  await fillValidForm("c1-probe-dbfail@c1-probe.invalid");
  await clickSubmit();
  await waitFor('[role="alert"]');
  await sleep(400);
  await shot("07-server-failure");
  console.log("states-bad done");
}

ws.close();
process.exit(0);
