import { BoxGeometry, CylinderGeometry, Group, Mesh } from 'three';
import { createSeededRandom } from '../../layout/seededRandom';
import { materials } from '../materials';

const BOX = new BoxGeometry(1, 1, 1);
const POST = new CylinderGeometry(0.05, 0.05, 1, 6);

export function createGasStation(seed: number): Group {
  const random = createSeededRandom(seed);
  const root = new Group();
  root.name = 'gas-station';

  const kiosk = new Mesh(BOX, materials.facades[Math.floor(random() * materials.facades.length)]!);
  kiosk.scale.set(1.0, 0.9, 0.9);
  kiosk.position.set(-0.7, 0.45, -0.35);
  root.add(kiosk);

  const canopy = new Mesh(BOX, materials.accent);
  canopy.scale.set(1.95, 0.14, 1.05);
  canopy.position.set(0.45, 1.28, 0.35);
  root.add(canopy);

  for (const x of [-0.25, 1.05]) {
    const post = new Mesh(POST, materials.metal);
    post.scale.y = 1.18;
    post.position.set(x, 0.59, 0.35);
    root.add(post);
  }

  for (const x of [0.05, 0.75]) {
    const pump = new Mesh(BOX, materials.dark);
    pump.scale.set(0.22, 0.48, 0.28);
    pump.position.set(x, 0.24, 0.36);
    root.add(pump);
  }

  const sign = new Mesh(BOX, materials.accentBlue);
  sign.scale.set(0.22, 1.2, 0.16);
  sign.position.set(1.45, 0.6, -0.55);
  root.add(sign);

  return root;
}
