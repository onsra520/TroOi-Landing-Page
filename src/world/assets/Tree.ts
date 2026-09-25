import { ConeGeometry, CylinderGeometry, Group, Mesh } from 'three';
import { materials } from './materials';

const TRUNK = new CylinderGeometry(0.09, 0.12, 0.72, 6);
const CROWN = new ConeGeometry(0.42, 0.9, 7);

export function createTree(scale = 1): Group {
  const root = new Group();
  root.name = 'tree';
  root.userData.asset = { type: 'tree' };

  const trunk = new Mesh(TRUNK, materials.trunk);
  trunk.position.y = 0.36;
  root.add(trunk);

  const lower = new Mesh(CROWN, materials.foliage);
  lower.position.y = 1.05;
  root.add(lower);

  const upper = new Mesh(CROWN, materials.foliage);
  upper.scale.setScalar(0.72);
  upper.position.y = 1.48;
  root.add(upper);

  root.scale.setScalar(scale);
  return root;
}
