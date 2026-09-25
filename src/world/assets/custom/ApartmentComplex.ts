import { BoxGeometry, Group, Mesh } from 'three';
import { createSeededRandom } from '../../layout/seededRandom';
import { materials } from '../materials';

const BOX = new BoxGeometry(1, 1, 1);

export function createApartmentComplex(seed: number): Group {
  const random = createSeededRandom(seed);
  const root = new Group();
  root.name = 'apartment-complex';

  const height = 2.55 + random() * 0.55;
  const facade = materials.facades[Math.floor(random() * materials.facades.length)]!;

  const main = new Mesh(BOX, facade);
  main.scale.set(1.45, height, 1.22);
  main.position.set(-0.24, height / 2, 0);
  root.add(main);

  const wing = new Mesh(BOX, materials.concrete);
  wing.scale.set(0.72, height * 0.72, 1.42);
  wing.position.set(0.82, (height * 0.72) / 2, 0.18);
  root.add(wing);

  const windows = new Mesh(BOX, materials.window);
  windows.scale.set(0.72, height * 0.58, 0.04);
  windows.position.set(-0.24, height * 0.55, 0.63);
  root.add(windows);

  const parapet = new Mesh(BOX, materials.roofs[2]!);
  parapet.scale.set(1.56, 0.12, 1.32);
  parapet.position.set(-0.24, height + 0.06, 0);
  root.add(parapet);

  const utility = new Mesh(BOX, materials.metal);
  utility.scale.set(0.44, 0.34, 0.38);
  utility.position.set(0.16, height + 0.23, -0.1);
  root.add(utility);

  const entry = new Mesh(BOX, materials.accentBlue);
  entry.scale.set(0.38, 0.6, 0.08);
  entry.position.set(-0.32, 0.3, 0.66);
  root.add(entry);

  return root;
}
