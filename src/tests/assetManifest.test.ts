import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { assetManifest, assetUrl } from '../world/resources/assetManifest';

describe('asset manifest', () => {
  it('has unique ids and relative vendor paths', () => {
    expect(new Set(assetManifest.map((entry) => entry.id)).size).toBe(assetManifest.length);
    for (const entry of assetManifest) {
      expect(entry.path.startsWith('assets/vendor/kaykit-city-builder/')).toBe(true);
      expect(entry.path.startsWith('/')).toBe(false);
    }
  });

  it('vendors every manifest file and composes base-aware URLs', () => {
    for (const entry of assetManifest) {
      expect(existsSync(resolve('public', entry.path))).toBe(true);
      expect(assetUrl(entry, '/TroOi-Landing-Page/')).toBe(`/TroOi-Landing-Page/${entry.path}`);
    }
  });
});
