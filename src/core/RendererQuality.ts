export class RendererQuality {
  pixelRatio: number;
  private samples: number[] = [];
  private cooldown = 0;
  private slowWindows = 0;
  constructor(
    private width: number,
    private deviceDpr: number,
  ) {
    this.pixelRatio = this.initial();
  }
  private initial(): number {
    return Math.min(Math.max(this.deviceDpr, 0.5), this.width < 768 ? 1.5 : 2);
  }
  resize(width: number, deviceDpr: number): number {
    this.width = width;
    this.deviceDpr = deviceDpr;
    this.samples = [];
    this.cooldown = 0;
    this.slowWindows = 0;
    return (this.pixelRatio = this.initial());
  }
  sample(frameMs: number): number | null {
    if (!Number.isFinite(frameMs) || frameMs <= 0 || frameMs > 1000)
      return null;
    if (this.cooldown > 0) {
      this.cooldown--;
      return null;
    }
    this.samples.push(frameMs);
    if (this.samples.length < 120) return null;
    this.samples.sort((a, b) => a - b);
    const median = this.samples[60]!;
    this.samples = [];
    const mobile = this.width < 768;
    this.slowWindows = median > (mobile ? 38 : 22) ? this.slowWindows + 1 : 0;
    let next = this.pixelRatio;
    if (this.slowWindows >= 2)
      next = Math.max(Math.min(this.deviceDpr, 1), next - 0.25);
    else if (mobile && median < 24)
      next = Math.min(this.deviceDpr, 1.75, next + 0.25);
    if (next === this.pixelRatio) return null;
    this.pixelRatio = next;
    this.cooldown = 300;
    this.slowWindows = 0;
    return next;
  }
}
