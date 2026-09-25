import { MeshStandardMaterial } from 'three';

export const colors = {
  sky: 0xd6e6d1,
  road: 0x686b70,
  sidewalk: 0xeeeae0,
  grass: 0x9fce68,
  trunk: 0x8f6b4f,
  foliage: 0x649c57,
  window: 0x355b63,
  concrete: 0xd8d3c7,
  metal: 0x69747a,
  accent: 0xd66f51,
  accentBlue: 0x4f83aa,
  dark: 0x3d4548,
} as const;

export const materials = {
  road: new MeshStandardMaterial({ color: colors.road, roughness: 0.95 }),
  sidewalk: new MeshStandardMaterial({ color: colors.sidewalk, roughness: 0.9 }),
  grass: new MeshStandardMaterial({ color: colors.grass, roughness: 1 }),
  trunk: new MeshStandardMaterial({ color: colors.trunk, roughness: 1 }),
  foliage: new MeshStandardMaterial({ color: colors.foliage, roughness: 0.95 }),
  window: new MeshStandardMaterial({ color: colors.window, roughness: 0.45 }),
  concrete: new MeshStandardMaterial({ color: colors.concrete, roughness: 0.9 }),
  metal: new MeshStandardMaterial({ color: colors.metal, roughness: 0.7 }),
  accent: new MeshStandardMaterial({ color: colors.accent, roughness: 0.78 }),
  accentBlue: new MeshStandardMaterial({ color: colors.accentBlue, roughness: 0.75 }),
  dark: new MeshStandardMaterial({ color: colors.dark, roughness: 0.82 }),
  facades: [0xf0c98e, 0xd9a394, 0xaac9c2, 0xf0e1b5, 0xb6c7df].map(
    (color) => new MeshStandardMaterial({ color, roughness: 0.82 }),
  ),
  roofs: [0x65795d, 0xa46652, 0x596f78, 0xc08b66].map(
    (color) => new MeshStandardMaterial({ color, roughness: 0.9 }),
  ),
};
