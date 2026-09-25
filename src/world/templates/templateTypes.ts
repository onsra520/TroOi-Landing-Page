export type TemplateAssetType = 'building' | 'prop' | 'tree';

export interface Placement {
  slotId: string;
  type: TemplateAssetType;
  archetype: string;
  x: number;
  z: number;
  rotation?: number;
  scale?: number;
}
