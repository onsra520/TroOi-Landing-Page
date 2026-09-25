import { Group } from 'three';
import type { RenderBlockDefinition } from './layout/RenderLayout';
import type { AssetProvider } from './resources/assetTypes';
import { BLOCK_PITCH } from './roads/roadTopology';
import { createBlockTemplate } from './templates/createBlockTemplate';

export class Block {
  readonly root = new Group();

  constructor(definition: RenderBlockDefinition, assets: AssetProvider) {
    this.root.name = definition.id;
    this.root.userData.logical = definition.logical;
    this.root.userData.block = definition;
    this.root.position.set(
      definition.gridX * BLOCK_PITCH,
      0,
      definition.gridZ * BLOCK_PITCH,
    );
    this.root.add(createBlockTemplate(definition, assets));
  }
}
