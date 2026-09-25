import { BoxGeometry, Group, Mesh, Object3D } from 'three';
import type { RenderBlockDefinition } from '../layout/RenderLayout';
import { createSeededRandom } from '../layout/seededRandom';
import type { AssetId, AssetProvider } from '../resources/assetTypes';
import { createTree } from '../assets/Tree';
import { materials } from '../assets/materials';
import { createApartmentComplex } from '../assets/custom/ApartmentComplex';
import { createConvenienceStore } from '../assets/custom/ConvenienceStore';
import { createGasStation } from '../assets/custom/GasStation';
import { createRentalHouse } from '../assets/custom/RentalHouse';
import {
  createElectricityPole,
  createFence,
  createMailbox,
  createRoadSign,
  createSolarPanel,
  createTrashBin,
} from '../assets/custom/UtilityProps';
import type { TemplateAssetType } from './templateTypes';

const LOT = new BoxGeometry(1, 1, 1);

function place(
  parent: Group,
  object: Object3D,
  definition: RenderBlockDefinition,
  slotId: string,
  type: TemplateAssetType,
  archetype: string,
  x: number,
  z: number,
  rotation = 0,
  scale = 1,
): void {
  object.name = `${definition.id}-${slotId}`;
  object.position.set(x, 0.08, z);
  object.rotation.y = rotation;
  object.scale.multiplyScalar(scale);
  object.userData.asset = {
    id: object.name,
    type,
    ...(definition.logical ? { blockId: definition.id } : { visualBlockId: definition.id }),
    archetype,
  };
  parent.add(object);
}

function vendor(
  parent: Group,
  assets: AssetProvider,
  definition: RenderBlockDefinition,
  id: AssetId,
  slotId: string,
  type: TemplateAssetType,
  x: number,
  z: number,
  rotation = 0,
  scale = 1,
): void {
  if (!assets.has(id)) return;
  place(parent, assets.clone(id), definition, slotId, type, id, x, z, rotation, scale);
}

function addTree(
  parent: Group,
  definition: RenderBlockDefinition,
  slotId: string,
  x: number,
  z: number,
  scale = 0.62,
): void {
  place(parent, createTree(scale), definition, slotId, 'tree', 'tree', x, z);
}

function createLot(definition: RenderBlockDefinition): Mesh {
  const material = definition.kind === 'green' ? materials.grass : materials.sidewalk;
  const lot = new Mesh(LOT, material);
  lot.name = 'lot';
  lot.scale.set(4, 0.1, 4);
  lot.position.y = 0.03;
  return lot;
}

function addVisualOnly(
  root: Group,
  definition: RenderBlockDefinition,
  assets: AssetProvider,
): void {
  switch (definition.kind) {
    case 'green':
      addTree(root, definition, 'tree-a', -0.65, 0.4, 0.78);
      vendor(root, assets, definition, 'bush', 'bush-a', 'prop', 0.65, -0.45, 0, 0.8);
      return;
    case 'industrial':
      vendor(root, assets, definition, 'building-h', 'primary', 'building', 0, 0, 0, 0.7);
      vendor(root, assets, definition, 'watertower', 'water', 'prop', 1.35, 1.1, 0, 0.65);
      return;
    case 'commercial':
      vendor(root, assets, definition, 'building-c', 'primary', 'building', 0, 0, 0, 0.72);
      vendor(root, assets, definition, 'streetlight', 'light', 'prop', 1.35, -1.2, 0, 0.75);
      return;
    case 'apartment':
      vendor(root, assets, definition, 'building-f', 'primary', 'building', 0, 0, 0, 0.78);
      vendor(root, assets, definition, 'bush', 'bush', 'prop', -1.25, 1.1, 0, 0.85);
      return;
    default:
      vendor(root, assets, definition, 'building-a', 'primary', 'building', 0, 0, 0, 0.74);
      addTree(root, definition, 'tree', 1.25, 1.1, 0.68);
  }
}

function addResidential(root: Group, definition: RenderBlockDefinition, assets: AssetProvider): void {
  place(root, createRentalHouse(definition.seed), definition, 'house', 'building', 'rental-house', -0.72, 0.55, 0.12, 0.82);
  vendor(root, assets, definition, 'building-a', 'building-a', 'building', 0.92, -0.62, Math.PI / 2, 0.5);
  vendor(root, assets, definition, 'building-b', 'building-b', 'building', 0.9, 0.88, 0, 0.46);
  place(root, createFence(), definition, 'fence', 'prop', 'fence', -0.4, -1.55, 0, 0.78);
  place(root, createMailbox(), definition, 'mailbox', 'prop', 'mailbox', 1.45, -1.36, 0, 0.85);
  addTree(root, definition, 'tree-a', -1.35, 1.35, 0.55);
  addTree(root, definition, 'tree-b', 1.38, 1.32, 0.5);
}

