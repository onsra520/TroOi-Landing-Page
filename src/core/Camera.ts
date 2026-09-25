import { PerspectiveCamera, Vector3 } from 'three';
import { getCameraProfile } from '../world/layout/cameraFraming';

export class Camera {
  readonly instance: PerspectiveCamera;

  constructor(width: number, height: number) {
    const profile = getCameraProfile(width / height);
    this.instance = new PerspectiveCamera(profile.fov, width / height, profile.near, profile.far);
    this.applyProfile(width, height);
  }

  resize(width: number, height: number): void {
    this.applyProfile(width, height);
  }

  private applyProfile(width: number, height: number): void {
    const profile = getCameraProfile(width / height);
    this.instance.aspect = width / height;
    this.instance.fov = profile.fov;
    this.instance.near = profile.near;
    this.instance.far = profile.far;
    this.instance.position.set(...profile.position);
    this.instance.lookAt(new Vector3(...profile.target));
    this.instance.updateProjectionMatrix();
  }
}
