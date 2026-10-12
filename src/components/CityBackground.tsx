import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../hooks/useTheme';
import { smooth } from '../utils/math';

export default function CityBackground() {
  const hostRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!hostRef.current) return;
    const host = hostRef.current;
    const paused = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    host.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    const bgColor = new THREE.Color(theme === 'forest' ? 0x102a20 : 0xeef3e9);
    scene.background = bgColor;
    renderer.setClearColor(bgColor);

    // Camera — perspective, angled down at the city
    const camera = new THREE.PerspectiveCamera(
      42,
      host.clientWidth / host.clientHeight,
      0.1,
      200
    );
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 0, 0);

    // Lighting
    scene.add(new THREE.HemisphereLight(0xffffff, 0xc7d6b5, 1.5));
    const sun = new THREE.DirectionalLight(0xfff6e5, 2.5);
    sun.position.set(-6, 12, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, {
      left: -18, right: 18, top: 18, bottom: -18, near: 0.5, far: 60,
    });
    sun.shadow.normalBias = 0.04;
    sun.shadow.bias = -0.0003;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xd8f5ff, 1.2);
    fill.position.set(10, 8, -8);
    scene.add(fill);

    // Materials
    const mat = (c: number, r = 0.65) =>
      new THREE.MeshStandardMaterial({ color: c, roughness: r });

    const palette = {
      white: mat(0xfffdf3, 0.72),
      cream: mat(0xe3e3c8, 0.74),
      green: mat(0x91b45e, 0.66),
      dark: mat(0x1d4935, 0.55),
      lime: mat(0xcdf06f, 0.58),
      glass: mat(0x5e9995, 0.22),
      wood: mat(0xaf8e63, 0.68),
      clay: mat(0xb87654, 0.7),
      grey: mat(0x687f77, 0.58),
      skin: mat(0xe0aa7a, 0.72),
      blue: mat(0x527f9d, 0.58),
      black: mat(0x102d23, 0.48),
    };

    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    function box(
      g: THREE.Object3D,
      w: number, h: number, d: number,
      x: number, y: number, z: number,
      m: THREE.Material = palette.white
    ) {
      const o = new THREE.Mesh(boxGeo, m);
      o.scale.set(w, h, d);
      o.position.set(x, y, z);
      o.castShadow = true;
      o.receiveShadow = true;
      g.add(o);
      return o;
    }

    function sphere(
      g: THREE.Object3D,
      r: number,
      x: number, y: number, z: number,
      m: THREE.Material
    ) {
      const o = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), m);
      o.position.set(x, y, z);
      o.castShadow = true;
      g.add(o);
      return o;
    }

    function cylinder(
      g: THREE.Object3D,
      rt: number, rb: number, h: number,
      x: number, y: number, z: number,
      m: THREE.Material
    ) {
      const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 14), m);
      o.position.set(x, y, z);
      o.castShadow = true;
      g.add(o);
      return o;
    }

    function group(parent: THREE.Object3D) {
      const o = new THREE.Group();
      parent.add(o);
      return o;
    }

    // World
    const world = group(scene);
    const city = group(world);
    city.rotation.y = -0.15;

    // Wave deformation
    const wave = (x: number, z: number, t: number) =>
      Math.sin(x * 0.35 + t * 0.5) * 0.48 +
      Math.cos(z * 0.42 + t * 0.4) * 0.38 +
      Math.sin((x + z) * 0.25 + t * 0.3) * 0.25;

    // Terrain
    const terrainGeo = new THREE.PlaneGeometry(24, 21, 64, 56);
    terrainGeo.rotateX(-Math.PI / 2);
    const terrain = new THREE.Mesh(terrainGeo, mat(0xc4d5a8));
    terrain.receiveShadow = true;
    city.add(terrain);
    const terrainPos = terrainGeo.attributes.position;

    // Grid lines
    const gridVerts: number[] = [];
    for (let x = -12; x <= 12; x += 1) {
      for (let z = -10.5; z < 10.5; z += 0.5) gridVerts.push(x, 0, z, x, 0, z + 0.5);
    }
    for (let z = -10.5; z <= 10.5; z += 1) {
      for (let x = -12; x < 12; x += 0.5) gridVerts.push(x, 0, z, x + 0.5, 0, z);
    }
    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridVerts, 3));
    const grid = new THREE.LineSegments(
      gridGeo,
      new THREE.LineBasicMaterial({ color: 0x8fa571, transparent: true, opacity: 0.48 })
    );
    city.add(grid);

    // Roads
    const roads: THREE.Mesh[] = [];
    const roadData: [number, number, number, number][] = [
      [0, 0, 24, 0.38],
      [-3, 0, 0.42, 21],
      [5, 0, 0.36, 21],
      [0, -5, 24, 0.36],
      [0, 5, 24, 0.36],
    ];
    for (const [x, z, w, d] of roadData) {
      const geo = new THREE.PlaneGeometry(w, d, w > 1 ? 64 : 1, d > 1 ? 64 : 1);
      geo.rotateX(-Math.PI / 2);
      geo.translate(x, 0, z);
      const mesh = new THREE.Mesh(geo, mat(0xe4e9d2));
      city.add(mesh);
      roads.push(mesh);
    }

    // Buildings — same logic as StoryScene
    const buildings: Array<{ b: THREE.Group; x: number; z: number; phase: number; speed: number }> = [];

    let seed = 312;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    const facades = [
      mat(0xead3ad),
      mat(0xc2d5ca),
      mat(0xd9b69b),
      mat(0xe5e6cc),
      mat(0xa9c5ca),
    ];
    const roofColors = [mat(0x657950), mat(0xa56a50), mat(0x536e76)];
    const windowMat = mat(0x315a62, 0.23);
    const warmWindow = mat(0xf1ce83, 0.4);

    function building(x: number, z: number, i: number) {
      const b = group(city);
      const tall = i % 3 === 0;
      const w = tall ? 1.45 : 1.15;
      const d = tall ? 1.35 : 1.15;
      const h = tall ? 2.65 + rand() * 1.25 : 1.1 + rand() * 0.45;
      box(b, w, h, d, 0, h / 2, 0, facades[i % facades.length]);

      function windowOn(face: number, u: number, y: number, lit: boolean) {
        const frame = group(b);
        frame.position.set(
          face < 2 ? u : face === 2 ? w / 2 + 0.025 : -w / 2 - 0.025,
          y,
          face < 2
            ? face === 0
              ? d / 2 + 0.025
              : -d / 2 - 0.025
            : u
        );
        frame.rotation.y = [0, Math.PI, Math.PI / 2, -Math.PI / 2][face];
        box(frame, 0.32, 0.4, 0.055, 0, 0, 0, palette.white);
        box(frame, 0.255, 0.32, 0.025, 0, 0, 0.037, lit ? warmWindow : windowMat);
        box(frame, 0.025, 0.33, 0.018, 0, 0, 0.055, palette.cream);
        box(frame, 0.38, 0.055, 0.14, 0, -0.22, 0.02, palette.cream);
      }

      if (tall) {
        box(b, w + 0.18, 0.14, d + 0.18, 0, h + 0.04, 0, palette.white);
        box(b, 0.45, 0.3, 0.4, 0.28, h + 0.25, -0.2, palette.grey);
        for (let y = 0.85; y < h - 0.2; y += 0.56) {
          for (let face = 0; face < 4; face++) {
            for (const u of [-0.37, 0.37]) {
              windowOn(face, u, y, (i + face + Math.round(y * 10)) % 5 === 0);
            }
          }
          box(b, w + 0.08, 0.05, d + 0.08, 0, y - 0.29, 0, palette.cream);
        }
        box(b, 0.62, 0.64, 0.055, 0, 0.34, d / 2 + 0.03, windowMat);
        box(b, 0.04, 0.64, 0.035, 0, 0.34, d / 2 + 0.07, palette.white);
        box(b, 0.95, 0.09, 0.4, 0, 0.74, d / 2 + 0.12, palette.dark);
      } else {
        const half = w / 2 + 0.14;
        const rise = 0.48;
        const depth = d + 0.28;
        const shape = new THREE.Shape();
        shape.moveTo(-half, 0);
        shape.lineTo(half, 0);
        shape.lineTo(0, rise);
        shape.closePath();
        const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
        geo.translate(0, h, -depth / 2);
        const roof = new THREE.Mesh(geo, roofColors[i % 3]);
        roof.castShadow = true;
        roof.receiveShadow = true;
        b.add(roof);

        const pitch = Math.atan2(rise, half);
        const length = Math.hypot(rise, half);
        for (const sign of [-1, 1]) {
          const panel = box(
            b, length, 0.065, depth + 0.05,
            (sign * half) / 2, h + rise / 2 + 0.015, 0,
            roofColors[i % 3]
          );
          panel.rotation.z = -sign * pitch;
        }

        box(b, 0.3, 0.65, 0.065, 0.25, 0.34, d / 2 + 0.04, palette.wood);
        sphere(b, 0.025, 0.34, 0.33, d / 2 + 0.083, palette.dark);
        windowOn(0, -0.28, 0.73, i % 3 === 0);
        windowOn(1, 0, 0.72, false);
        for (const face of [2, 3]) windowOn(face, 0, 0.72, i % 4 === 0);
        box(b, 0.46, 0.06, 0.25, 0.25, 0.05, d / 2 + 0.12, palette.cream);
      }

      box(b, w + 0.2, 0.1, d + 0.2, 0, 0.015, 0, palette.cream);
      b.position.set(x, 0, z);
      buildings.push({ b, x, z, phase: rand() * Math.PI * 2, speed: 0.3 + rand() * 0.35 });
      return b;
    }

    // Generate all 47 buildings
    for (let i = 0; i < 47; i++) {
      let x = ((i % 8) - 3.5) * 2.6 + 0.6;
      let z = (Math.floor(i / 8) - 2.5) * 3.15 + 0.9;
      if (Math.abs(x + 3) < 0.9) x += 1;
      if (Math.abs(x - 5) < 0.9) x += 1.2;
      if (Math.abs(z) < 0.8) z += 1.3;
      building(x, z, i);
    }

    // Trees — cylinder trunk + sphere foliage
    const trees: Array<{ g: THREE.Group; x: number; z: number }> = [];
    for (let i = 0; i < 40; i++) {
      const g = group(city);
      const x = (rand() - 0.5) * 23;
      const z = (rand() - 0.5) * 19;
      cylinder(g, 0.065, 0.08, 0.6, 0, 0.3, 0, palette.wood);
      sphere(g, 0.33, 0, 0.85, 0, i % 2 ? palette.green : palette.dark);
      g.position.set(x, 0, z);
      trees.push({ g, x, z });
    }

    // Locator rings (the lime torus rings from StoryScene)
    function ring(parent: THREE.Object3D, r: number, x: number, y: number, z: number) {
      const o = new THREE.Mesh(new THREE.TorusGeometry(r, 0.045, 10, 60), palette.lime);
      o.rotation.x = -Math.PI / 2;
      o.position.set(x, y, z);
      parent.add(o);
      return o;
    }
    const locator = group(city);
    ring(locator, 0.85, 0, 0, 0);
    ring(locator, 1.13, 0, 0.01, 0);
    locator.position.set(1, 0.7, 2);

    // Resize
    function resize() {
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    // Render loop
    let time = 0;
    let last = performance.now();

    function render(now: number) {
      const rafId = requestAnimationFrame(render);
      if (document.hidden) { last = now; return; }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!paused) time += dt;

      // Theme
      bgColor.set(theme === 'forest' ? 0x102a20 : 0xeef3e9);

      // Terrain wave
      for (let i = 0; i < terrainPos.count; i++) {
        const x = terrainPos.getX(i), z = terrainPos.getZ(i);
        terrainPos.setY(i, wave(x, z, time));
      }
      terrainPos.needsUpdate = true;
      terrainGeo.computeVertexNormals();

      // Grid wave
      const gp = gridGeo.attributes.position;
      for (let i = 0; i < gp.count; i++) {
        gp.setY(i, wave(gp.getX(i), gp.getZ(i), time) + 0.016);
      }
      gp.needsUpdate = true;

      // Roads wave
      for (const r of roads) {
        const a = r.geometry.attributes.position;
        for (let i = 0; i < a.count; i++) {
          a.setY(i, wave(a.getX(i), a.getZ(i), time) + 0.026);
        }
        a.needsUpdate = true;
      }

      // Buildings
      for (const { b, x, z, phase, speed } of buildings) {
        const v = paused ? 0.85 : smooth((Math.sin(time * speed + phase) + 0.5) / 1.1);
        b.scale.y = Math.max(0.001, v);
        b.scale.x = b.scale.z = 0.85 + 0.15 * v;
        b.position.y = wave(x, z, time) - 0.2 * (1 - v);
      }

      // Trees
      for (const { g, x, z } of trees) {
        g.position.y = wave(x, z, time);
      }

      // Locator rings rotation
      locator.rotation.y += dt * 0.6;

      renderer.render(scene, camera);
    }
    const rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      if (host.contains(renderer.domElement)) host.removeChild(renderer.domElement);
    };
  }, [theme]);

  return (
    <div
      ref={hostRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
