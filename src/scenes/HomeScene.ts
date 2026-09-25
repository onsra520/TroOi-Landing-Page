import { Color, DirectionalLight, Fog, HemisphereLight, Scene } from 'three';
import { colors } from '../world/assets/materials';
import { Town } from '../world/Town';
import type { AssetProvider } from '../world/resources/assetTypes';

export class HomeScene {
  readonly scene = new Scene();
  private readonly town: Town;

  constructor(assets: AssetProvider) {
    const background = new Color(colors.sky);
    this.scene.background = background;
    this.scene.fog = new Fog(background, 55, 95);

    const ambient = new HemisphereLight(0xffffff, 0x71806a, 2.25);
    this.scene.add(ambient);

    const key = new DirectionalLight(0xfff4dc, 3.4);
    key.position.set(-14, 22, 12);
    this.scene.add(key);

    this.town = new Town(assets);
    this.scene.add(this.town.root);
  }

  update(delta: number, elapsed: number): void {
    this.town.update(delta, elapsed);
  }
}
