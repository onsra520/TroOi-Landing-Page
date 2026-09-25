import { Group } from 'three';
import { describe, expect, it } from 'vitest';
import { getLoopPosition, RoutedVehicle } from '../world/RoutedVehicle';

const route = {
  id: 'lane-x', axis: 'x', fixed: 3.32, start: -21, length: 42, direction: 1,
} as const;

describe('RoutedVehicle', () => {
  it('moves a supplied model along the route and keeps stable identity', () => {
    const model = new Group();
    model.name = 'kaykit-car';
    const vehicle = new RoutedVehicle({ id: 'vehicle-0', route, model, speed: 2, initialProgress: 0 });
    expect(vehicle.root.userData.asset).toEqual({ id: 'vehicle-0', type: 'vehicle' });
    expect(vehicle.root.children[0]?.name).toBe('kaykit-car');
    const before = vehicle.root.position.x;
    vehicle.update(0.5);
    expect(vehicle.root.position.x).toBeGreaterThan(before);
    expect(vehicle.root.position.z).toBe(route.fixed);
  });

  it('wraps positive and negative progress', () => {
    expect(getLoopPosition(43, 42)).toBe(1);
    expect(getLoopPosition(-1, 42)).toBe(41);
  });
});
