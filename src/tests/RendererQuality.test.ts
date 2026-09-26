import { expect, it } from "vitest";
import { RendererQuality } from "../core/RendererQuality";
it("caps initial DPR and changes only after stable windows", () => {
  expect(new RendererQuality(1440, 3).pixelRatio).toBe(2);
  expect(new RendererQuality(390, 3).pixelRatio).toBe(1.5);
  expect(new RendererQuality(390, 1).pixelRatio).toBe(1);
  const q = new RendererQuality(390, 3);
  for (let n = 0; n < 30; n++) q.sample(n % 2 ? 16 : 45);
  expect(q.pixelRatio).toBe(1.5);
  for (let n = 0; n < 600; n++) q.sample(45);
  expect(q.pixelRatio).toBeLessThan(1.5);
  const low = q.pixelRatio;
  for (let n = 0; n < 20; n++) q.sample(10);
  expect(q.pixelRatio).toBe(low);
});
