import { BoxGeometry, CylinderGeometry, Group, Mesh } from 'three';
import { materials } from '../materials';

const BOX = new BoxGeometry(1, 1, 1);
const POST = new CylinderGeometry(0.05, 0.06, 1, 6);

function group(name: string): Group {
  const root = new Group();
  root.name = name;
  return root;
}

export function createElectricityPole(): Group {
  const root = group('electricity-pole');
  const pole = new Mesh(POST, materials.trunk);
  pole.scale.y = 2.2;
  pole.position.y = 1.1;
  root.add(pole);
  const bar = new Mesh(BOX, materials.dark);
  bar.scale.set(0.72, 0.08, 0.08);
  bar.position.y = 2.0;
  root.add(bar);
  return root;
}

export function createFence(): Group {
  const root = group('fence');
  for (const x of [-0.75, -0.25, 0.25, 0.75]) {
    const post = new Mesh(BOX, materials.trunk);
    post.scale.set(0.06, 0.5, 0.06);
    post.position.set(x, 0.25, 0);
    root.add(post);
  }
  for (const y of [0.16, 0.38]) {
    const rail = new Mesh(BOX, materials.trunk);
    rail.scale.set(1.65, 0.06, 0.05);
    rail.position.y = y;
    root.add(rail);
  }
  return root;
}

export function createMailbox(): Group {
  const root = group('mailbox');
  const post = new Mesh(BOX, materials.metal);
  post.scale.set(0.08, 0.58, 0.08);
  post.position.y = 0.29;
  root.add(post);
  const box = new Mesh(BOX, materials.accent);
  box.scale.set(0.34, 0.26, 0.42);
  box.position.y = 0.68;
  root.add(box);
  return root;
}

export function createSolarPanel(): Group {
  const root = group('solar-panel');
  const panel = new Mesh(BOX, materials.accentBlue);
  panel.scale.set(0.95, 0.06, 0.62);
  panel.rotation.x = -0.32;
  panel.position.y = 0.45;
  root.add(panel);
  const stand = new Mesh(BOX, materials.metal);
  stand.scale.set(0.5, 0.38, 0.08);
  stand.position.y = 0.2;
  root.add(stand);
  return root;
}

export function createRoadSign(): Group {
  const root = group('road-sign');
  const post = new Mesh(BOX, materials.metal);
  post.scale.set(0.07, 1.05, 0.07);
  post.position.y = 0.525;
  root.add(post);
  const sign = new Mesh(BOX, materials.accentBlue);
  sign.scale.set(0.48, 0.34, 0.07);
  sign.position.y = 1.08;
  root.add(sign);
  return root;
}

export function createTrashBin(): Group {
  const root = group('trash-bin');
  const bin = new Mesh(BOX, materials.dark);
  bin.scale.set(0.42, 0.58, 0.38);
  bin.position.y = 0.29;
  root.add(bin);
  const lid = new Mesh(BOX, materials.metal);
  lid.scale.set(0.46, 0.08, 0.42);
  lid.position.y = 0.62;
  root.add(lid);
  return root;
}
