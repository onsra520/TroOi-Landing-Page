import { BoxGeometry, ConeGeometry, Group, InstancedMesh, Mesh, Object3D } from 'three';
import { createSeededRandom } from '../layout/seededRandom';
import type { BlockVariant, BuildingOptions } from '../layout/types';
import { materials } from './materials';

const BOX = new BoxGeometry(1, 1, 1);
const PYRAMID = new ConeGeometry(1, 1, 4);

function heightRange(variant: BlockVariant): readonly [number, number] {
  switch (variant) {
    case 'anchor':
      return [4.2, 6.6];
    case 'mixed':
      return [3.2, 5.2];
    case 'green':
      return [2.0, 3.1];
    default:
      return [2.4, 4.0];
  }
}

function addWindows(root: Group, width: number, depth: number, height: number): void {
  const rows = Math.max(1, Math.floor(height / 1.15));
  const transforms: Array<readonly [number, number, number, number, number, number]> = [];

  for (let row = 0; row < rows; row += 1) {
    const y = 0.72 + row * 1.05;
    if (y > height - 0.32) break;

    for (const offset of [-0.23, 0.23]) {
      transforms.push([width * offset, y, depth / 2 + 0.025, 0.3, 0.38, 0.045]);
    }
    transforms.push([width / 2 + 0.025, y, 0, 0.045, 0.38, 0.32]);
  }

  if (transforms.length === 0) return;

  const windows = new InstancedMesh(BOX, materials.window, transforms.length);
  windows.name = 'windows';
  const transform = new Object3D();

  transforms.forEach(([x, y, z, scaleX, scaleY, scaleZ], index) => {
    transform.position.set(x, y, z);
    transform.scale.set(scaleX, scaleY, scaleZ);
    transform.updateMatrix();
    windows.setMatrixAt(index, transform.matrix);
  });
  windows.instanceMatrix.needsUpdate = true;
  root.add(windows);
}
export function createBuilding(options: BuildingOptions): Group {
  const random = createSeededRandom(options.seed);
  const root = new Group();
  root.name = options.id;
  root.userData.asset = { id: options.id, type: 'building', blockId: options.blockId };

  const width = 1.55 + random() * 0.85;
  const depth = 1.45 + random() * 0.8;
  const [minHeight, maxHeight] = heightRange(options.variant);
  const height = minHeight + random() * (maxHeight - minHeight);
  const facade = materials.facades[Math.floor(random() * materials.facades.length)]!;
  const roofMaterial = materials.roofs[Math.floor(random() * materials.roofs.length)]!;

  const body = new Mesh(BOX, facade);
  body.scale.set(width, height, depth);
  body.position.y = height / 2;
  root.add(body);

  addWindows(root, width, depth, height);

  if (random() > 0.46 || options.variant === 'anchor') {
    const roof = new Mesh(BOX, roofMaterial);
    roof.scale.set(width + 0.16, 0.2, depth + 0.16);
    roof.position.y = height + 0.1;
    root.add(roof);
  } else {
    const roof = new Mesh(PYRAMID, roofMaterial);
    roof.scale.set(width * 0.72, 0.8, depth * 0.72);
    roof.position.y = height + 0.4;
    roof.rotation.y = Math.PI / 4;
    root.add(roof);
  }

  return root;
}
