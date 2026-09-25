import { expect, it } from 'vitest';
import { getCameraProfile } from '../world/layout/cameraFraming';

it('keeps one viewing target while backing off on narrow screens', () => {
  const desktop = getCameraProfile(16 / 9);
  const mobile = getCameraProfile(9 / 16);

  expect(desktop.target).toEqual(mobile.target);
  expect(mobile.position[1]).toBeGreaterThanOrEqual(desktop.position[1]);
  expect(mobile.position[2]).toBeGreaterThanOrEqual(desktop.position[2]);
});

it('uses one low-perspective FOV and preserves camera direction', () => {
  const desktop = getCameraProfile(16 / 9);
  const mobile = getCameraProfile(9 / 16);
  const scale = mobile.position[0] / desktop.position[0];

  expect(desktop.fov).toBe(30);
  expect(mobile.fov).toBe(30);
  expect(mobile.position[1]).toBeCloseTo(desktop.position[1] * scale);
  expect(mobile.position[2]).toBeCloseTo(desktop.position[2] * scale);
});
