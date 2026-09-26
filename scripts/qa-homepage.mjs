import { chromium } from "../../infinity-town/.superpowers/sdd/2026-09-25-trooi-infinitown-redesign-plan/qa-deps/node_modules/playwright-core/index.mjs";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
await fs.mkdir(".superpowers/homepage-qa", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const [width, height, mobile] of [
    [1440, 900, false],
    [390, 844, true],
    [844, 390, true],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      hasTouch: mobile,
      isMobile: mobile,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://127.0.0.1:4176/TroOi-Landing-Page/?debug3d=1");
    await page.waitForFunction(() => window.__trooiQA);
    await page.screenshot({
      path: `.superpowers/homepage-qa/home-${width}.png`,
    });
    for (const journey of ["tenant", "owner"]) {
      await page.locator(`[data-journey="${journey}"].journey-choice`).click();
      await page.locator(".story-panel").waitFor({ state: "visible" });
      assert.equal(
        await page
          .locator("#story-title")
          .evaluate((el) => document.activeElement === el),
        true,
      );
      await page.screenshot({
        path: `.superpowers/homepage-qa/${journey}-${width}.png`,
      });
      await page.locator(".story-back").click();
      await page.locator(".home-menu").waitFor({ state: "visible" });
    }
    if (!mobile) {
      const before = await page.evaluate(() => window.__trooiQA.snapshot());
      await page.mouse.move(90, 300);
      await page.mouse.down();
      await page.mouse.move(250, 400, { steps: 12 });
      await page.mouse.up();
      const after = await page.evaluate(() => window.__trooiQA.snapshot());
      assert.notDeepEqual(before, after);
      assert.deepEqual(before.camera, after.camera);
      await page.locator(".tenant").focus();
      await page.keyboard.press("Enter");
      await page.locator(".story-panel").waitFor({ state: "visible" });
      await page.keyboard.press("Escape");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.locator(".owner").click();
      await page.locator(".story-panel").waitFor({ state: "visible" });
    }
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}x${height} journeys, return, focus, page errors`);
    await context.close();
  }
} finally {
  await browser.close();
}
