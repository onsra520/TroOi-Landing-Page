import { MeshStandardMaterial } from 'three';

export const colors = {
  sky: 0xd8e8d4,
  road: 0xaeb9ae,
  sidewalk: 0xe8e3d2,
  grass: 0xa9c985,
  trunk: 0x8f6b4f,
  foliage: 0x6f9d67,
  window: 0x45656b,
} as const;

export const materials = {
  road: new MeshStandardMaterial({ color: colors.road, roughness: 0.95 }),
  sidewalk: new MeshStandardMaterial({ color: colors.sidewalk, roughness: 0.9 }),
  grass: new MeshStandardMaterial({ color: colors.grass, roughness: 1 }),
  trunk: new MeshStandardMaterial({ color: colors.trunk, roughness: 1 }),
  foliage: new MeshStandardMaterial({ color: colors.foliage, roughness: 0.95 }),
  window: new MeshStandardMaterial({ color: colors.window, roughness: 0.45 }),
  facades: [0xf0c98e, 0xd9a394, 0xaac9c2, 0xf0e1b5, 0xb6c7df].map(
    (color) => new MeshStandardMaterial({ color, roughness: 0.82 }),
  ),
  roofs: [0x65795d, 0xa46652, 0x596f78, 0xc08b66].map(
    (color) => new MeshStandardMaterial({ color, roughness: 0.9 }),
  ),
};
