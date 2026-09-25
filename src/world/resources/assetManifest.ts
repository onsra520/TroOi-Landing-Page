import type { AssetManifestEntry } from './assetTypes';

const ROOT = 'assets/vendor/kaykit-city-builder/';

export const assetManifest: readonly AssetManifestEntry[] = [
  { id: 'building-a', path: `${ROOT}building_A_withoutBase.gltf`, category: 'building', critical: true },
  { id: 'building-b', path: `${ROOT}building_B_withoutBase.gltf`, category: 'building', critical: false, fallback: 'building-a' },
  { id: 'building-c', path: `${ROOT}building_C_withoutBase.gltf`, category: 'building', critical: false, fallback: 'building-a' },
  { id: 'building-d', path: `${ROOT}building_D_withoutBase.gltf`, category: 'building', critical: false, fallback: 'building-a' },
  { id: 'building-e', path: `${ROOT}building_E_withoutBase.gltf`, category: 'building', critical: false, fallback: 'building-a' },
  { id: 'building-f', path: `${ROOT}building_F_withoutBase.gltf`, category: 'building', critical: false, fallback: 'building-a' },
  { id: 'building-g', path: `${ROOT}building_G_withoutBase.gltf`, category: 'building', critical: false, fallback: 'building-a' },
  { id: 'building-h', path: `${ROOT}building_H_withoutBase.gltf`, category: 'building', critical: false, fallback: 'building-a' },
  { id: 'road-straight', path: `${ROOT}road_straight.gltf`, category: 'road', critical: true },
  { id: 'road-crossing', path: `${ROOT}road_straight_crossing.gltf`, category: 'road', critical: false, fallback: 'road-straight' },
  { id: 'road-corner', path: `${ROOT}road_corner.gltf`, category: 'road', critical: true },
  { id: 'road-corner-curved', path: `${ROOT}road_corner_curved.gltf`, category: 'road', critical: false, fallback: 'road-corner' },
  { id: 'road-junction', path: `${ROOT}road_junction.gltf`, category: 'road', critical: true },
  { id: 'road-tsplit', path: `${ROOT}road_tsplit.gltf`, category: 'road', critical: true },
  { id: 'car-sedan', path: `${ROOT}car_sedan.gltf`, category: 'vehicle', critical: false },
  { id: 'car-hatchback', path: `${ROOT}car_hatchback.gltf`, category: 'vehicle', critical: false, fallback: 'car-sedan' },
  { id: 'car-stationwagon', path: `${ROOT}car_stationwagon.gltf`, category: 'vehicle', critical: false, fallback: 'car-sedan' },
  { id: 'car-taxi', path: `${ROOT}car_taxi.gltf`, category: 'vehicle', critical: false, fallback: 'car-sedan' },
  { id: 'streetlight', path: `${ROOT}streetlight.gltf`, category: 'prop', critical: false },
  { id: 'trafficlight-a', path: `${ROOT}trafficlight_A.gltf`, category: 'prop', critical: false },
  { id: 'trafficlight-b', path: `${ROOT}trafficlight_B.gltf`, category: 'prop', critical: false },
  { id: 'trafficlight-c', path: `${ROOT}trafficlight_C.gltf`, category: 'prop', critical: false },
  { id: 'bench', path: `${ROOT}bench.gltf`, category: 'prop', critical: false },
  { id: 'dumpster', path: `${ROOT}dumpster.gltf`, category: 'prop', critical: false },
  { id: 'firehydrant', path: `${ROOT}firehydrant.gltf`, category: 'prop', critical: false },
  { id: 'bush', path: `${ROOT}bush.gltf`, category: 'prop', critical: false },
  { id: 'watertower', path: `${ROOT}watertower.gltf`, category: 'prop', critical: false },
];

export function assetUrl(entry: AssetManifestEntry, baseUrl: string): string {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${base}/${entry.path}`;
}
