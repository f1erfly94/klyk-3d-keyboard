/**
 * Real-browser check and screenshot pass.
 *
 * Drives the built site through the locally installed Chrome: scroll position by
 * scroll position, plus a keypress, a colourway change and a phone-sized run.
 * Embedded preview panes do not composite WebGL frames, so a frame counter and a
 * real screenshot are the only honest way to see whether the scene actually runs.
 *
 *   node scripts/capture.mjs [outputDir] [baseUrl]
 */
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const out = process.argv[2] ?? "docs/screenshots";
const base = process.argv[3] ?? "http://localhost:3102";
const sections = ["hero", "feel", "anatomy", "configurator", "order"];

await mkdir(out, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

const shoot = (target, name) =>
  target.screenshot({ path: `${out}/${name}.jpg`, type: "jpeg", quality: 82 });

await page.goto(base, { waitUntil: "networkidle" });
await page.waitForSelector("canvas", { timeout: 20000 });
// Let the scene build its geometry and bake the environment map.
await page.waitForTimeout(2500);

/** Frames the page actually produced in one second. */
const fps = await page.evaluate(
  () =>
    new Promise((resolve) => {
      let frames = 0;
      const start = performance.now();
      const tick = () => {
        frames += 1;
        if (performance.now() - start < 1000) requestAnimationFrame(tick);
        else resolve(frames);
      };
      requestAnimationFrame(tick);
    }),
);

for (const [index, id] of sections.entries()) {
  await page.evaluate((anchor) => {
    document.getElementById(anchor)?.scrollIntoView({ block: "start" });
  }, id);
  await page.waitForTimeout(1400);
  await shoot(page, `desktop-${index}-${id}`);
}

await page.evaluate(() => document.getElementById("feel")?.scrollIntoView({ block: "start" }));
await page.waitForTimeout(1200);
await page.keyboard.down("F");
await page.waitForTimeout(220);
await shoot(page, "desktop-keypress");
const readout = (await page.locator("#feel [aria-live=polite]").innerText()).trim();
await page.keyboard.up("F");

await page.evaluate(() => document.getElementById("configurator")?.scrollIntoView({ block: "start" }));
await page.waitForTimeout(1200);
await page.getByRole("button", { name: /Signal/ }).click();
await page.getByRole("button", { name: /полікарбонат/i }).click();
await page.waitForTimeout(1000);
await shoot(page, "desktop-configured");

const canvasSize = await page.evaluate(() => {
  const canvas = document.querySelector("canvas");
  return canvas ? { width: canvas.width, height: canvas.height } : null;
});

const mobile = await browser.newPage({
  viewport: { width: 375, height: 812 },
  isMobile: true,
  hasTouch: true,
});
await mobile.goto(base, { waitUntil: "networkidle" });
await mobile.waitForTimeout(1500);
const mobileCanvases = await mobile.locator("canvas").count();
const mobileBoards = await mobile.locator("svg[role=img]").count();
await shoot(mobile, "mobile-hero");
await mobile.evaluate(() => document.getElementById("configurator")?.scrollIntoView({ block: "start" }));
await mobile.waitForTimeout(700);
await shoot(mobile, "mobile-configurator");

console.log(
  JSON.stringify({ fps, readout, canvasSize, mobileCanvases, mobileBoards, errors }, null, 2),
);

await browser.close();
