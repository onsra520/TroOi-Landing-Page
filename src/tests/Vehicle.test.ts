import { expect, it } from 'vitest';
import { getLoopPosition, Vehicle } from '../world/assets/Vehicle';

it('wraps positive progress', () => {
  expect(getLoopPosition(12, 10)).toBe(2);
});

it('wraps negative progress', () => {
  expect(getLoopPosition(-1, 10)).toBe(9);
});

it('moves along its configured route and keeps asset identity', () => {
  const vehicle = new Vehicle({
    id: 'vehicle-1',
    axis: 'x',
    lane: 4,
    routeLength: 10,
    speed: 2,
    initialProgress: 0,
  });
  const startX = vehicle.root.position.x;

  vehicle.update(1);

  expect(vehicle.root.position.x).not.toBe(startX);
  expect(vehicle.root.userData.asset).toEqual({ id: 'vehicle-1', type: 'vehicle' });
});
