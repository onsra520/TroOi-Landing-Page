import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = process.cwd();
const qa = path.join(
  root,
  ".superpowers/sdd/2026-09-25-trooi-infinitown-redesign-plan",
);
const { chromium } = await import(
  pathToFileURL(path.join(qa, "qa-deps/node_modules/playwright-core/index.mjs"))
    .href
);
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--ignore-gpu-blocklist"],
});
const url =
  process.env.QA_URL ?? "http://127.0.0.1:4174/TroOi-Landing-Page/?debug3d=1";
const frames = async (page, n = 120) =>
  page.evaluate(
    (n) =>
      new Promise((resolve) => {
        let i = 0;
        function step() {
          if (++i >= n) resolve();
          else requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }),
    n,
  );
const results = [];
try {
  for (const [width, height, dpr] of [
    [1440, 900, 1],
    [1920, 1080, 1],
    [390, 844, 1],
    [1440, 900, 2],
    [1920, 1080, 2],
    [390, 844, 3],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: dpr,
      hasTouch: width < 768,
      isMobile: width < 768,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(url);
    await page.waitForFunction(() => window.__trooiQA);
    await frames(page, 180);
    const before = await page.evaluate(() => window.__trooiQA.snapshot());
    await page.screenshot({
      path: path.join(qa, `city-${width}-${height}-dpr${dpr}-start.png`),
    });
    const getCamera = () =>
      page.evaluate(() => window.__trooiQA.snapshot().camera);
    if (width < 768) {
      await page.locator("#map-explore").click();
      assert.equal(
        await page.locator("#map-explore").getAttribute("aria-pressed"),
        "true",
      );
      const cdp = await context.newCDPSession(page);
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: 180, y: 400 }],
      });
      for (let i = 1; i <= 20; i++)
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: 180 + i * 3, y: 400 + i * 2 }],
        });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
    } else {
      await page.mouse.move(width / 2, height / 2);
      await page.mouse.down();
      await page.mouse.move(width / 2 + 250, height / 2 + 120, { steps: 30 });
      await page.mouse.up();
    }
    await frames(page, 120);
    assert.deepEqual(await getCamera(), before.camera);
    await page.mouse.wheel(0, 500);
    await frames(page, 10);
    assert.deepEqual(await getCamera(), before.camera);
    for (const [dx, dz, label] of [
      [2.99, 2.99, "pre-seam"],
      [0.02, 0.02, "post-seam"],
      [19, -14, "diagonal"],
      [-72, 72, "period"],
    ]) {
      await page.evaluate(([x, z]) => window.__trooiQA.panBy(x, z), [dx, dz]);
      await frames(page, 3);
      assert.deepEqual(await getCamera(), before.camera);
      if (dpr === 1)
        await page.screenshot({
          path: path.join(qa, `city-${width}-${height}-${label}.png`),
        });
    }
    const state = await page.evaluate(() => window.__trooiQA.snapshot());
    assert.equal(state.rootY, 0);
    assert.equal(state.poolSize, before.poolSize);
    const stats = await page.evaluate(() => window.__trooiQA.stats());
    assert.ok(stats.drawCalls < 1000);
    assert.ok(stats.meshes < 850);
    const gpu = await page.evaluate(() => {
      const gl = document.querySelector("canvas").getContext("webgl2"),
        ext = gl.getExtension("WEBGL_debug_renderer_info");
      return {
        renderer: ext
          ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
          : gl.getParameter(gl.RENDERER),
        antialias: gl.getContextAttributes().antialias,
        samples: gl.getParameter(gl.SAMPLES),
      };
    });
    assert.deepEqual(errors, []);
    results.push({
      width,
      height,
      dpr,
      poolSize: state.poolSize,
      ...stats,
      gpu,
      errors,
    });
    console.log(JSON.stringify(results.at(-1)));
    await fs.writeFile(
      path.join(qa, "qa-results.json"),
      JSON.stringify(results, null, 2),
    );
    await context.close();
  }
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(url);
  await page.waitForFunction(() => window.__trooiQA);
  await frames(page, 30);
  // Warm every content coordinate and render it; diagonal-only travel omits variants.
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 12; col++) {
      await page.evaluate(
        (x) => window.__trooiQA.panBy(x, 0),
        row % 2 ? -6 : 6,
      );
      await frames(page, 1);
    }
    await page.evaluate(() => window.__trooiQA.panBy(0, 6));
  }
  await frames(page, 3);
  const initial = await page.evaluate(() => window.__trooiQA.stats());
  await page.evaluate(() => {
    for (let n = 0; n < 1000; n++) window.__trooiQA.panBy(n % 2 ? 6 : -12, 6);
  });
  await frames(page, 5);
  const after = await page.evaluate(() => window.__trooiQA.stats());
  assert.equal(after.geometries, initial.geometries);
  assert.equal(after.textures, initial.textures);
  assert.equal(after.meshes, initial.meshes);
  results.push({ stress: { initial, after } });
  console.log("1000-cell resource stability passed");
  await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    window.__qaLost = canvas
      .getContext("webgl2")
      .getExtension("WEBGL_lose_context");
    window.__qaLost.loseContext();
  });
  await page.locator("#webgl-fallback").waitFor({ state: "visible" });
  await page.evaluate(() => window.__qaLost.restoreContext());
  await page.waitForFunction(() =>
    document.querySelector("#webgl-fallback").hasAttribute("hidden"),
  );
  await page.waitForFunction(() => window.__trooiQA);
  assert.equal(await page.locator("canvas").count(), 1);
  await context.close();
  // A failed critical asset must expose a usable retry, then recover with one canvas.
  const failure = await browser.newContext();
  const fp = await failure.newPage();
  await fp.route("**/road_junction.gltf", (route) => route.abort());
  await fp.goto(url);
  await fp.locator("#webgl-fallback").waitFor({ state: "visible" });
  await fp.unroute("**/road_junction.gltf");
  await fp.locator("#retry-3d").click();
  await fp.waitForFunction(() => window.__trooiQA);
  assert.equal(await fp.locator("canvas").count(), 1);
  await failure.close();
  results.push({ contextRestore: true, criticalAssetRetry: true });
  await fs.writeFile(
    path.join(qa, "qa-results.json"),
    JSON.stringify(results, null, 2),
  );
  console.log("QA completed");
} finally {
  await browser.close();
}
