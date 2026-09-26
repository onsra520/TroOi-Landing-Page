import type { Group } from "three";

export type AssetId =
  | "building-a"
  | "building-b"
  | "building-c"
  | "building-d"
  | "building-e"
  | "building-f"
  | "building-g"
  | "building-h"
  | "road-straight"
  | "road-crossing"
  | "road-corner"
  | "road-corner-curved"
  | "road-junction"
  | "road-tsplit"
  | "car-hatchback"
  | "car-sedan"
  | "car-stationwagon"
  | "car-taxi"
  | "streetlight"
  | "trafficlight-a"
  | "trafficlight-b"
  | "trafficlight-c"
  | "bench"
  | "dumpster"
  | "firehydrant"
  | "bush"
  | "watertower";

export interface AssetManifestEntry {
  id: AssetId;
  path: string;
  category: "building" | "road" | "vehicle" | "prop";
  critical: boolean;
  fallback?: AssetId;
}

export interface AssetProvider {
  preload(): Promise<void>;
  dispose?(): void;
  configureTextures?(anisotropy: number): void;
  clone(id: AssetId): Group;
  has(id: AssetId): boolean;
}
