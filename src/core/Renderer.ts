import {
  ACESFilmicToneMapping,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';

export class Renderer {
  readonly instance: WebGLRenderer;

  constructor(host: HTMLElement, width: number, height: number, pixelRatio: number) {
    this.instance = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.instance.outputColorSpace = SRGBColorSpace;
    this.instance.toneMapping = ACESFilmicToneMapping;
    this.instance.toneMappingExposure = 1;
    this.resize(width, height, pixelRatio);
    host.appendChild(this.instance.domElement);
  }

  resize(width: number, height: number, pixelRatio: number): void {
    this.instance.setPixelRatio(pixelRatio);
    this.instance.setSize(width, height, false);
  }

  render(scene: Scene, camera: PerspectiveCamera): void {
    this.instance.render(scene, camera);
  }

  dispose(): void {
    this.instance.domElement.remove();
    this.instance.dispose();
  }
}
