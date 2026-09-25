export type BlockVariant = 'residential' | 'mixed' | 'green' | 'anchor';

export interface BlockDefinition {
  id: string;
  gridX: number;
  gridZ: number;
  variant: BlockVariant;
  rotation: 0 | 1 | 2 | 3;
  buildingSeed: number;
}

export interface AuthoredBlockOverride {
  gridX: number;
  gridZ: number;
  variant?: BlockVariant;
  rotation?: 0 | 1 | 2 | 3;
  buildingSeed?: number;
}

export interface TownLayoutOptions {
  seed: number;
  size: 5;
  overrides?: readonly AuthoredBlockOverride[];
}

export interface CameraProfile {
  fov: number;
  position: readonly [number, number, number];
  target: readonly [number, number, number];
  near: number;
  far: number;
}

export interface BuildingOptions {
  id: string;
  blockId: string;
  seed: number;
  variant: BlockVariant;
}
