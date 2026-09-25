import { BoxGeometry, Group, Mesh } from 'three';
import { createSeededRandom } from '../../layout/seededRandom';
import { materials } from '../materials';

const BOX = new BoxGeometry(1, 1, 1);

export function createConvenienceStore(seed: number): Group {
  const random = createSeededRandom(seed);
  const root = new Group();
  root.name = 'convenience-store';

  const width = 1.85 + random() * 0.15;
  const body = new Mesh(BOX, materials.facades[2]!);
  body.scale.set(width, 1.05, 1.22);
  body.position.y = 0.525;
  root.add(body);

  const glazing = new Mesh(BOX, materials.window);
  glazing.scale.set(width * 0.76, 0.48, 0.05);
  glazing.position.set(0, 0.46, 0.635);
  root.add(glazing);

  const fascia = new Mesh(BOX, materials.accent);
  fascia.scale.set(width * 0.9, 0.22, 0.08);
  fascia.position.set(0, 0.92, 0.66);
  root.add(fascia);

  const awning = new Mesh(BOX, materials.accentBlue);
  awning.scale.set(width * 0.84, 0.1, 0.34);
  awning.position.set(0, 0.72, 0.78);
  root.add(awning);

  const rear = new Mesh(BOX, materials.concrete);
  rear.scale.set(width * 0.62, 0.74, 0.52);
  rear.position.set(0, 0.37, -0.78);
  root.add(rear);

  return root;
}
