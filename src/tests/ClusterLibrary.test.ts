import { describe, expect, it } from 'vitest';
import { ClusterLibrary } from '../world/clusters/ClusterLibrary';

describe('periodic authored clusters', () => {
  it('returns identical composition at signed periodic coordinates', () => {
    const library = new ClusterLibrary();
    expect(library.resolve({ x: -1, z: -13 })).toEqual(library.resolve({ x: 11, z: 11 }));
    const home = library.resolve({ x: 0, z: 0 });
    for (let n=0;n<1000;n++) library.resolve({ x:n,z:-n });
    expect(library.resolve({ x:0,z:0 })).toEqual(home);
  });
  it('authors varied dense lots inside a four-unit footprint', () => {
    const library = new ClusterLibrary();
    const kinds = new Set<string>();
    for(let z=0;z<12;z++) for(let x=0;x<12;x++) {
      const d = library.resolve({x,z}); kinds.add(d.kind);
      const buildings = d.placements.filter(p=>p.role==='building');
      if(!['park','industrial','landmark','service'].includes(d.kind)) expect(buildings.length).toBeGreaterThanOrEqual(3);
      for(const p of d.placements) {
        expect(Math.abs(p.x)+p.width/2).toBeLessThanOrEqual(1.96);
        expect(Math.abs(p.z)+p.depth/2).toBeLessThanOrEqual(1.96);
      }
      for(let i=0;i<buildings.length;i++) for(let j=i+1;j<buildings.length;j++) {
        const a=buildings[i]!,b=buildings[j]!;
        expect(Math.abs(a.x-b.x)>=(a.width+b.width)/2 || Math.abs(a.z-b.z)>=(a.depth+b.depth)/2).toBe(true);
      }
    }
    expect(kinds.size).toBe(8);
  });
});