function addCommercial(root: Group, definition: RenderBlockDefinition, assets: AssetProvider): void {
  const random = createSeededRandom(definition.seed);
  const storefront = random() > 0.72
    ? createGasStation(definition.seed + 11)
    : createConvenienceStore(definition.seed + 11);
  const archetype = storefront.name;
  place(root, storefront, definition, 'storefront', 'building', archetype, -0.48, 0.24, 0, 0.82);
  vendor(root, assets, definition, 'building-c', 'building-c', 'building', 1.08, 0.82, Math.PI / 2, 0.46);
  vendor(root, assets, definition, 'dumpster', 'dumpster', 'prop', 1.35, -1.3, 0, 0.72);
  vendor(root, assets, definition, 'bench', 'bench', 'prop', -1.3, -1.35, 0, 0.7);
  vendor(root, assets, definition, 'streetlight', 'light', 'prop', 1.5, 1.45, 0, 0.72);
  vendor(root, assets, definition, 'firehydrant', 'hydrant', 'prop', -1.5, 1.3, 0, 0.78);
}

function addApartment(root: Group, definition: RenderBlockDefinition, assets: AssetProvider): void {
  place(root, createApartmentComplex(definition.seed), definition, 'complex', 'building', 'apartment-complex', -0.35, 0.1, 0, 0.76);
  vendor(root, assets, definition, 'building-e', 'building-e', 'building', 1.22, -0.68, Math.PI / 2, 0.52);
  vendor(root, assets, definition, 'bench', 'bench', 'prop', -1.35, -1.32, 0, 0.72);
  vendor(root, assets, definition, 'bush', 'bush-a', 'prop', 1.36, 1.26, 0, 0.76);
  vendor(root, assets, definition, 'bush', 'bush-b', 'prop', -1.46, 1.24, 0, 0.7);
}

function addGreen(root: Group, definition: RenderBlockDefinition, assets: AssetProvider): void {
  vendor(root, assets, definition, 'bench', 'bench', 'prop', 0, -0.25, 0, 0.8);
  const positions = [[-1.25, -1.1], [1.25, -1.0], [-1.05, 1.2], [1.12, 1.24]] as const;
  positions.forEach(([x, z], index) => {
    if (assets.has('bush')) vendor(root, assets, definition, 'bush', `bush-${index}`, 'prop', x, z, 0, 0.82);
    else addTree(root, definition, `tree-${index}`, x, z, 0.52);
  });
}

function addIndustrial(root: Group, definition: RenderBlockDefinition, assets: AssetProvider): void {
  vendor(root, assets, definition, 'building-h', 'warehouse', 'building', -0.25, 0.1, 0, 0.72);
  vendor(root, assets, definition, 'watertower', 'water', 'prop', 1.32, 1.2, 0, 0.7);
  vendor(root, assets, definition, 'dumpster', 'dumpster', 'prop', 1.35, -1.25, 0, 0.76);
  place(root, createElectricityPole(), definition, 'pole', 'prop', 'electricity-pole', -1.42, 1.28, 0, 0.7);
  place(root, createTrashBin(), definition, 'trash', 'prop', 'trash-bin', -1.25, -1.28, 0, 0.72);
}

function addLandmark(root: Group, definition: RenderBlockDefinition, assets: AssetProvider): void {
  place(root, createApartmentComplex(definition.seed + 81), definition, 'complex', 'building', 'apartment-complex', -0.35, 0.05, 0, 0.88);
  vendor(root, assets, definition, 'building-g', 'tower', 'building', 1.15, -0.55, Math.PI / 2, 0.62);
  place(root, createSolarPanel(), definition, 'solar', 'prop', 'solar-panel', -1.35, -1.3, 0.2, 0.82);
  place(root, createRoadSign(), definition, 'sign', 'prop', 'road-sign', 1.38, 1.25, 0, 0.8);
  addTree(root, definition, 'tree', -1.35, 1.25, 0.58);
}

export function createBlockTemplate(
  definition: RenderBlockDefinition,
  assets: AssetProvider,
): Group {
  const root = new Group();
  root.name = `template:${definition.kind}`;
  root.userData.templateKind = definition.kind;
  root.add(createLot(definition));

  if (!definition.logical) {
    addVisualOnly(root, definition, assets);
    return root;
  }

  switch (definition.kind) {
    case 'residential': addResidential(root, definition, assets); break;
    case 'commercial': addCommercial(root, definition, assets); break;
    case 'apartment': addApartment(root, definition, assets); break;
    case 'green': addGreen(root, definition, assets); break;
    case 'industrial': addIndustrial(root, definition, assets); break;
    case 'landmark': addLandmark(root, definition, assets); break;
  }

  root.rotation.y = definition.rotation * (Math.PI / 2);
  return root;
}
