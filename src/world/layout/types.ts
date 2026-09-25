export interface CameraProfile {
  fov: number;
  position: readonly [number, number, number];
  target: readonly [number, number, number];
  near: number;
  far: number;
}
