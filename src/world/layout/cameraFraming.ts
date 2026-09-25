import type { CameraProfile } from './types';

const TARGET = [0, 0, 0] as const;

export function getCameraProfile(aspect: number): CameraProfile {
  const narrow = aspect < 0.8;

  return {
    fov: narrow ? 36 : 32,
    position: narrow ? [18, 25, 30] : [20, 22, 26],
    target: TARGET,
    near: 0.1,
    far: 200,
  };
}
