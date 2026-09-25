import { Color, Scene } from 'three';

export class HomeScene {
  readonly scene = new Scene();

  constructor() {
    this.scene.background = new Color(0xd8e8d4);
  }

  update(_delta: number, _elapsed: number): void {
    // Town motion is added in the next implementation task.
  }
}
