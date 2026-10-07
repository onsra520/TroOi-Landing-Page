import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import logoImgUrl from '/trooi-logo-main.png';

interface SceneState {
  city: boolean;
  room: boolean;
  transaction: boolean;
  care: boolean;
  end: boolean;
}

function sceneState(p: number): SceneState {
  return {
    city: p < 1.4,
    room: p >= 0.72 && p < 2.1,
    transaction: p >= 1.74 && p < 3.0,
    care: p >= 3.02 && p < 3.8,
    end: p >= 3.9
  };
}

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const smooth = (x: number) => {
  x = clamp(x);
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const CHAPTER_1_SELECTOR = '.chapter:not([hidden])';

export default function StoryScene() {
  const hostRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    const host = hostRef.current;
    const paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    let chapters: HTMLElement[] = [...document.querySelectorAll(CHAPTER_1_SELECTOR)] as HTMLElement[];
    let links: HTMLAnchorElement[] = [...document.querySelectorAll('.chapter-nav a')] as HTMLAnchorElement[];
    
    const handleBranchChange = () => {
      chapters = [...document.querySelectorAll(CHAPTER_1_SELECTOR)] as HTMLElement[];
      links = [...document.querySelectorAll('.chapter-nav a')] as HTMLAnchorElement[];
      getScroll();
    };
    
    window.addEventListener('trooi:branch-change', handleBranchChange);

    let position = 0;
    let target = 0;
    let active = 0;
    let appLanding = false;
    let appArrival = 0;

    const releaseAppLanding = () => {
      if (appArrival) cancelAnimationFrame(appArrival);
      appArrival = 0;
      if (appLanding) {
        appLanding = false;
        getScroll();
      }
    };

    window.addEventListener('wheel', releaseAppLanding, { passive: true });
    window.addEventListener('touchstart', releaseAppLanding, { passive: true });
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
        releaseAppLanding();
      }
    });

    const labels = [
      'MỘT THÀNH PHỐ. NGÀN KHỞI ĐẦU.',
      'KẾT NỐI HAI PHÍA.',
      'KHÔNG GIAN CỦA RIÊNG BẠN.',
      'RÕ RÀNG TỪNG KHOẢN CHI.',
      'Ở TRỌ, CÓ NHAU.',
      'MỘT ỨNG DỤNG. CẢ HÀNH TRÌNH.'
    ];

    const landlordLabels = [
      'MỘT THÀNH PHỐ. NGÀN KHỞI ĐẦU.',
      'KẾT NỐI HAI PHÍA.',
      'LẤP ĐẦY PHÒNG TRỐNG.',
      'CHỐT SỐ ĐIỆN NƯỚC.',
      'KẾT NỐI KHÁCH THUÊ.',
      'MỘT ỨNG DỤNG. CẢ HÀNH TRÌNH.'
    ];

    function getScroll() {
      const page = window.scrollY / chapters[1].offsetTop;
      const easing = (x: number) => {
        const t = clamp(x);
        return t * t * (3 - 2 * t);
      };
      const roomPreview = 0.12 * easing((page - 1.7) / 0.3) * (1 - easing((page - 2) / 0.3));
      target = clamp(page - clamp(page - 1, 0, 1) + roomPreview, 0, 4.4);

      if (
        appLanding ||
        (document.body.dataset.branch !== 'pending' &&
          window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 2)
      ) {
        target = 4.4;
      }

      const idx =
        target < 0.65
          ? 0
          : document.body.dataset.branch === 'pending' || window.scrollY < chapters[1].offsetTop * 1.9
          ? 1
          : target < 1.95
          ? 2
          : target < 3.05
          ? 3
          : target < 3.95
          ? 4
          : 5;

      active = idx;

      chapters.forEach((s, i) => {
        const copy = s.querySelector('.copy') as HTMLElement;
        if (copy) {
          copy.style.opacity = i === idx ? '1' : '0';
          copy.style.visibility = i === idx ? 'visible' : 'hidden';
        }
      });

      links.forEach((a, i) => {
        a.classList.toggle('active', i === idx);
        if (i === idx) a.setAttribute('aria-current', 'step');
        else a.removeAttribute('aria-current');
      });

      const sceneNum = document.querySelector('#scene-number');
      if (sceneNum) sceneNum.textContent = `0${idx + 1} / 06`;
      document.body.dataset.activeChapter = chapters[idx].id;

      const landlordStage = document.getElementById('landlord-stage');
      if (landlordStage) {
        landlordStage.setAttribute(
          'aria-hidden',
          String(document.body.dataset.branch !== 'landlord' || idx === 5)
        );
      }

      const sceneLabel = document.querySelector('#scene-label');
      if (sceneLabel) {
        sceneLabel.textContent = (document.body.dataset.branch === 'landlord' ? landlordLabels : labels)[idx];
      }
    }

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    host.appendChild(renderer.domElement);

    // Scene setup
    const scene = new THREE.Scene();

    const syncRendererTheme = () => {
      renderer.setClearColor(0x000000, 0);
    };
    syncRendererTheme();
    document.addEventListener('trooi:theme-change', syncRendererTheme);

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 160);
    camera.position.set(16, 15, 21);
    camera.lookAt(0, 0, 0);

    // Lights
    scene.add(new THREE.HemisphereLight(0xffffff, 0x6d8255, 3));
    const sun = new THREE.DirectionalLight(0xfff6db, 5);
    sun.position.set(-8, 19, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, {
      left: -22,
      right: 22,
      top: 22,
      bottom: -22,
      near: 0.5,
      far: 60
    });
    sun.shadow.normalBias = 0.04;
    sun.shadow.bias = -0.0003;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xd8f5ff, 2);
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
      black: mat(0x102d23, 0.48)
    };

    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    function box(
      g: THREE.Object3D,
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
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
      x: number,
      y: number,
      z: number,
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
      rt: number,
      rb: number,
      h: number,
      x: number,
      y: number,
      z: number,
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

    // Groups
    const world = group(scene);
    const city = group(world);
    const room = group(world);
    const transaction = group(world);
    const care = group(world);
    const end = group(world);
    city.rotation.y = -0.15;

    // Terrain with wave deformation
    const wave = (x: number, z: number, t: number) =>
      Math.sin(x * 0.35 + t * 0.5) * 0.48 +
      Math.cos(z * 0.42 + t * 0.4) * 0.38 +
      Math.sin((x + z) * 0.25 + t * 0.3) * 0.25;

    const terrainGeo = new THREE.PlaneGeometry(24, 21, 64, 56);
    terrainGeo.rotateX(-Math.PI / 2);
    const terrain = new THREE.Mesh(terrainGeo, mat(0xc4d5a8));
    terrain.receiveShadow = true;
    city.add(terrain);
    const terrainPosition = terrainGeo.attributes.position;

    // Grid lines
    const gridVertices: number[] = [];
    for (let x = -12; x <= 12; x += 1) {
      for (let z = -10.5; z < 10.5; z += 0.5) {
        gridVertices.push(x, 0, z, x, 0, z + 0.5);
      }
    }
    for (let z = -10.5; z <= 10.5; z += 1) {
      for (let x = -12; x < 12; x += 0.5) {
        gridVertices.push(x, 0, z, x + 0.5, 0, z);
      }
    }
    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridVertices, 3));
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
      [0, 5, 24, 0.36]
    ];
    for (const [x, z, w, d] of roadData) {
      const geo = new THREE.PlaneGeometry(w, d, w > 1 ? 64 : 1, d > 1 ? 64 : 1);
      geo.rotateX(-Math.PI / 2);
      geo.translate(x, 0, z);
      const mesh = new THREE.Mesh(geo, mat(0xe4e9d2));
      city.add(mesh);
      roads.push(mesh);
    }

    // Buildings - 47 total with procedural windows and roofs
    const buildings: Array<{
      b: THREE.Group;
      x: number;
      z: number;
      phase: number;
      speed: number;
    }> = [];
    let seed = 312;
    function rand() {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    }

    const facades = [
      mat(0xead3ad),
      mat(0xc2d5ca),
      mat(0xd9b69b),
      mat(0xe5e6cc),
      mat(0xa9c5ca)
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
          face < 2 ? (face === 0 ? d / 2 + 0.025 : -d / 2 - 0.025) : u
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
            for (let u of [-0.37, 0.37]) {
              windowOn(face, u, y, (i + face + Math.round(y * 10)) % 5 === 0);
            }
          }
          box(b, w + 0.08, 0.05, d + 0.08, 0, y - 0.29, 0, palette.cream);
        }
        box(b, 0.62, 0.64, 0.055, 0, 0.34, d / 2 + 0.03, windowMat);
        box(b, 0.04, 0.64, 0.035, 0, 0.34, d / 2 + 0.07, palette.white);
        box(b, 0.95, 0.09, 0.4, 0, 0.74, d / 2 + 0.12, palette.dark);
      } else {
        // Extruded gable roof
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
          const panel = box(b, length, 0.065, depth + 0.05, (sign * half) / 2, h + rise / 2 + 0.015, 0, roofColors[i % 3]);
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

    // Trees
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

    // Locator rings
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

    // Room shell
    function roomShell(parent: THREE.Object3D) {
      box(parent, 7.5, 0.28, 6.4, 0, -0.14, 0, palette.wood);
      for (let x = -3.5; x < 3.8; x += 0.5) {
        box(parent, 0.012, 0.007, 6.25, x, 0.007, 0, palette.cream);
      }
      box(parent, 7.5, 3.8, 0.18, 0, 1.9, -3.1, palette.cream);
      box(parent, 0.18, 3.8, 6.4, -3.65, 1.9, 0, palette.white);
      box(parent, 7.3, 0.12, 0.13, 0, 0.07, -2.96, palette.white);
      box(parent, 0.13, 0.12, 6, -3.53, 0.07, 0, palette.white);
      const win = group(parent);
      win.position.set(-3.53, 2, -0.4);
      box(win, 0.05, 1.85, 2.5, 0, 0, 0, palette.glass);
      for (const z of [-1.3, 0, 1.3]) box(win, 0.1, 2, 0.08, 0.06, 0, z, palette.white);
      for (const y of [-1, 1]) box(win, 0.13, 0.09, 2.7, 0.06, y, 0, palette.white);
      box(win, 0.38, 0.1, 2.9, 0.12, -1.04, 0, palette.white);
      for (let i = 0; i < 5; i++) {
        box(parent, 0.75, 0.006, 1.4, -2 + i * 0.82, 0.025, -0.2 + i * 0.3, mat(0xd9cc9b));
      }
      return win;
    }

    roomShell(room);

    // Furnishings
    const furnishings: Array<{
      g: THREE.Group;
      home: THREE.Vector3;
      offset: THREE.Vector3;
      rotation: number;
    }> = [];

    function furnishing(x: number, y: number, z: number, fn: (g: THREE.Group) => void) {
      const g = group(room);
      g.position.set(x, y, z);
      fn(g);
      furnishings.push({
        g,
        home: new THREE.Vector3(x, y, z),
        offset: new THREE.Vector3((rand() - 0.5) * 17, 4 + rand() * 7, (rand() - 0.5) * 14),
        rotation: (rand() - 0.5) * 3
      });
      return g;
    }

    // Bed
    furnishing(1.8, 0, -1.4, (g) => {
      box(g, 2.6, 0.42, 3.4, 0, 0.35, 0, palette.wood);
      box(g, 2.55, 0.35, 3.3, 0, 0.73, 0, palette.white);
      box(g, 2.58, 0.15, 2.2, 0, 0.97, 0.53, palette.green);
      box(g, 2.65, 1.5, 0.15, 0, 0.8, -1.66, palette.wood);
      for (const x of [-0.66, 0.66]) {
        const p = box(g, 1.05, 0.23, 0.62, x, 1, -1.06, palette.cream);
        p.rotation.y = x * 0.12;
      }
      for (let i = 0; i < 8; i++) {
        box(g, 0.018, 0.02, 2.1, -1.12 + i * 0.32, 1.052, 0.57, palette.lime);
      }
    });

    // Desk
    furnishing(-2.25, 0, -1.45, (g) => {
      box(g, 1.65, 0.13, 1.1, 0, 1.35, 0, palette.wood);
      for (const x of [-0.68, 0.68]) {
        for (const z of [-0.42, 0.42]) {
          box(g, 0.085, 1.3, 0.085, x, 0.65, z, palette.dark);
        }
      }
      box(g, 0.62, 0.035, 0.42, 0, 1.44, 0.1, palette.grey);
      const laptop = box(g, 0.62, 0.42, 0.035, 0, 1.65, -0.1, palette.dark);
      laptop.rotation.x = -0.2;
      box(g, 0.55, 0.32, 0.015, 0, 1.66, -0.067, palette.glass);
      cylinder(g, 0.13, 0.13, 0.17, 0.57, 1.5, 0.2, palette.white);
    });

    // Chair
    furnishing(-2.1, 0, 0.05, (g) => {
      box(g, 0.78, 0.15, 0.75, 0, 0.8, 0, palette.green);
      box(g, 0.78, 0.72, 0.12, 0, 1.18, 0.33, palette.green);
      for (const x of [-0.3, 0.3]) {
        for (const z of [-0.26, 0.26]) {
          box(g, 0.07, 0.75, 0.07, x, 0.38, z, palette.wood);
        }
      }
    });

    // Rug
    furnishing(0.1, 0.04, 1.35, (g) => {
      box(g, 4.4, 0.035, 1.75, 0, 0, 0, palette.cream);
      for (let i = 0; i < 12; i++) {
        box(g, 0.022, 0.008, 1.7, -2 + i * 0.36, 0.022, 0, palette.green);
      }
    });

    // Plant
    furnishing(2.7, 0, 2, (g) => {
      cylinder(g, 0.39, 0.29, 0.63, 0, 0.32, 0, palette.clay);
      for (let i = 0; i < 7; i++) {
        const a = i * 2.4;
        const leaf = sphere(
          g,
          0.28,
          Math.cos(a) * 0.3,
          0.85 + (i % 3) * 0.24,
          Math.sin(a) * 0.3,
          palette.green
        );
        leaf.scale.set(0.5, 1.9, 0.75);
      }
    });

    // Lamp
    furnishing(0.1, 0, -2.65, (g) => {
      box(g, 0.85, 0.72, 0.65, 0, 0.36, 0, palette.wood);
      cylinder(g, 0.035, 0.035, 0.67, 0, 1.08, 0, palette.dark);
      cylinder(g, 0.23, 0.37, 0.4, 0, 1.55, 0, palette.lime);
    });

    // Picture frame
    const picture = group(room);
    box(picture, 1.3, 1.05, 0.08, 0.1, 2.45, -2.95, palette.wood);
    box(picture, 1.15, 0.9, 0.02, 0.1, 2.45, -2.9, palette.white);
    const art = sphere(picture, 0.3, 0.12, 2.46, -2.87, palette.green);
    art.scale.z = 0.05;

    // Canvas textures
    function texture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');
      if (ctx) draw(ctx, w, h);
      const tx = new THREE.CanvasTexture(c);
      tx.colorSpace = THREE.SRGBColorSpace;
      return tx;
    }

    function write(
      ctx: CanvasRenderingContext2D,
      s: string,
      x: number,
      y: number,
      size = 28,
      color = '#263c2c',
      weight = 500
    ) {
      ctx.fillStyle = color;
      ctx.font = `${weight} ${size}px "Be Vietnam Pro", "Segoe UI", Arial, sans-serif`;
      ctx.fillText(s, x, y);
    }

    // Preload logo image
    const logoImg = new Image();
    logoImg.src = logoImgUrl;
    
    // Store textures to be created after logo loads
    let receiptTex: THREE.CanvasTexture;
    let phoneTex: THREE.CanvasTexture;
    let downloadTex: THREE.CanvasTexture;
    
    function drawLogo(ctx: CanvasRenderingContext2D, x: number, y: number, targetHeight: number) {
      // Maintain aspect ratio based on logo's natural dimensions
      const aspectRatio = logoImg.naturalWidth / logoImg.naturalHeight;
      const width = targetHeight * aspectRatio;
      ctx.drawImage(logoImg, x, y, width, targetHeight);
    }

    // Create textures after logo loads
    function createTextures() {
      // Receipt texture
      receiptTex = texture(900, 1200, (c, w, h) => {
        c.fillStyle = '#fffef8';
        c.fillRect(0, 0, w, h);
        drawLogo(c, 68, 80, 65); // x, y, height (50 + 30% = 65)
        write(c, 'HÓA ĐƠN THUÊ NHÀ', 68, 224, 42, '#17352a', 800);
        write(c, 'PHÒNG 203 · THÁNG 09', 68, 286, 29, '#53665a', 700);
        c.fillStyle = '#a8b7a5';
        c.fillRect(68, 326, 764, 4);
        [
          ['Tiền phòng', '3.000.000 đ'],
          ['Tiền điện', '180.000 đ'],
          ['Tiền nước', '70.000 đ']
        ].forEach(([a, b], i) => {
          write(c, a, 68, 426 + i * 105, 38, '#213b2d', 650);
          write(c, b, 535, 426 + i * 105, 38, '#173f2d', 750);
        });
        c.fillStyle = '#a8b7a5';
        c.fillRect(68, 700, 764, 4);
        write(c, 'TỔNG CỘNG', 68, 765, 31, '#3c5243', 700);
        write(c, '3.250.000 đ', 68, 842, 66, '#173f2d', 800);
        write(c, 'Minh họa trải nghiệm Trọ Ơi', 68, 1120, 28, '#617065', 650);
      });
      receiptTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

      // Phone texture
      phoneTex = texture(600, 1100, (c, w, h) => {
        c.fillStyle = '#f5f8ef';
        c.fillRect(0, 0, w, h);
        write(c, '9:41', 42, 56, 23, '#314b3c', 650);
        drawLogo(c, 42, 110, 33); // x, y, height (width auto)
        write(c, 'Chào bạn, về nhà thôi.', 45, 210, 29, '#263f31', 650);
        c.fillStyle = '#cce5a5';
        c.beginPath();
        c.roundRect(35, 265, 530, 258, 26);
        c.fill();
        write(c, 'GÓC RIÊNG CỦA BẠN', 62, 312, 20, '#35563e', 750);
        write(c, 'Phòng 203', 62, 378, 46, '#173f2d', 800);
        write(c, 'Một nơi ở. Cả một khởi đầu.', 62, 428, 23, '#304d3a', 600);
        write(c, 'ĐANG THUÊ', 62, 479, 22, '#466f32', 800);
        write(c, 'Tháng này nhẹ lòng rồi.', 45, 588, 30, '#173f2d', 750);
        c.fillStyle = '#fff';
        c.beginPath();
        c.roundRect(35, 628, 530, 172, 22);
        c.fill();
        c.strokeStyle = '#b6c9b1';
        c.lineWidth = 2;
        c.stroke();
        write(c, 'Hóa đơn tháng 09', 62, 676, 26, '#263f31', 650);
        write(c, '3.250.000 đ', 62, 728, 38, '#173f2d', 800);
        write(c, '✓ Đã thanh toán', 62, 771, 23, '#4d772f', 750);
        c.fillStyle = '#cce5a5';
        c.beginPath();
        c.roundRect(35, 835, 530, 115, 22);
        c.fill();
        write(c, '💬 Tin nhắn mới', 62, 875, 22, '#35563e', 750);
        write(c, '"Cảm ơn bạn. Đã nhận được."', 62, 924, 26, '#173f2d', 700);
      });
      phoneTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

      // Download texture
      downloadTex = texture(600, 1100, (c, w, h) => {
        c.fillStyle = '#eef3e9';
        c.fillRect(0, 0, w, h);
        write(c, '9:41', 42, 56, 23);
        drawLogo(c, 64, 200, 98); // x, y, height (70 + 40% = 98)
        write(c, 'Tìm được trọ.', 64, 348, 40, '#173f2d', 700);
        write(c, 'Chạm được nhà.', 64, 401, 40, '#6b9637', 700);
        write(c, 'Hẹn gặp bạn trên', 64, 530, 28, '#64735c');
        for (const [name, y] of [
          ['Google Play', 585],
          ['App Store', 758]
        ] as [string, number][]) {
          c.fillStyle = '#233d2c';
          c.beginPath();
          c.roundRect(53, y as number, 494, 137, 22);
          c.fill();
          write(c, 'SẮP RA MẮT TRÊN', 83, (y as number) + 40, 19, '#d6edb6');
          write(c, name, 83, (y as number) + 95, 43, '#ffffff', 600);
        }
        write(c, 'Một ứng dụng. Cả hành trình.', 64, 998, 25, '#64735c');
      });
    }

    // Wait for logo to load before creating textures
    logoImg.onload = () => {
      createTextures();
      
      // Update receipt material
      const paperMesh = receipt.children.find(c => c instanceof THREE.Mesh && c.material instanceof THREE.MeshBasicMaterial);
      if (paperMesh instanceof THREE.Mesh && paperMesh.material instanceof THREE.MeshBasicMaterial) {
        paperMesh.material.map = receiptTex;
        paperMesh.material.needsUpdate = true;
      }
      
      // Update phone material
      const phoneScreen = phone.children.find(c => c instanceof THREE.Mesh && c.material instanceof THREE.MeshBasicMaterial);
      if (phoneScreen instanceof THREE.Mesh && phoneScreen.material instanceof THREE.MeshBasicMaterial) {
        phoneScreen.material.map = phoneTex;
        phoneScreen.material.needsUpdate = true;
      }
      
      // Update endPhone material
      const endPhoneScreen = endPhone.children.find(c => c instanceof THREE.Mesh && c.material instanceof THREE.MeshBasicMaterial);
      if (endPhoneScreen instanceof THREE.Mesh && endPhoneScreen.material instanceof THREE.MeshBasicMaterial) {
        endPhoneScreen.material.map = downloadTex;
        endPhoneScreen.material.needsUpdate = true;
      }
    };

    // Create placeholder textures initially (will be replaced after logo loads)
    receiptTex = texture(900, 1200, (c, w, h) => {
      c.fillStyle = '#fffef8';
      c.fillRect(0, 0, w, h);
      // Logo will be added after image loads
      write(c, 'HÓA ĐƠN THUÊ NHÀ', 68, 224, 42, '#17352a', 800);
      write(c, 'PHÒNG 203 · THÁNG 09', 68, 286, 29, '#53665a', 700);
      c.fillStyle = '#a8b7a5';
      c.fillRect(68, 326, 764, 4);
      [
        ['Tiền phòng', '3.000.000 đ'],
        ['Tiền điện', '180.000 đ'],
        ['Tiền nước', '70.000 đ']
      ].forEach(([a, b], i) => {
        write(c, a, 68, 426 + i * 105, 38, '#213b2d', 650);
        write(c, b, 535, 426 + i * 105, 38, '#173f2d', 750);
      });
      c.fillStyle = '#a8b7a5';
      c.fillRect(68, 700, 764, 4);
      write(c, 'TỔNG CỘNG', 68, 765, 31, '#3c5243', 700);
      write(c, '3.250.000 đ', 68, 842, 66, '#173f2d', 800);
      write(c, 'Minh họa trải nghiệm Trọ Ơi', 68, 1120, 28, '#617065', 650);
    });
    receiptTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Receipt and stamp
    const receipt = group(transaction);
    const paperBorder = new THREE.Mesh(
      new THREE.PlaneGeometry(3.34, 4.39),
      new THREE.MeshStandardMaterial({ color: 0x214b37, roughness: 0.65, side: THREE.DoubleSide })
    );
    paperBorder.position.z = -0.035;
    paperBorder.castShadow = true;
    receipt.add(paperBorder);

    const paper = new THREE.Mesh(
      new THREE.PlaneGeometry(3.15, 4.2),
      new THREE.MeshBasicMaterial({ map: receiptTex, side: THREE.DoubleSide, toneMapped: false })
    );
    paper.castShadow = true;
    receipt.add(paper);

    const stamp = group(receipt);
    const stampBody = group(stamp);
    box(stampBody, 2.38, 0.18, 0.86, 0, 0, 0, palette.dark);
    cylinder(stampBody, 0.21, 0.25, 0.57, 0, 0.36, 0, palette.wood);
    sphere(stampBody, 0.29, 0, 0.72, 0, palette.wood);
    stampBody.rotation.x = Math.PI / 2;

    const sealTex = texture(500, 200, (c) => {
      c.strokeStyle = '#3f7651';
      c.lineWidth = 7;
      c.strokeRect(12, 12, 476, 176);
      write(c, 'ĐÃ THANH TOÁN', 32, 94, 40, '#3f7651', 700);
      write(c, 'TRỌ ƠI · MINH HỌA', 90, 149, 24, '#3f7651', 600);
    });
    const seal = new THREE.Mesh(
      new THREE.PlaneGeometry(2.38, 0.86),
      new THREE.MeshBasicMaterial({ map: sealTex, transparent: true, depthWrite: false })
    );
    seal.position.set(0, -1.28, 0.015);
    seal.rotation.z = -0.06;
    receipt.add(seal);

    // Phone texture
    phoneTex = texture(600, 1100, (c, w, h) => {
      c.fillStyle = '#f5f8ef';
      c.fillRect(0, 0, w, h);
      write(c, '9:41', 42, 56, 23, '#314b3c', 650);
      // Logo will be added after image loads
      write(c, 'Chào bạn, về nhà thôi.', 45, 210, 29, '#263f31', 650);
      c.fillStyle = '#cce5a5';
      c.beginPath();
      c.roundRect(35, 265, 530, 258, 26);
      c.fill();
      write(c, 'GÓC RIÊNG CỦA BẠN', 62, 312, 20, '#35563e', 750);
      write(c, 'Phòng 203', 62, 378, 46, '#173f2d', 800);
      write(c, 'Một nơi ở. Cả một khởi đầu.', 62, 428, 23, '#304d3a', 600);
      write(c, 'ĐANG THUÊ', 62, 479, 22, '#466f32', 800);
      write(c, 'Tháng này nhẹ lòng rồi.', 45, 588, 30, '#173f2d', 750);
      c.fillStyle = '#fff';
      c.beginPath();
      c.roundRect(35, 628, 530, 172, 22);
      c.fill();
      c.strokeStyle = '#b6c9b1';
      c.lineWidth = 2;
      c.stroke();
      write(c, 'Hóa đơn tháng 09', 62, 676, 26, '#263f31', 650);
      write(c, '3.250.000 đ', 62, 728, 38, '#173f2d', 800);
      write(c, '✓ Đã thanh toán', 62, 771, 23, '#4d772f', 750);
      c.fillStyle = '#183d2c';
      c.beginPath();
      c.roundRect(35, 843, 530, 83, 40);
      c.fill();
      write(c, 'Báo sự cố / Yêu cầu hỗ trợ', 76, 895, 27, '#e8f7d6', 700);
      write(c, 'Trang chủ       Phòng của tôi       Cá nhân', 42, 1027, 21, '#425a49', 650);
    });
    phoneTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Phone with rounded ExtrudeGeometry
    function makePhone(parent: THREE.Object3D, display: THREE.Texture) {
      const p = group(parent);
      const w = 2.74;
      const h = 4.85;
      const r = 0.24;
      const shape = new THREE.Shape();
      shape.moveTo(-w / 2 + r, -h / 2);
      shape.lineTo(w / 2 - r, -h / 2);
      shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
      shape.lineTo(w / 2, h / 2 - r);
      shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
      shape.lineTo(-w / 2 + r, h / 2);
      shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
      shape.lineTo(-w / 2, -h / 2 + r);
      shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
      const shellGeo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.28,
        bevelEnabled: false,
        curveSegments: 12
      });
      shellGeo.translate(0, 0, -0.14);
      const shell = new THREE.Mesh(shellGeo, palette.dark);
      shell.castShadow = true;
      p.add(shell);
      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(2.43, 4.47),
        new THREE.MeshBasicMaterial({ map: display })
      );
      screen.position.z = 0.153;
      p.add(screen);
      box(p, 0.65, 0.1, 0.025, 0, 2.13, 0.17, palette.black);
      box(p, 0.6, 0.045, 0.025, 0, -2.11, 0.17, palette.white);
      return p;
    }

    const phone = makePhone(transaction, phoneTex);

    // Articulated person rig
    function capsule(
      parent: THREE.Object3D,
      radius: number,
      length: number,
      x: number,
      y: number,
      z: number,
      material: THREE.Material
    ) {
      const mesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(radius, Math.max(0.01, length - 2 * radius), 5, 12),
        material
      );
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      parent.add(mesh);
      return mesh;
    }

    interface PersonRig {
      g: THREE.Group;
      legs: THREE.Group[];
      knees: THREE.Group[];
      arms: THREE.Group[];
      elbows: THREE.Group[];
    }

    function person(parent: THREE.Object3D, shirt: THREE.Material): PersonRig {
      const g = group(parent);
      const torso = capsule(g, 0.32, 1.02, 0, 1.65, 0, shirt);
      torso.scale.z = 0.68;
      cylinder(g, 0.1, 0.12, 0.19, 0, 2.21, 0, palette.skin);
      sphere(g, 0.285, 0, 2.47, 0, palette.skin);
      const hair = sphere(g, 0.29, 0, 2.59, -0.015, palette.dark);
      hair.scale.y = 0.6;
      sphere(g, 0.065, 0, 2.45, 0.276, palette.skin);
      for (const x of [-0.095, 0.095]) {
        sphere(g, 0.018, x, 2.51, 0.267, palette.dark);
      }

      const legs: THREE.Group[] = [];
      const knees: THREE.Group[] = [];
      const arms: THREE.Group[] = [];
      const elbows: THREE.Group[] = [];

      for (const side of [-1, 1]) {
        const leg = group(g);
        leg.position.set(side * 0.18, 1.22, 0);
        capsule(leg, 0.12, 0.54, 0, -0.24, 0, palette.dark);
        const knee = group(leg);
        knee.position.y = -0.49;
        sphere(leg, 0.115, 0, -0.49, 0, palette.dark);
        capsule(knee, 0.105, 0.55, 0, -0.25, 0, palette.dark);
        box(knee, 0.23, 0.13, 0.37, 0, -0.52, 0.065, palette.cream);
        legs.push(leg);
        knees.push(knee);

        const arm = group(g);
        arm.position.set(side * 0.36, 2.02, 0);
        sphere(arm, 0.135, 0, 0, 0, shirt);
        capsule(arm, 0.115, 0.44, 0, -0.2, 0, shirt);
        const elbow = group(arm);
        elbow.position.y = -0.4;
        sphere(arm, 0.096, 0, -0.4, 0, palette.skin);
        capsule(elbow, 0.085, 0.38, 0, -0.17, 0, palette.skin);
        sphere(elbow, 0.093, 0, -0.39, 0, palette.skin);
        arms.push(arm);
        elbows.push(elbow);
      }

      return { g, legs, knees, arms, elbows };
    }

    // Care scene - AC repair
    roomShell(care);
    const ac = group(care);
    ac.position.set(0.8, 2.9, -2.88);
    box(ac, 2.45, 0.72, 0.43, 0, 0, 0, palette.white);
    box(ac, 2.2, 0.16, 0.07, 0, -0.2, 0.25, palette.dark);
    for (let i = 0; i < 4; i++) {
      box(ac, 2.18, 0.016, 0.08, 0, -0.24 + i * 0.037, 0.3, palette.cream);
    }
    sphere(ac, 0.025, 0.92, 0.13, 0.24, palette.green);

    // Ladder
    const ladder = group(care);
    ladder.position.set(0.85, 0, -1.7);
    for (const x of [-0.52, 0.52]) {
      const rail = box(ladder, 0.08, 2.65, 0.09, x, 1.29, 0, palette.wood);
      rail.rotation.x = -0.1;
      const back = box(ladder, 0.08, 2.65, 0.09, x, 1.29, -0.77, palette.wood);
      back.rotation.x = 0.4;
    }
    for (let y = 0.25; y < 2.6; y += 0.4) {
      box(ladder, 1.12, 0.08, 0.14, 0, y, 0.14 - y * 0.1, palette.cream);
    }

    // Worker
    const worker = person(care, palette.blue);
    worker.g.scale.setScalar(0.82);
    cylinder(worker.g, 0.33, 0.33, 0.1, 0, 2.67, 0, palette.lime);
    box(care, 0.85, 0.48, 0.58, 2.1, 0.25, 0.3, palette.dark);
    box(care, 0.38, 0.1, 0.12, 2.1, 0.55, 0.3, palette.grey);

    // Air flow lines
    const air: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const line = box(care, 0.023, 0.023, 0.8, -0.1 + i * 0.43, 2.6, -2.2, palette.glass);
      air.push(line);
    }

    // Download texture for end scene
    downloadTex = texture(600, 1100, (c, w, h) => {
      c.fillStyle = '#eef3e9';
      c.fillRect(0, 0, w, h);
      write(c, '9:41', 42, 56, 23);
      // Logo will be added after image loads
      write(c, 'Tìm được trọ.', 64, 348, 40, '#173f2d', 700);
      write(c, 'Chạm được nhà.', 64, 401, 40, '#6b9637', 700);
      write(c, 'Hẹn gặp bạn trên', 64, 530, 28, '#64735c');
      for (const [name, y] of [
        ['Google Play', 585],
        ['App Store', 758]
      ] as [string, number][]) {
        c.fillStyle = '#233d2c';
        c.beginPath();
        c.roundRect(53, y as number, 494, 137, 22);
        c.fill();
        write(c, 'SẮP RA MẮT TRÊN', 83, (y as number) + 40, 19, '#d6edb6');
        write(c, name, 83, (y as number) + 95, 43, '#ffffff', 600);
      }
      write(c, 'Một ứng dụng. Cả hành trình.', 64, 998, 25, '#64735c');
    });

    const endPhone = makePhone(end, downloadTex);
    endPhone.position.y = 2.4;

    // Halo rings
    const halo = new THREE.Mesh(new THREE.TorusGeometry(3.65, 0.015, 8, 100), palette.green);
    halo.position.set(0, 2.4, -0.4);
    end.add(halo);
    const halo2 = halo.clone();
    halo2.scale.setScalar(1.18);
    halo2.rotation.y = 0.3;
    end.add(halo2);

    // Resize handler
    function resize() {
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      getScroll();
    }
    window.addEventListener('resize', resize);
    resize();

    // Animation loop
    let time = 0;
    let last = performance.now();
    const look = new THREE.Vector3();
    const camGoal = new THREE.Vector3();

    function render(now: number) {
      const rafId = requestAnimationFrame(render);
      if (document.hidden) {
        last = now;
        return;
      }

      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!paused) time += dt;

      position = paused ? target : lerp(position, target, 1 - Math.exp(-dt * 7));
      const p = position;

      const state = sceneState(p);
      city.visible = state.city && window.scrollY < chapters[1].offsetTop * 1.16;
      room.visible = state.room && document.body.dataset.branch === 'tenant' && window.scrollY >= chapters[1].offsetTop * 1.7;
      transaction.visible = state.transaction && document.body.dataset.branch === 'tenant';
      care.visible = state.care && document.body.dataset.branch === 'tenant';
      end.visible = state.end;

      const t = paused ? 0 : time;

      // City animations
      if (city.visible) {
        // Terrain wave
        for (let i = 0; i < terrainPosition.count; i++) {
          const x = terrainPosition.getX(i);
          const z = terrainPosition.getZ(i);
          terrainPosition.setY(i, wave(x, z, t));
        }
        terrainPosition.needsUpdate = true;
        terrainGeo.computeVertexNormals();

        // Grid wave
        const gp = gridGeo.attributes.position;
        for (let i = 0; i < gp.count; i++) {
          gp.setY(i, wave(gp.getX(i), gp.getZ(i), t) + 0.016);
        }
        gp.needsUpdate = true;

        // Roads wave
        roads.forEach((r) => {
          const a = r.geometry.attributes.position;
          for (let i = 0; i < a.count; i++) {
            a.setY(i, wave(a.getX(i), a.getZ(i), t) + 0.026);
          }
          a.needsUpdate = true;
        });

        // Buildings grow animation
        buildings.forEach(({ b, x, z, phase, speed }) => {
          const v = paused ? 0.85 : smooth((Math.sin(t * speed + phase) + 0.5) / 1.1);
          b.scale.y = Math.max(0.001, v);
          b.scale.x = b.scale.z = 0.85 + 0.15 * v;
          b.position.y = wave(x, z, t) - 0.2 * (1 - v);
        });

        // Trees wave
        trees.forEach(({ g, x, z }) => {
          g.position.y = wave(x, z, t);
        });

        // Locator pulse
        locator.position.y = wave(1, 2, t) + 0.12;
        locator.scale.setScalar(1 + Math.sin(t * 2) * 0.08);

        // City zoom out
        const c = smooth((p - 0.56) / 0.58);
        city.scale.setScalar(lerp(1, 3.6, c));
        city.position.y = lerp(-0.7, -19, c);
        city.rotation.y = -0.15 + t * 0.015 * (1 - c);
      }

      // Room animations
      const roomIn = smooth((p - 0.72) / 0.42);
      const roomOut = smooth((p - 1.76) / 0.34);
      room.scale.setScalar(lerp(0.05, 1, roomIn) * (1 - roomOut * 0.22));
      room.position.set(0, lerp(-3, 0, roomIn) - roomOut * 15, -roomOut * 15);
      room.rotation.y = lerp(-0.25, 0.04, roomIn);

      // Furnishings fly in
      furnishings.forEach(({ g, home, offset, rotation }, i) => {
        const a = smooth((p - 0.87 - i * 0.025) / 0.43);
        g.position.copy(home).addScaledVector(offset, 1 - a);
        g.rotation.set(rotation * (1 - a), rotation * (1 - a), rotation * 0.4 * (1 - a));
      });

      // Transaction scene - receipt and stamp
      const receiptIn = smooth((p - 1.74) / 0.35);
      const stampDown = smooth((p - 2.1) / 0.14);
      const stampUp = smooth((p - 2.3) / 0.15);
      const intoPhone = smooth((p - 2.66) / 0.23);

      transaction.position.set(0, 0, 0);
      receipt.position.set(
        lerp(-7, 0.1, receiptIn) + intoPhone * 2,
        lerp(4, 2.75, receiptIn) - intoPhone * 0.25,
        lerp(-5, 2.6, receiptIn) - intoPhone * 2
      );
      receipt.rotation.set(
        lerp(0.8, -0.04, receiptIn),
        lerp(1.2, 0.35, receiptIn),
        lerp(-1, 0.07, receiptIn) + intoPhone * 0.8
      );
      receipt.scale.setScalar((0.82 + 0.34 * receiptIn) * (1 - intoPhone * 0.98));
      receipt.visible = intoPhone < 0.99;
      seal.visible = stampDown > 0.98;
      stamp.visible = p > 2.05 && p < 2.48;
      stamp.position.set(
        seal.position.x,
        seal.position.y,
        seal.position.z + 0.09 + lerp(4, 0, stampDown) + stampUp * 4
      );
      stamp.rotation.set(0, 0, seal.rotation.z);

      phone.position.set(lerp(4, 1.05, intoPhone), 2.5, 0);
      phone.rotation.set(-0.06, 0.34, -0.05);
      phone.scale.setScalar(0.94);
      transaction.scale.setScalar(1 - smooth((p - 2.92) / 0.17));

      // Care scene - technician animation
      const serviceEntry = smooth((p - 3.02) / 0.2);
      const ladderPlace = smooth((p - 3.2) / 0.18);
      const climb = smooth((p - 3.38) / 0.2);
      const repair = smooth((p - 3.58) / 0.12);

      care.scale.setScalar(lerp(0.9, 1, smooth((p - 3.02) / 0.22)));
      care.position.y = -(1 - smooth((p - 3.02) / 0.22)) * 1.7 - smooth((p - 3.74) / 0.24) * 17;
      care.rotation.y = 0.05;

      // Walk in with ladder
      const entryX = lerp(5.7, 1.75, serviceEntry);
      const entryZ = lerp(-0.55, -1.02, serviceEntry);
      const carryBob = Math.sin(serviceEntry * Math.PI * 8) * (1 - ladderPlace);

      worker.g.position.set(
        lerp(entryX, 0.98, ladderPlace),
        -0.14 + Math.abs(carryBob) * 0.035,
        lerp(entryZ, -1.08, ladderPlace)
      );
      worker.g.rotation.y = lerp(-Math.PI / 2, -Math.PI, ladderPlace);

      ladder.position.set(
        lerp(entryX - 0.72, 0.85, ladderPlace),
        lerp(0.54, 0, ladderPlace),
        lerp(entryZ - 0.18, -1.7, ladderPlace)
      );
      ladder.rotation.z = lerp(-0.22, 0, ladderPlace);
      ladder.rotation.y = lerp(-0.12, 0, ladderPlace);

      // Walking gait
      const walkStep = Math.sin(serviceEntry * Math.PI * 8) * (1 - ladderPlace);
      worker.legs[0].rotation.x = walkStep * 0.46;
      worker.legs[1].rotation.x = -walkStep * 0.46;
      worker.knees[0].rotation.x = Math.max(0, -walkStep) * 0.58;
      worker.knees[1].rotation.x = Math.max(0, walkStep) * 0.58;
      worker.arms[0].rotation.x = lerp(-0.55, -0.25, ladderPlace);
      worker.arms[1].rotation.x = lerp(-0.9, -0.3, ladderPlace);
      worker.elbows[0].rotation.x = lerp(-0.75, -0.15, ladderPlace);
      worker.elbows[1].rotation.x = lerp(-0.65, -0.18, ladderPlace);

      // Climb ladder
      const climbWave = Math.sin(climb * Math.PI * 4) * (1 - repair);
      worker.g.position.x = lerp(worker.g.position.x, 0.8, climb);
      worker.g.position.z = lerp(worker.g.position.z, -1.3, climb);
      worker.g.position.y = lerp(worker.g.position.y, 0.62, climb) + Math.abs(climbWave) * 0.025;
      worker.legs[0].rotation.x = lerp(worker.legs[0].rotation.x, climbWave * 0.34, climb);
      worker.legs[1].rotation.x = lerp(worker.legs[1].rotation.x, -climbWave * 0.34, climb);
      worker.knees[0].rotation.x = lerp(worker.knees[0].rotation.x, Math.max(0, -climbWave) * 0.52, climb);
      worker.knees[1].rotation.x = lerp(worker.knees[1].rotation.x, Math.max(0, climbWave) * 0.52, climb);

      // Reach AC
      const reach = smooth(climb);
      worker.arms[0].rotation.x = lerp(worker.arms[0].rotation.x, -2.05, reach);
      worker.arms[1].rotation.x = lerp(worker.arms[1].rotation.x, -1.72, reach);
      worker.elbows[0].rotation.x = lerp(worker.elbows[0].rotation.x, -0.48, reach);
      worker.elbows[1].rotation.x = lerp(worker.elbows[1].rotation.x, -0.72, reach);

      // Repair hand movements
      worker.arms[0].rotation.z = Math.sin(t * 5.4) * 0.06 * repair;
      worker.arms[1].rotation.z = -Math.sin(t * 4.8) * 0.05 * repair;
      worker.elbows[0].rotation.x += Math.sin(t * 5.8) * 0.09 * repair;
      worker.elbows[1].rotation.x += Math.cos(t * 5.1) * 0.08 * repair;

      // Air flow
      air.forEach((a, i) => {
        a.visible = repair > 0.35;
        a.position.z = -2 + ((t * 0.7 + i * 0.13) % 1) * 1.5;
        a.scale.z = 0.4 + Math.sin(t + i) * 0.2;
      });

      // End scene
      end.scale.setScalar(smooth((p - 3.9) / 0.26));
      endPhone.scale.setScalar(1.5);
      endPhone.rotation.set(-0.025, 0.12 + Math.sin(t * 0.4) * 0.025, -0.025);
      endPhone.position.y = 2.45 + Math.sin(t * 0.9) * 0.045;
      halo.rotation.z = t * 0.04;
      halo2.rotation.z = -t * 0.03;

      // Camera movement
      const zoom = smooth(p / 0.95);
      camGoal.set(lerp(18, 11, zoom), lerp(17, 9, zoom), lerp(24, 16, zoom));
      const front = smooth((p - 1.7) / 0.45) * (1 - smooth((p - 2.85) / 0.3));
      const finish = smooth((p - 3.85) / 0.32);
      camGoal.lerp(new THREE.Vector3(6, 6, 17), front);
      camGoal.lerp(new THREE.Vector3(3.5, 4.2, 15.5), finish);
      camera.position.copy(camGoal);
      look.set(0, lerp(lerp(0, 1.4, zoom), 2.45, finish), 0);
      camera.lookAt(look);

      renderer.render(scene, camera);
    }

    const rafId = requestAnimationFrame(render);

    // Scroll handler
    window.addEventListener('scroll', getScroll, { passive: true });
    getScroll();

    // Context lost handler
    renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      const error = document.querySelector('#load-error') as HTMLElement;
      if (error) error.hidden = false;
    });

    // Cleanup
    cleanupRef.current = () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', getScroll);
      window.removeEventListener('wheel', releaseAppLanding);
      window.removeEventListener('touchstart', releaseAppLanding);
      window.removeEventListener('trooi:branch-change', handleBranchChange);
      document.removeEventListener('trooi:theme-change', syncRendererTheme);
      
      // Proper disposal
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(mat => mat.dispose());
            } else {
              obj.material.dispose();
            }
          }
        }
      });
      
      renderer.dispose();
      renderer.forceContextLoss();
      
      if (host.contains(renderer.domElement)) {
        host.removeChild(renderer.domElement);
      }
    };

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  return <div ref={hostRef} id="stage" aria-hidden="true" />;
}
