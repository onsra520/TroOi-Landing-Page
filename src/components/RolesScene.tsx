import { useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';
import * as THREE from 'three';
import { smooth, easeOutBack, lerp } from '../utils/math';

export default function RolesScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!mountRef.current) return;

    const host = mountRef.current;
    const chapter = document.getElementById('roles');
    if (!host || !chapter) return;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    host.appendChild(renderer.domElement);
    renderer.domElement.style.visibility = 'hidden';

    const scene = new THREE.Scene();
    renderer.setClearColor(0x000000, 0);

    const camera = new THREE.OrthographicCamera(-5.8, 5.8, 2, -2, 0.1, 80);
    camera.position.set(8.5, 8, 12);
    camera.lookAt(0, 1.02, 0);

    // Lighting
    scene.add(new THREE.HemisphereLight(0xffffff, 0xc8d8b6, 3));
    const sun = new THREE.DirectionalLight(0xfff5df, 3.5);
    sun.position.set(-4, 9, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, {
      left: -8, right: 8, top: 8, bottom: -8, near: 0.5, far: 25
    });
    sun.shadow.normalBias = 0.035;
    scene.add(sun);

    const palette = {
      platform: 0xdce8ca,
      platformTop: 0xf2f1e6,
      grass: 0xc1d8a3,
      table: 0xe6d7bd,
      tableLeg: 0xbaa88e,
      paper: 0xfffdf5,
      landlordCoat: 0xd9c2a0,
      tenantCoat: 0xa8c887,
      landlordPants: 0x556a59,
      tenantPants: 0xb6ad94,
      hairDark: 0x314238,
      hairBrown: 0x685240,
      skin: 0xf0c6a1,
      shoes: 0x344c3c,
      ink: 0x416b45,
      light: 0xf8f7ec
    };

    const material = (color: number, opts = {}) =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.83,
        flatShading: true,
        ...opts
      });

    function add(
      parent: THREE.Group | THREE.Scene,
      geometry: THREE.BufferGeometry,
      mat: THREE.Material,
      x = 0,
      y = 0,
      z = 0
    ) {
      const item = new THREE.Mesh(geometry, mat);
      item.position.set(x, y, z);
      item.castShadow = true;
      item.receiveShadow = true;
      parent.add(item);
      return item;
    }

    function box(
      parent: THREE.Group | THREE.Scene,
      w: number, h: number, d: number,
      x: number, y: number, z: number,
      mat: THREE.Material
    ) {
      return add(parent, new THREE.BoxGeometry(w, h, d), mat, x, y, z);
    }

    function ball(
      parent: THREE.Group | THREE.Scene,
      r: number,
      x: number, y: number, z: number,
      mat: THREE.Material,
      sx = 1, sy = 1, sz = 1
    ) {
      const item = add(parent, new THREE.SphereGeometry(r, 18, 12), mat, x, y, z);
      item.scale.set(sx, sy, sz);
      return item;
    }

    // Plinth
    const plinth = add(
      scene,
      new THREE.CylinderGeometry(4.75, 4.75, 0.18, 64),
      material(palette.platform),
      0, -0.13, 0
    );
    plinth.scale.z = 0.58;

    const plinthTop = add(
      scene,
      new THREE.CylinderGeometry(4.62, 4.62, 0.028, 64),
      material(palette.platformTop),
      0, -0.024, 0
    );
    plinthTop.scale.z = 0.58;

    const centerTile = add(
      scene,
      new THREE.CylinderGeometry(1.78, 1.78, 0.025, 40),
      material(palette.grass),
      0, 0.002, 0
    );
    centerTile.scale.z = 0.77;

    // Table
    const table = new THREE.Group();
    scene.add(table);
    const wood = material(palette.table);
    const legWood = material(palette.tableLeg);
    box(table, 2.55, 0.15, 1.55, 0, 0.94, 0, wood);
    for (const x of [-1.06, 1.06]) {
      for (const z of [-0.56, 0.56]) {
        box(table, 0.14, 0.86, 0.14, x, 0.45, z, legWood);
      }
    }
    box(table, 2.38, 0.035, 1.38, 0, 1.035, 0, material(palette.light));

    // Contract paper
    const paperCanvas = document.createElement('canvas');
    paperCanvas.width = 512;
    paperCanvas.height = 320;
    const ctx = paperCanvas.getContext('2d')!;
    ctx.fillStyle = '#fffdf5';
    ctx.fillRect(0, 0, 512, 320);
    ctx.strokeStyle = '#d8dfcb';
    ctx.lineWidth = 5;
    ctx.strokeRect(18, 18, 476, 284);
    ctx.fillStyle = '#42644b';
    ctx.font = 'bold 35px Arial';
    ctx.fillText('HỢP ĐỒNG THUÊ TRỌ', 47, 72);
    ctx.strokeStyle = '#9aac91';
    ctx.lineWidth = 3;
    for (const y of [112, 144, 176]) {
      ctx.beginPath();
      ctx.moveTo(48, y);
      ctx.lineTo(y === 176 ? 300 : 460, y);
      ctx.stroke();
    }
    ctx.fillStyle = '#698465';
    ctx.font = '22px Arial';
    ctx.fillText('CHỦ TRỌ', 51, 258);
    ctx.fillText('NGƯỜI THUÊ', 309, 258);

    const paperTexture = new THREE.CanvasTexture(paperCanvas);
    paperTexture.colorSpace = THREE.SRGBColorSpace;

    const contract = new THREE.Group();
    scene.add(contract);
    const paper = add(
      contract,
      new THREE.PlaneGeometry(1.05, 0.66),
      new THREE.MeshStandardMaterial({
        map: paperTexture,
        roughness: 0.9,
        side: THREE.DoubleSide
      })
    );
    paper.castShadow = false;

    // Signature
    const signature = new THREE.Group();
    signature.position.set(0.16, -0.19, 0.012);
    contract.add(signature);
    const stroke = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 0.01, 0),
      new THREE.Vector3(-0.10, -0.025, 0),
      new THREE.Vector3(-0.05, 0.025, 0),
      new THREE.Vector3(0.015, -0.02, 0),
      new THREE.Vector3(0.09, 0.02, 0),
      new THREE.Vector3(0.15, -0.015, 0)
    ]);
    add(
      signature,
      new THREE.TubeGeometry(stroke, 30, 0.008, 6, false),
      material(palette.ink)
    );
    signature.scale.set(0, 1, 1);

    const seal = add(
      contract,
      new THREE.CircleGeometry(0.055, 24),
      material(0x80a55e),
      -0.36, -0.20, 0.014
    );
    seal.scale.setScalar(0.001);

    const pen = add(
      contract,
      new THREE.CylinderGeometry(0.014, 0.016, 0.26, 10),
      material(palette.ink),
      0.26, -0.035, 0.08
    );
    pen.rotation.z = -0.65;
    const penTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.027, 0.07, 10),
      material(palette.shoes)
    );
    penTip.position.set(0, -0.155, 0);
    penTip.castShadow = false;
    pen.add(penTip);

    // Person builder
    interface PersonConfig {
      coat: number;
      pants: number;
      hair: number;
      hat: number;
      scarf: number;
    }

    interface PersonResult {
      root: THREE.Group;
      arms: THREE.Group[];
      hands: THREE.Mesh[];
      legs: THREE.Group[];
      shadow: THREE.Mesh;
    }

    function person(config: PersonConfig): PersonResult {
      const root = new THREE.Group();
      scene.add(root);

      const coatMat = material(config.coat);
      const pantMat = material(config.pants);
      const skinMat = material(palette.skin);
      const shoeMat = material(palette.shoes);
      const hairMat = material(config.hair);

      add(root, new THREE.CylinderGeometry(0.27, 0.34, 0.88, 12), coatMat, 0, 1.32, 0);
      ball(root, 0.33, 0, 1.72, 0, coatMat, 1, 0.36, 0.82);
      ball(root, 0.265, 0, 2.01, 0.015, skinMat, 1, 1.09, 0.96);
      ball(root, 0.27, 0, 2.19, -0.014, hairMat, 1, 0.48, 1.05);

      const hatMat = material(config.hat);
      add(root, new THREE.CylinderGeometry(0.265, 0.29, 0.17, 16), hatMat, 0, 2.27, -0.005);
      ball(root, 0.33, 0, 2.19, 0.115, hatMat, 1, 0.15, 0.73);
      ball(root, 0.075, -0.12, 2.135, 0.207, hairMat, 1.2, 0.75, 0.8);
      ball(root, 0.027, -0.078, 2.035, 0.26, material(palette.hairDark));
      ball(root, 0.027, 0.078, 2.035, 0.26, material(palette.hairDark));

      add(root, new THREE.CylinderGeometry(0.205, 0.225, 0.16, 12), material(config.scarf), 0, 1.77, 0).scale.z = 0.88;

      const arms: THREE.Group[] = [];
      const hands: THREE.Mesh[] = [];
      for (const side of [-1, 1]) {
        const pivot = new THREE.Group();
        pivot.position.set(side * 0.33, 1.65, 0);
        root.add(pivot);
        add(pivot, new THREE.CylinderGeometry(0.105, 0.095, 0.56, 10), coatMat, side * 0.055, -0.27, 0);
        hands.push(ball(pivot, 0.105, side * 0.08, -0.59, 0.015, skinMat, 1, 0.9, 1));
        arms.push(pivot);
      }

      const legs: THREE.Group[] = [];
      for (const side of [-1, 1]) {
        const pivot = new THREE.Group();
        pivot.position.set(side * 0.15, 0.89, 0);
        root.add(pivot);
        add(pivot, new THREE.CylinderGeometry(0.105, 0.10, 0.68, 10), pantMat, 0, -0.34, 0);
        ball(pivot, 0.16, 0, -0.69, 0.09, shoeMat, 1, 0.48, 1.55);
        legs.push(pivot);
      }

      const shadow = add(
        scene,
        new THREE.CircleGeometry(0.48, 24),
        new THREE.MeshBasicMaterial({
          color: 0x758b68,
          transparent: true,
          opacity: 0.18,
          depthWrite: false
        }),
        0, 0.019, 0
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.castShadow = false;

      return { root, arms, hands, legs, shadow };
    }

    const landlord = person({
      coat: palette.landlordCoat,
      pants: palette.landlordPants,
      hair: palette.hairDark,
      hat: 0x608665,
      scarf: 0xf5eddf
    });

    const tenant = person({
      coat: palette.tenantCoat,
      pants: palette.tenantPants,
      hair: palette.hairBrown,
      hat: 0x806047,
      scarf: 0xedf5dc
    });

    landlord.root.rotation.y = 1.06;
    tenant.root.rotation.y = -1.06;

    // Resize
    function resize() {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      renderer.clear(true, true, true);
      const aspect = width / height;
      const verticalSpan = Math.max(6.2, 11.5 / aspect);
      const horizontalSpan = verticalSpan * aspect;
      camera.left = -horizontalSpan / 2;
      camera.right = horizontalSpan / 2;
      camera.top = verticalSpan / 2;
      camera.bottom = -camera.top;
      camera.updateProjectionMatrix();
    }

    new ResizeObserver(resize).observe(host);
    resize();

    let progress = 0;
    function updateProgress() {
      const unit = chapter?.offsetTop || 1;
      progress = Math.max(0, Math.min(1, (window.scrollY / unit - 0.65) / 0.8));
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();

    const reduced = matchMedia('(prefers-reduced-motion: reduce)');

    // Branch rotation animation
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    let targetRotation = 0;
    let currentRotation = 0;

    // Move existing objects to rootGroup
    if (plinth.parent) plinth.parent.remove(plinth);
    if (plinthTop.parent) plinthTop.parent.remove(plinthTop);
    if (centerTile.parent) centerTile.parent.remove(centerTile);
    if (table.parent) table.parent.remove(table);
    rootGroup.add(plinth, plinthTop, centerTile, table);

    const updateRotation = () => {
      const branch = document.body.dataset.branch;
      targetRotation = branch === 'landlord' ? Math.PI : 0;
    };

    window.addEventListener('trooi:branch-change', updateRotation);
    updateRotation();

    function animatePerson(
      p: PersonResult,
      side: number,
      approach: number,
      walking: number,
      reach: number,
      time: number,
      paused: boolean
    ) {
      const x = side * (lerp(5.3, 1.61, approach) - 0.25 * reach);
      const gait = Math.sin(walking * 8 * Math.PI + side) * 0.3 * (1 - smooth((walking - 0.65) / 0.35));
      const float = paused ? 0 : Math.sin(time * 1.45 + side) * 0.025;
      p.root.position.set(x, Math.abs(gait) * 0.12 + float, side === -1 ? 0.16 : -0.15);
      p.shadow.position.x = x;
      p.shadow.position.z = side === -1 ? 0.16 : -0.15;
      (p.shadow.material as THREE.MeshBasicMaterial).opacity = 0.16 - Math.abs(gait) * 0.1;
      p.legs[0].rotation.x = gait;
      p.legs[1].rotation.x = -gait;
      p.arms[0].rotation.x = -gait * 0.6;
      p.arms[1].rotation.x = gait * 0.6;
      const givingArm = p.arms[side === -1 ? 1 : 0];
      givingArm.rotation.x = lerp(givingArm.rotation.x, -1.0, reach);
      givingArm.rotation.z = -side * 0.75 * reach;
    }

    let last = performance.now();
    let time = 0;
    const greenHand = new THREE.Vector3();
    const brownHand = new THREE.Vector3();

    function frame(now: number) {
      requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!document.body.classList.contains('roles-view') || document.hidden) return;

      const paused = reduced.matches || document.getElementById('motion')?.getAttribute('aria-pressed') === 'true';
      if (!paused) time += dt;

      // Animate branch rotation
      if (!paused && Math.abs(currentRotation - targetRotation) > 0.001) {
        currentRotation += (targetRotation - currentRotation) * Math.min(dt * 3, 1);
        rootGroup.rotation.y = currentRotation;
      }

      const walking = smooth((progress - 0.025) / 0.53);
      const approach = easeOutBack(walking);
      const giverReach = smooth((progress - 0.43) / 0.23) * (1 - 0.3 * smooth((progress - 0.82) / 0.16));
      const receiverReach = smooth((progress - 0.59) / 0.22);
      const handoff = smooth((progress - 0.67) / 0.19);
      const signing = smooth((progress - 0.86) / 0.12);
      const completed = smooth((progress - 0.92) / 0.08);

      animatePerson(landlord, -1, approach, walking, giverReach, time, paused);
      animatePerson(tenant, 1, approach, walking, receiverReach, time, paused);

      scene.updateMatrixWorld(true);
      landlord.hands[1].getWorldPosition(greenHand);
      tenant.hands[0].getWorldPosition(brownHand);

      contract.position.copy(greenHand).lerp(brownHand, handoff);
      contract.position.y += 0.07 + Math.sin(handoff * Math.PI) * 0.12;
      contract.position.z += 0.16;
      contract.rotation.set(
        -0.15,
        lerp(0.12, -0.12, handoff),
        lerp(-0.09, 0.08, handoff)
      );

      signature.scale.x = Math.max(0.001, signing);
      seal.scale.setScalar(Math.max(0.001, easeOutBack(completed)));
      pen.visible = signing > 0 && signing < 0.99;
      pen.position.x = lerp(0.20, 0.34, signing);
      pen.position.y = -0.04 + Math.sin(signing * 16) * 0.012;

      table.position.y = paused ? 0 : Math.sin(time * 0.9) * 0.014;

      renderer.render(scene, camera);
      if (renderer.domElement.style.visibility !== 'visible') {
        renderer.domElement.style.visibility = 'visible';
      }
    }

    const rafId = requestAnimationFrame(frame);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
      window.removeEventListener('trooi:branch-change', updateRotation);
      
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
      
      if (host && renderer.domElement) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [theme]);

  return (
    <div
      ref={mountRef}
      className="roles-scene relative w-full h-0 min-h-0 flex-1 mx-auto pointer-events-none"
      style={{
        opacity: 'var(--role-scene-opacity, 1)',
        transform: 'translateY(var(--role-scene-y, 0px)) scale(var(--role-scene-scale, 1))',
        transformOrigin: 'center 55%',
        maxWidth: '1000px'
      }}
      role="img"
      aria-label="Hai nhân vật chủ trọ và người thuê bước vào, trao hợp đồng thuê, ký tên và đóng dấu."
    />
  );
}
