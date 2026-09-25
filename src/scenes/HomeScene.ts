import { ClusterLibrary } from '../world/clusters/ClusterLibrary';
import { ClusterPrototypes } from '../world/clusters/ClusterPrototypes';
import {
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  Mesh,
  Object3D,
  Scene,
} from 'three';
import { colors } from '../world/assets/materials';
import { Town } from '../world/Town';
import type { AssetProvider } from '../world/resources/assetTypes';

function isInsideNamedRoot(object: Object3D, name: string): boolean {
  let current: Object3D | null = object;
  while (current) {
    if (current.name === name) return true;
    current = current.parent;
  }
  return false;
}

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
    key.position.set(-16, 28, 14);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -36;
    key.shadow.camera.right = 36;
    key.shadow.camera.top = 36;
    key.shadow.camera.bottom = -36;
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far = 100;
    key.shadow.bias = -0.00025;
    this.scene.add(key);

    this.town = new Town(assets);
    if (import.meta.env.DEV && typeof location !== 'undefined' && new URLSearchParams(location.search).has('clusterPreview')) {
      const prototypes = new ClusterPrototypes(assets);
      const definitions = new ClusterLibrary();
      const blocks = this.town.root.getObjectByName('blocks');
      blocks?.children.forEach((block,index) => {
        block.clear();
        block.add(prototypes.get(definitions.resolve({x:index%9,z:Math.floor(index/9)})).clone(true));
      });
    }
    this.configureTownShadows(this.town.root);
    this.scene.add(this.town.root);
  }
  update(delta: number, elapsed: number): void {
    this.town.update(delta, elapsed);
  }

  private configureTownShadows(root: Object3D): void {
    root.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.receiveShadow = true;
      object.castShadow = object.name !== 'town-ground' && !isInsideNamedRoot(object, 'road-network');
    });
  }
}
