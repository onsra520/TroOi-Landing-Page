export class Time {
  delta = 0;
  elapsed = 0;
  private lastSeconds: number;

  constructor(initialNowMs = performance.now()) {
    this.lastSeconds = initialNowMs / 1000;
  }

  update(nowMs = performance.now()): void {
    const nowSeconds = nowMs / 1000;
    this.delta = Math.min(0.05, Math.max(0, nowSeconds - this.lastSeconds));
    this.elapsed += this.delta;
    this.lastSeconds = nowSeconds;
  }
}
