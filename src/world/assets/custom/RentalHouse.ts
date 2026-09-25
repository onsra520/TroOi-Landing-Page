import { BoxGeometry, ConeGeometry, Group, Mesh } from 'three';
import { createSeededRandom } from '../../layout/seededRandom';
import { materials } from '../materials';

const BOX = new BoxGeometry(1, 1, 1);
const ROOF = new ConeGeometry(1, 1, 4);

export function createRentalHouse(seed: number): Group {
  const random = createSeededRandom(seed);
  const root = new Group();
  root.name = 'rental-house';

  const width = 1.35 + random() * 0.25;
  const depth = 1.15 + random() * 0.2;
  const height = 1.45 + random() * 0.35;
  const facade = materials.facades[Math.floor(random() * materials.facades.length)]!;
  const roofMaterial = materials.roofs[Math.floor(random() * materials.roofs.length)]!;

  const body = new Mesh(BOX, facade);
  body.scale.set(width, height, depth);
  body.position.y = height / 2;
  root.add(body);

  const roof = new Mesh(ROOF, roofMaterial);
  roof.scale.set(width * 0.82, 0.62, depth * 0.82);
  roof.position.y = height + 0.3;
  roof.rotation.y = Math.PI / 4;
  root.add(roof);

  const awning = new Mesh(BOX, materials.accent);
  awning.scale.set(width * 0.72, 0.12, 0.34);
  awning.position.set(0, height * 0.58, depth / 2 + 0.16);
  root.add(awning);

  const windowBand = new Mesh(BOX, materials.window);
  windowBand.scale.set(width * 0.62, 0.34, 0.04);
  windowBand.position.set(0, height * 0.66, depth / 2 + 0.025);
  root.add(windowBand);

  const door = new Mesh(BOX, materials.dark);
  door.scale.set(0.28, 0.66, 0.05);
  door.position.set(width * 0.28, 0.33, depth / 2 + 0.03);
  root.add(door);

  const utility = new Mesh(BOX, materials.metal);
  utility.scale.set(0.28, 0.22, 0.12);
  utility.position.set(-width / 2 - 0.07, height * 0.56, 0);
  root.add(utility);

  return root;
}
