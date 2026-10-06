import { useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useBranch } from '../hooks/useBranch';
import * as THREE from 'three';
import { smooth, lerp } from '../utils/math';

export default function LandlordScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const { branch } = useBranch();

  useEffect(() => {
    if (!mountRef.current) return;

    const host = mountRef.current;
    const roles = document.getElementById('roles');
    if (!host || !roles) return;

    const renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance'
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    host.appendChild(renderer.domElement);
    renderer.domElement.style.visibility = 'hidden';

    const scene = new THREE.Scene();
    const bgColor = theme === 'forest' ? 0x102a20 : 0xe7ede1;
    scene.background = new THREE.Color(bgColor);
    renderer.setClearColor(bgColor, 1);

    const camera = new THREE.OrthographicCamera(-6.5, 6.5, 5, -5, 0.1, 80);
    camera.position.set(8.5, 7.4, 12.5);
    camera.lookAt(0, 1.4, 0);

    // Lighting
    scene.add(new THREE.HemisphereLight(0xffffff, 0xc7d6b5, 3));
    const sun = new THREE.DirectionalLight(0xfff6e5, 3.25);
    sun.position.set(-5, 9, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, {
      left: -10, right: 10, top: 10, bottom: -10, near: 0.5, far: 30
    });
    sun.shadow.normalBias = 0.035;
    scene.add(sun);

    const mat = (color: number, extra = {}) =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.7,
        flatShading: true,
        transparent: true,
        ...extra
      });

    const basic = (color: number, extra = {}) =>
      new THREE.MeshBasicMaterial({ color, transparent: true, ...extra });

    function mesh(
      group: THREE.Group | THREE.Scene,
      geometry: THREE.BufferGeometry,
      material: THREE.Material,
      x = 0, y = 0, z = 0
    ) {
      const m = new THREE.Mesh(geometry, material);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
      return m;
    }

    const box = (g: THREE.Group | THREE.Scene, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) =>
      mesh(g, new THREE.BoxGeometry(w, h, d), m, x, y, z);

    const ball = (g: THREE.Group | THREE.Scene, r: number, x: number, y: number, z: number, m: THREE.Material) =>
      mesh(g, new THREE.SphereGeometry(r, 16, 12), m, x, y, z);

    function texture(
      lines: Array<[string, number?, boolean?]>,
      { bg = '#f9faf1', ink = '#263f2e', accent = '#709548' } = {}
    ) {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 720;
      const ctx = c.getContext('2d', { willReadFrequently: false })!;
      
      // Background
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 512, 720);
      
      // Debug: draw a simple red rectangle to verify canvas works
      ctx.fillStyle = 'red';
      ctx.fillRect(50, 50, 100, 100);
      
      // Header - try different approach
      ctx.fillStyle = '#173f2d';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.font = 'bold 45px sans-serif';
      ctx.fillText('Trọ Ơi', 34, 100);
      
      // Accent line
      ctx.fillStyle = accent;
      ctx.fillRect(34, 110, 444, 5);
      
      // Content lines
      let y = 180;
      for (const [line, size = 31, strong = false] of lines) {
        ctx.fillStyle = strong ? ink : '#59705a';
        ctx.font = `${strong ? 'bold ' : ''}${size}px sans-serif`;
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(line, 34, y);
        y += size + 31;
      }
      
      // Debug log
      console.log('Canvas created:', c.width, 'x', c.height);
      
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      t.needsUpdate = true;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      return t;
    }

    function billTexture() {
      const c = document.createElement('canvas');
      c.width = 640;
      c.height = 1112;
      const ctx = c.getContext('2d', { willReadFrequently: false })!;
      
      // Clear canvas
      ctx.clearRect(0, 0, c.width, c.height);
      
      // Background
      ctx.fillStyle = '#fbfcf5';
      ctx.fillRect(0, 0, c.width, c.height);
      
      // Header
      ctx.fillStyle = '#315e43';
      ctx.fillRect(0, 0, 640, 146);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px Arial, sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText('Trọ Ơi', 42, 86);
      ctx.font = '24px Arial, sans-serif';
      ctx.fillStyle = '#dfedd7';
      ctx.fillText('QUẢN LÝ NHÀ TRỌ', 43, 124);
      
      // Title
      ctx.fillStyle = '#263f30';
      ctx.font = 'bold 44px Arial, sans-serif';
      ctx.fillText('Hóa đơn tháng 10', 42, 226);
      ctx.fillStyle = '#627564';
      ctx.font = '29px Arial, sans-serif';
      ctx.fillText('Phòng 203  ·  Kỳ 01–31/10', 43, 274);
      
      // Line separator
      ctx.strokeStyle = '#d7e3d1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(42, 320);
      ctx.lineTo(598, 320);
      ctx.stroke();

      const rows: Array<[string, string, string]> = [
        ['Tiền phòng', '2.500.000 đ', 'Tháng 10 / 2026'],
        ['Tiền điện', '450.000 đ', '150 kWh × 3.000 đ'],
        ['Tiền nước', '300.000 đ', '10 m³ × 30.000 đ']
      ];
      rows.forEach(([label, amount, note], i) => {
        const y = 384 + i * 174;
        ctx.fillStyle = '#2e4935';
        ctx.font = 'bold 37px Arial, sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText(label, 44, y);
        ctx.textAlign = 'right';
        ctx.font = 'bold 37px Arial, sans-serif';
        ctx.fillText(amount, 595, y);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#718171';
        ctx.font = '26px Arial, sans-serif';
        ctx.fillText(note, 44, y + 48);
        ctx.strokeStyle = '#e1e9dd';
        ctx.beginPath();
        ctx.moveTo(43, y + 88);
        ctx.lineTo(597, y + 88);
        ctx.stroke();
      });

      // Total box
      ctx.fillStyle = '#e6f2d9';
      ctx.beginPath();
      ctx.roundRect(32, 913, 576, 134, 24);
      ctx.fill();
      ctx.fillStyle = '#496750';
      ctx.font = 'bold 29px Arial, sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText('TỔNG CỘNG', 56, 970);
      ctx.fillStyle = '#285039';
      ctx.font = 'bold 47px Arial, sans-serif';
      ctx.fillText('3.250.000 đ', 55, 1021);

      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      t.needsUpdate = true;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      return t;
    }

    function chatTexture() {
      const c = document.createElement('canvas');
      c.width = 640;
      c.height = 1112;
      const ctx = c.getContext('2d', { willReadFrequently: false })!;
      
      // Clear canvas
      ctx.clearRect(0, 0, 640, 1112);
      
      // Background
      ctx.fillStyle = '#f8faf2';
      ctx.fillRect(0, 0, 640, 1112);
      
      // Header
      ctx.fillStyle = '#315e43';
      ctx.fillRect(0, 0, 640, 148);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 54px Arial, sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText('Trọ Ơi', 42, 86);
      ctx.fillStyle = '#deeed8';
      ctx.font = '24px Arial, sans-serif';
      ctx.fillText('KẾT NỐI KHÁCH THUÊ', 43, 124);
      
      // Title
      ctx.fillStyle = '#2a4935';
      ctx.font = 'bold 44px Arial, sans-serif';
      ctx.fillText('Phòng 203', 42, 226);
      ctx.fillStyle = '#68806d';
      ctx.font = '28px Arial, sans-serif';
      ctx.fillText('Chủ trọ  ↔  Người thuê', 43, 275);
      
      // Line separator
      ctx.strokeStyle = '#dce7d8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(42, 312);
      ctx.lineTo(598, 312);
      ctx.stroke();

      function bubble(x: number, y: number, w: number, h: number, bg: string, label: string, lines: string[], ink: string) {
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 25);
        ctx.fill();
        ctx.fillStyle = ink;
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText(label, x + 26, y + 43);
        ctx.font = '32px Arial, sans-serif';
        lines.forEach((line, i) => ctx.fillText(line, x + 26, y + 91 + i * 43));
      }

      bubble(33, 348, 510, 184, '#ebf1e8', 'NGƯỜI THUÊ', ['Chào anh, vòi nước phòng em', 'đang bị rò ạ.'], '#34543b');
      bubble(118, 565, 489, 187, '#d8ebcb', 'CHỦ TRỌ', ['Mình đã nhận tin. Thợ sẽ', 'ghé lúc 16:00 nhé.'], '#28513a');
      bubble(33, 789, 440, 136, '#ebf1e8', 'NGƯỜI THUÊ', ['Dạ, em cảm ơn anh!'], '#34543b');
      
      // Input box
      ctx.fillStyle = '#edf4e9';
      ctx.beginPath();
      ctx.roundRect(32, 982, 576, 82, 38);
      ctx.fill();
      ctx.fillStyle = '#7c947d';
      ctx.font = '29px Arial, sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText('Nhắn tin...', 64, 1035);
      ctx.fillStyle = '#4f8053';
      ctx.beginPath();
      ctx.arc(555, 1023, 29, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 31px Arial, sans-serif';
      ctx.fillText('↗', 544, 1034);

      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      t.needsUpdate = true;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      return t;
    }

    function conversationTexture(label: string, lines: string[], owner = false) {
      const c = document.createElement('canvas');
      c.width = 576;
      c.height = 256;
      const ctx = c.getContext('2d', { willReadFrequently: false })!;
      
      // Clear canvas
      ctx.clearRect(0, 0, 576, 256);
      
      // Background
      ctx.fillStyle = owner ? '#dceecf' : '#fffef7';
      ctx.fillRect(0, 0, 576, 256);
      
      // Side indicator
      ctx.fillStyle = owner ? '#5b8d59' : '#8fb58b';
      ctx.fillRect(0, 0, 12, 256);
      
      // Label
      ctx.fillStyle = '#4c6f50';
      ctx.font = 'bold 29px Arial, sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(label, 39, 65);
      
      // Content lines
      ctx.fillStyle = '#294733';
      ctx.font = '35px Arial, sans-serif';
      lines.forEach((line, i) => ctx.fillText(line, 39, 131 + i * 49));
      
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.needsUpdate = true;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      return t;
    }

    function panel(group: THREE.Group, w: number, h: number, tex: THREE.Texture, x: number, y: number, z: number) {
      const p = mesh(
        group,
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }),
        x, y, z
      );
      p.castShadow = false;
      return p;
    }

    function phone(group: THREE.Group, tex: THREE.Texture, x: number, y: number, z: number) {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      g.rotation.y = -0.18;
      g.rotation.z = 0.055;
      group.add(g);
      box(g, 2.16, 3.62, 0.22, 0, 0, 0, mat(0x173f2d, { roughness: 0.5 }));
      panel(g, 1.83, 3.18, tex, 0, 0, 0.091);
      box(g, 0.29, 0.025, 0.02, 0, 1.66, 0.105, mat(0x102f25));
      return g;
    }

    function opacity(group: THREE.Group, a: number) {
      group.visible = a > 0.001;
      group.traverse((o) => {
        if (!(o as THREE.Mesh).isMesh) return;
        const mesh = o as THREE.Mesh;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          if (material && 'opacity' in material) {
            material.opacity = a;
          }
        });
      });
    }

    function chapterTransition(group: THREE.Group, enter: number, exit: number) {
      group.scale.setScalar(lerp(0.05, 1, enter) * (1 - exit * 0.8));
      group.position.set(0, lerp(-3, 0, enter) - exit * 15, -exit * 15);
      opacity(group, enter * (1 - exit));
    }

    // Property
    const property = new THREE.Group();
    scene.add(property);
    const ground = mat(0xd8e7c6);
    const floor = mat(0xf0eee1);
    const wall = mat(0xfffcf2);
    const roof = mat(0xc9dabb);
    const wood = mat(0xd6c7ae);
    const glass = mat(0xa4d5c9, { metalness: 0.08 });

    box(property, 8.4, 0.20, 5.55, 0, -0.20, 0, ground);
    box(property, 8.1, 0.05, 5.35, 0, -0.07, 0, floor);
    box(property, 8.1, 0.025, 0.75, 0, -0.035, 2.25, wood);

    for (let i = 0; i < 3; i++) {
      const x = -2.55 + i * 2.55;
      box(property, 2.38, 2.18, 2.35, x, 1.12, -0.7, wall);
      box(property, 2.57, 0.17, 2.58, x, 2.27, -0.7, roof);
      box(property, 0.78, 1.58, 0.065, x - 0.46, 0.78, 0.52, mat(i === 0 ? 0x7b9b68 : 0x668b6a));
      ball(property, 0.06, x - 0.23, 1.03, 0.57, mat(0xf2e5b9));
      box(property, 0.62, 0.66, 0.07, x + 0.55, 1.35, 0.52, glass);
      box(property, 0.065, 0.75, 0.09, x + 0.55, 1.35, 0.58, wall);
      box(property, 0.72, 0.07, 0.09, x + 0.55, 1.35, 0.58, wall);
      box(property, 0.8, 0.035, 0.4, x, 2.48, 0.1, mat(0xb0c79d));
    }

    for (const x of [-3.8, 3.8]) {
      mesh(property, new THREE.CylinderGeometry(0.055, 0.07, 0.55, 8), mat(0x7e9a70), x, 0.23, 2);
      const leaves = ball(property, 0.43, x, 0.65, 2, mat(0x9fc88a));
      leaves.scale.set(1, 0.82, 0.78);
    }

    // Listing
    const listing = new THREE.Group();
    scene.add(listing);
    const listingTex = texture([
      ['PHÒNG ĐANG TRỐNG', 33, true],
      ['Ảnh rõ · Thông tin đủ', 26],
      ['Khách thuê đang quan tâm', 25],
      ['Xem tin đăng', 28, true]
    ]);
    console.log('Listing texture created:', listingTex);
    console.log('Listing texture image:', listingTex.image);
    const listingPhone = phone(listing, listingTex, 3.35, 2.45, 1.38);

    const vacancy = new THREE.Group();
    listing.add(vacancy);
    vacancy.position.set(-2.55, 2.89, 0.63);
    box(vacancy, 1.45, 0.45, 0.09, 0, 0, 0, mat(0x4a7350));
    panel(
      vacancy,
      1.33, 0.35,
      texture([['CÒN PHÒNG', 47, true]], { bg: '#3f6b48', ink: '#ffffff' }),
      0, 0, 0.06
    );

    const inquiry = new THREE.Group();
    listing.add(inquiry);
    box(inquiry, 1.12, 0.48, 0.09, 0, 0, 0, mat(0xeaf5d8));
    ball(inquiry, 0.13, -0.33, 0, 0.08, mat(0x83a861));
    box(inquiry, 0.49, 0.04, 0.02, 0.1, 0.09, 0.07, mat(0x62805c));
    box(inquiry, 0.36, 0.04, 0.02, 0.035, -0.06, 0.07, mat(0x9db991));

    // Utilities
    const utilities = new THREE.Group();
    scene.add(utilities);
    const utilityTex = billTexture();
    console.log('Bill texture created:', utilityTex);
    const utilityPhone = phone(utilities, utilityTex, 0.8, 2.5, 1.35);
    const billScan = box(
      utilityPhone,
      1.72, 0.10, 0.018,
      0, 0, 0.113,
      basic(0xb8edb5, { opacity: 0.45, depthWrite: false })
    );
    billScan.castShadow = false;
    billScan.receiveShadow = false;

    // Bell
    const bell = new THREE.Group();
    utilities.add(bell);
    bell.position.set(-1.95, 4.2, 2.05);
    const bellBody = new THREE.Group();
    bell.add(bellBody);
    mesh(bellBody, new THREE.CylinderGeometry(0.31, 0.52, 0.63, 24), mat(0x729b66), 0, 0.07, 0);
    ball(bellBody, 0.33, 0, 0.38, 0, mat(0x93ba7b));
    const bellRim = mesh(bellBody, new THREE.TorusGeometry(0.53, 0.055, 8, 28), mat(0x456f4c), 0, -0.27, 0);
    bellRim.rotation.x = Math.PI / 2;
    ball(bellBody, 0.11, 0, -0.43, 0, mat(0x315b3f));
    ball(bellBody, 0.095, 0, 0.7, 0, mat(0x456f4c));
    const notificationDot = ball(bell, 0.155, 0.46, 0.55, 0.25, mat(0xe9aa75, { emissive: 0x61351f, emissiveIntensity: 0.12 }));

    // Signal
    const signal = new THREE.Group();
    signal.position.set(3.85, 3.72, 1.7);
    utilities.add(signal);
    ball(signal, 0.18, 0, 0, 0, mat(0x5b8b62));
    const waves: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const wave = mesh(
        signal,
        new THREE.TorusGeometry(0.78 + i * 0.56, 0.068 - i * 0.008, 8, 48, Math.PI * 0.72),
        basic(i === 2 ? 0xa3c791 : 0x5c9169, { depthWrite: false, side: THREE.DoubleSide }),
        0, 0, 0
      );
      wave.rotation.z = -Math.PI * 0.36;
      wave.castShadow = false;
      wave.receiveShadow = false;
      waves.push(wave);
    }

    // Messages
    const messages = new THREE.Group();
    scene.add(messages);
    const chatTex = chatTexture();
    console.log('Chat texture created:', chatTex);
    const chatPhone = phone(messages, chatTex, 0.8, 2.5, 1.35);

    const replyData = [
      { x: -3.30, y: 3.70, z: 1.40, side: -1, label: 'NGƯỜI THUÊ', lines: ['Vòi nước bị rò ạ.'], owner: false },
      { x: 4.70, y: 3.65, z: 1.40, side: 1, label: 'CHỦ TRỌ', lines: ['Mình đã nhận tin.'], owner: true },
      { x: 4.52, y: 2.62, z: 1.75, side: 1, label: 'CHỦ TRỌ', lines: ['Thợ ghé lúc 16:00.'], owner: true },
      { x: -3.12, y: 2.67, z: 1.75, side: -1, label: 'NGƯỜI THUÊ', lines: ['Dạ, em có ở nhà.'], owner: false }
    ];

    const replies = replyData.map((item) => {
      const g = new THREE.Group();
      messages.add(g);
      box(g, 2.82, 1.32, 0.12, 0, 0, 0, mat(item.owner ? 0xc6dfb5 : 0xe5e8d9));
      panel(g, 2.68, 1.18, conversationTexture(item.label, item.lines, item.owner), 0, 0, 0.068);
      g.rotation.y = 0.18;
      g.rotation.z = item.side * 0.035;
      return { ...item, group: g };
    });

    // Resize
    function resize() {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      const aspect = width / height;
      const span = Math.max(7.6, 12.6 / aspect);
      camera.left = -span * aspect / 2;
      camera.right = -camera.left;
      camera.top = span / 2;
      camera.bottom = -camera.top;
      camera.updateProjectionMatrix();
    }

    new ResizeObserver(resize).observe(host);
    resize();

    let time = 0;
    let last = performance.now();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');

    function frame(now: number) {
      requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (document.hidden || branch !== 'landlord') return;

      if (document.body.dataset.activeChapter === 'app') {
        [property, listing, utilities, messages].forEach((group) => opacity(group, 0));
        renderer.clear();
        return;
      }

      const page = window.scrollY / (roles?.offsetTop || 1);
      if (page < 1.65 || page > 5.2) return;

      const paused = reduced.matches || document.getElementById('motion')?.getAttribute('aria-pressed') === 'true';
      if (!paused) time += dt;

      const arrive = smooth((page - 1.7) / 0.3);
      const billIn = smooth((page - 2.72) / 0.34);
      const chatIn = smooth((page - 3.72) / 0.34);
      const appIn = smooth((page - 4.58) / 0.3);
      const billOnly = billIn * (1 - chatIn);

      chapterTransition(property, arrive, billIn);
      chapterTransition(listing, arrive, billIn);
      chapterTransition(utilities, billIn, chatIn);
      chapterTransition(messages, chatIn, appIn);

      property.position.y += (paused ? 0 : Math.sin(time * 0.9) * 0.018) * (1 - billIn);

      listingPhone.position.x = lerp(5.45, 3.35, arrive);
      vacancy.scale.setScalar(lerp(0.01, 1, smooth((page - 2.06) / 0.22)));
      inquiry.position.set(lerp(4.7, -0.65, smooth((page - 2.28) / 0.28)), 3.9, 0.8);
      inquiry.rotation.y = -0.15;

      utilityPhone.position.x = lerp(4.4, 0.8, billIn);
      utilityPhone.position.y = 2.5 + (paused ? 0 : Math.sin(time * 1.45) * 0.055);
      utilityPhone.scale.setScalar(window.innerWidth < 800 ? 1.8 : 1.55);
      utilityPhone.rotation.y = 0.22 + (paused ? 0 : Math.sin(time * 0.7) * 0.022);
      utilityPhone.rotation.z = lerp(0.13, 0.025, billIn) + (paused ? 0 : Math.sin(time * 0.9) * 0.008);

      billScan.position.y = lerp(1.4, -1.36, smooth((page - 3.08) / 0.42));
      (billScan.material as THREE.MeshBasicMaterial).opacity = 0.32 * billOnly;
      billScan.visible = page > 3.04 && page < 3.54;

      const bellEnter = smooth((page - 2.86) / 0.26);
      bell.scale.setScalar(lerp(0.01, 0.72, bellEnter));
      bell.position.y = 4.2 + (paused ? 0 : Math.sin(time * 1.7) * 0.08);
      bellBody.rotation.z = paused ? 0 : Math.sin(time * 3.8) * 0.13;
      notificationDot.scale.setScalar(paused ? 1 : 1 + Math.sin(time * 3) * 0.09);

      const signalEnter = smooth((page - 3.01) / 0.22);
      signal.scale.setScalar(lerp(0.01, 1, signalEnter));
      signal.position.y = 3.72 + (paused ? 0 : Math.sin(time * 1.3 + 0.7) * 0.06);
      waves.forEach((wave, i) => {
        const reach = smooth((page - 3.02 - i * 0.065) / 0.2);
        wave.scale.setScalar(lerp(0.2, 1, reach) * (paused ? 1 : 1 + Math.sin(time * 2.1 - i * 0.62) * 0.035));
        (wave.material as THREE.MeshBasicMaterial).opacity = billOnly * reach * (paused ? 0.78 : 0.68 + 0.12 * Math.sin(time * 2.1 - i * 0.62));
      });

      chatPhone.position.x = lerp(4.4, 0.8, chatIn);
      chatPhone.position.y = 2.5 + (paused ? 0 : Math.sin(time * 1.35 + 0.7) * 0.055);
      chatPhone.scale.setScalar(window.innerWidth < 800 ? 1.8 : 1.55);
      chatPhone.rotation.y = 0.22 + (paused ? 0 : Math.sin(time * 0.7 + 0.5) * 0.02);
      chatPhone.rotation.z = lerp(0.13, 0.025, chatIn) + (paused ? 0 : Math.sin(time * 0.85) * 0.008);

      replies.forEach((item, i) => {
        const t = smooth((page - 3.87 - i * 0.12) / 0.18);
        item.group.position.set(
          lerp(item.x + item.side * 1.15, item.x, t),
          item.y + (paused ? 0 : Math.sin(time * 1.28 + i) * 0.055),
          item.z
        );
        item.group.scale.setScalar(lerp(0.01, window.innerWidth < 800 ? 1.04 : 1, t));
      });

      renderer.render(scene, camera);
      if (renderer.domElement.style.visibility !== 'visible') {
        renderer.domElement.style.visibility = 'visible';
      }
    }

    const rafId = requestAnimationFrame(frame);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      
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
  }, [theme, branch]);

  return (
    <div
      ref={mountRef}
      id="landlord-stage"
      className="fixed top-[3%] left-[32%] w-[72%] h-[94%] z-[2] pointer-events-none"
      style={{
        opacity: 'var(--landlord-scene-opacity, 0)',
        visibility: branch === 'landlord' ? 'visible' : 'hidden',
        background: theme === 'forest' ? '#102a20' : '#e7ede1',
        border: 0,
        outline: 0
      }}
      role="img"
      aria-label="Ba cảnh chủ trọ: đăng phòng trống, quản lý hóa đơn điện nước, và nhắn tin với khách thuê."
    />
  );
}
