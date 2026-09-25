import type { CameraProfile } from './types';

const TARGET = [0, 0, 0] as const;
const DESKTOP_POSITION = [22, 30, 22] as const;
const NARROW_SCALE = 1.18;

export function getCameraProfile(aspect: number): CameraProfile {
  const scale = aspect < 0.8 ? NARROW_SCALE : 1;

  return {
    fov: 30,
    position: [
      DESKTOP_POSITION[0] * scale,
      DESKTOP_POSITION[1] * scale,
      DESKTOP_POSITION[2] * scale,
    ],
    target: TARGET,
    near: 0.1,
    far: 200,
  };
}
