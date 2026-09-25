import type { CameraProfile } from './types';

const TARGET = [0, 1.25, 0] as const;
const DESKTOP_OFFSET = [9.45, 8.82, 11.45] as const;
const NARROW_SCALE = 1.18;

export function getCameraProfile(aspect: number): CameraProfile {
  const scale = aspect < 0.8 ? NARROW_SCALE : 1;

  return {
    fov: 36,
    position: [
      TARGET[0] + DESKTOP_OFFSET[0] * scale,
      TARGET[1] + DESKTOP_OFFSET[1] * scale,
      TARGET[2] + DESKTOP_OFFSET[2] * scale,
    ],
    target: TARGET,
    near: 0.1,
    far: 220,
  };
}
