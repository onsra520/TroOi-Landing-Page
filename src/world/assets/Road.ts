import { BoxGeometry, Group, Mesh } from 'three';
import { materials } from './materials';

const UNIT_BOX = new BoxGeometry(1, 1, 1);
const ROAD_WIDTH = 1.45;

export function createRoad(blockSize: number): Group {
  const root = new Group();
  root.name = 'road';
  root.userData.asset = { type: 'road' };

  const horizontal = new Mesh(UNIT_BOX, materials.road);
  horizontal.scale.set(blockSize, 0.05, ROAD_WIDTH);
  horizontal.position.set(0, 0.025, blockSize / 2);
  root.add(horizontal);

  const vertical = new Mesh(UNIT_BOX, materials.road);
  vertical.scale.set(ROAD_WIDTH, 0.05, blockSize);
  vertical.position.set(blockSize / 2, 0.025, 0);
  root.add(vertical);

  return root;
}
