import {
  ACESFilmicToneMapping,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';

export interface RenderStats {
  drawCalls: number;
  triangles: number;
}

export class Renderer {
  readonly instance: WebGLRenderer;

  constructor(host: HTMLElement, width: number, height: number, pixelRatio: number) {
    this.instance = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.instance.outputColorSpace = SRGBColorSpace;
    this.instance.toneMapping = ACESFilmicToneMapping;
    this.instance.toneMappingExposure = 1;
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = PCFSoftShadowMap;
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

  getStats(): RenderStats {
    return {
      drawCalls: this.instance.info.render.calls,
      triangles: this.instance.info.render.triangles,
    };
  }

  dispose(): void {
    this.instance.domElement.remove();
    this.instance.dispose();
  }
}
