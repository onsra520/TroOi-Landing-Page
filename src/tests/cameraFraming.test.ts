import { expect, it } from 'vitest';
import { getCameraProfile } from '../world/layout/cameraFraming';

it('locks the browser-calibrated desktop camera profile', () => {
  const profile = getCameraProfile(16 / 9);
  expect(profile.fov).toBe(36);
  expect(profile.target).toEqual([0, 1.25, 0]);
  expect(profile.position[0]).toBeCloseTo(9.45);
  expect(profile.position[1]).toBeCloseTo(10.07);
  expect(profile.position[2]).toBeCloseTo(11.45);
  expect(profile.near).toBe(0.1);
  expect(profile.far).toBe(220);
});

it('backs off portrait framing without changing the viewing direction', () => {
  const desktop = getCameraProfile(16 / 9);
  const mobile = getCameraProfile(390 / 844);
  expect(mobile.fov).toBe(36);
  expect(mobile.target).toEqual(desktop.target);
  expect(mobile.position[0]).toBeCloseTo(11.151);
  expect(mobile.position[1]).toBeCloseTo(11.6576);
  expect(mobile.position[2]).toBeCloseTo(13.511);
});
