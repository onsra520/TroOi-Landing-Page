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

    // Load logo
    let logoImg: HTMLImageElement | null = null;
    const logoPromise = (async () => {
      logoImg = new Image();
      logoImg.src = '/trooi-logo-main.png';
      await logoImg.decode();
    })();

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
      
      // Header
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
      
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      t.needsUpdate = true;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      return t;
    }

    function listingTexture() {
      const c = document.createElement('canvas');
      c.width = 640;
      c.height = 1112;
      const ctx = c.getContext('2d', { willReadFrequently: false })!;
      
      // Background
      ctx.fillStyle = '#f5f8ef';
      ctx.fillRect(0, 0, 640, 1112);
      
      // Header bar
      ctx.fillStyle = '#315e43';
      ctx.fillRect(0, 0, 640, 120);
      
      // Time
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 23px Arial';
      ctx.textBaseline = 'top';
      ctx.fillText('9:41', 42, 44);
      
      // Room card
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.roundRect(32, 160, 576, 340, 24);
      ctx.fill();
      
      // Status badge
      ctx.fillStyle = '#e8f5d9';
      ctx.beginPath();
      ctx.roundRect(56, 188, 200, 44, 22);
      ctx.fill();
      ctx.fillStyle = '#466f32';
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('ĐANG CHO THUÊ', 80, 210);
      
      // Room title
      ctx.fillStyle = '#173f2d';
      ctx.font = 'bold 46px Arial';
      ctx.textBaseline = 'top';
      ctx.fillText('Phòng trọ cao cấp', 56, 270);
      
      // Room details
      ctx.fillStyle = '#53665a';
      ctx.font = '600 29px Arial';
      ctx.fillText('P.203 - 25m² - Tầng 3', 56, 335);
      
      // Amenities
      ctx.fillStyle = '#466f32';
      ctx.beginPath();
      ctx.roundRect(56, 400, 150, 46, 23);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '600 22px Arial';
      ctx.textBaseline = 'middle';
      ctx.fillText('Ban công', 70, 423);
      
      // Room preview area
      ctx.fillStyle = '#e0e8d8';
      ctx.fillRect(56, 480, 528, 180);
      
      // Price section
      ctx.fillStyle = '#173f2d';
      ctx.font = 'bold 48px Arial';
      ctx.textBaseline = 'top';
      ctx.fillText('3.500.000 đ', 56, 720);
      
      ctx.fillStyle = '#53665a';
      ctx.font = '600 24px Arial';
      ctx.fillText('/tháng', 56, 780);
      
      // CTA button
      ctx.fillStyle = '#173f2d';
      ctx.beginPath();
      ctx.roundRect(56, 850, 528, 88, 44);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Liên hệ chủ trọ', 320, 894);
      
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      t.needsUpdate = true;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.flipY = true;
      
      return t;
    }

    function billTexture() {
      const c = document.createElement('canvas');
      c.width = 640;
      c.height = 1112;
      const ctx = c.getContext('2d', { willReadFrequently: false })!;
      
      // Background
      ctx.fillStyle = '#f5f8ef';
      ctx.fillRect(0, 0, c.width, c.height);
      
      // Header bar
      ctx.fillStyle = '#315e43';
      ctx.fillRect(0, 0, 640, 148);
      
      // Logo
      if (logoImg) {
        const logoHeight = 72;
        const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
        ctx.drawImage(logoImg, 36, 38, logoWidth, logoHeight);
      }
      
      ctx.font = '26px system-ui, Arial';
      ctx.fillStyle = '#deeed8';
      ctx.textBaseline = 'top';
      ctx.fillText('QUẢN LÝ NHÀ TRỌ', 42, 124);
      
      // Title section
      ctx.fillStyle = '#263f30';
      ctx.font = 'bold 46px system-ui, Arial';
      ctx.textBaseline = 'top';
      ctx.fillText('Quét số điện nước', 42, 210);
      ctx.fillStyle = '#627564';
      ctx.font = '600 29px system-ui, Arial';
      ctx.fillText('Cập nhật số công tơ', 42, 268);
      
      // Electric meter card
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.roundRect(32, 360, 576, 180, 20);
      ctx.fill();
      
      // Electric icon
      ctx.fillStyle = '#ffc107';
      ctx.font = '42px system-ui, Arial';
      ctx.fillText('⚡', 56, 415);
      
      // Electric meter title
      ctx.fillStyle = '#263f30';
      ctx.font = 'bold 32px system-ui, Arial';
      ctx.fillText('Tiền điện', 120, 400);
      ctx.fillStyle = '#627564';
      ctx.font = '26px system-ui, Arial';
      ctx.fillText('Số cũ: 1.250 kWh', 120, 440);
      
      // New number
      ctx.fillStyle = '#173f2d';
      ctx.font = 'bold 36px system-ui, Arial';
      ctx.textAlign = 'right';
      ctx.fillText('+ 450.000 đ', 580, 455);
      ctx.textAlign = 'left';
      
      // Water meter card
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.roundRect(32, 560, 576, 180, 20);
      ctx.fill();
      
      // Water icon
      ctx.fillStyle = '#4fc3f7';
      ctx.font = '42px system-ui, Arial';
      ctx.fillText('💧', 56, 615);
      
      // Water meter title
      ctx.fillStyle = '#263f30';
      ctx.font = 'bold 32px system-ui, Arial';
      ctx.fillText('Tiền nước', 120, 600);
      ctx.fillStyle = '#627564';
      ctx.font = '26px system-ui, Arial';
      ctx.fillText('Số cũ: 42 m³', 120, 640);
      
      // Calculated price
      ctx.fillStyle = '#173f2d';
      ctx.font = 'bold 36px system-ui, Arial';
      ctx.textAlign = 'right';
      ctx.fillText('+ 300.000 đ', 580, 655);
      ctx.textAlign = 'left';
      
      // Summary box
      ctx.fillStyle = '#e6f2d9';
      ctx.beginPath();
      ctx.roundRect(32, 800, 576, 130, 20);
      ctx.fill();
      ctx.fillStyle = '#496750';
      ctx.font = 'bold 28px system-ui, Arial';
      ctx.fillText('Tiền phòng: 3.000.000 đ', 56, 840);
      ctx.fillStyle = '#173f2d';
      ctx.font = 'bold 42px system-ui, Arial';
      ctx.textAlign = 'right';
      ctx.fillText('Tổng: 3.750.000 đ', 588, 885);
      ctx.textAlign = 'left';
      
      // CTA button
      ctx.fillStyle = '#173f2d';
      ctx.beginPath();
      ctx.roundRect(32, 960, 576, 90, 45);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 34px system-ui, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Gửi hóa đơn', 320, 1005);
      ctx.textAlign = 'left';

      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      t.needsUpdate = true;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.flipY = true;
      return t;
    }

    function chatTexture() {
      const c = document.createElement('canvas');
      c.width = 640;
      c.height = 1112;
      const ctx = c.getContext('2d', { willReadFrequently: false })!;
      
      // Background
      ctx.fillStyle = '#f5f8ef';
      ctx.fillRect(0, 0, c.width, c.height);
      
      // Header
      ctx.fillStyle = '#315e43';
      ctx.fillRect(0, 0, c.width, 148);
      
      // Logo
      if (logoImg) {
        const logoHeight = 72;
        const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
        ctx.drawImage(logoImg, 36, 38, logoWidth, logoHeight);
      }
      
      ctx.font = '26px system-ui, Arial';
      ctx.fillStyle = '#deeed8';
      ctx.textBaseline = 'top';
      ctx.fillText('KẾT NỐI KHÁCH THUÊ', 42, 124);
      
      // Chat header with room info
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.roundRect(32, 180, 576, 120, 20);
      ctx.fill();
      
      ctx.fillStyle = '#263f30';
      ctx.font = 'bold 38px system-ui, Arial';
      ctx.textBaseline = 'top';
      ctx.fillText('Phòng 203', 56, 205);
      
      ctx.fillStyle = '#627564';
      ctx.font = '600 28px system-ui, Arial';
      ctx.fillText('Chủ trọ ↔ Người thuê', 56, 255);
      
      // Message bubbles
      function bubble(x: number, y: number, w: number, h: number, bg: string, label: string, lines: string[], ink: string) {
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 25);
        ctx.fill();
        ctx.fillStyle = ink;
        ctx.font = 'bold 26px system-ui, Arial';
        ctx.textBaseline = 'top';
        ctx.fillText(label, x + 28, y + 35);
        ctx.font = '34px system-ui, Arial';
        lines.forEach((line, i) => ctx.fillText(line, x + 28, y + 82 + i * 46));
      }

      bubble(35, 350, 510, 170, '#fff', 'NGƯỜI THUÊ', ['Chào anh, vòi nước phòng em', 'đang bị rò ạ.'], '#34543b');
      bubble(100, 555, 500, 165, '#d8ebcb', 'CHỦ TRỌ', ['Mình đã nhận tin. Thợ sẽ', 'ghé lúc 16:00 nhé.'], '#28513a');
      bubble(35, 755, 440, 125, '#fff', 'NGƯỜI THUÊ', ['Dạ, em cảm ơn anh!'], '#34543b');
      bubble(100, 910, 500, 135, '#d8ebcb', 'CHỦ TRỌ', ['Chúc bạn một ngày', 'tốt lành nhé.'], '#28513a');
      
      // Input area
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.roundRect(32, 1060, 576, 58, 29);
      ctx.fill();
      ctx.fillStyle = '#9aa89b';
      ctx.font = '28px system-ui, Arial';
      ctx.textBaseline = 'middle';
      ctx.fillText('Nhắn tin...', 64, 1089);
      
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      t.needsUpdate = true;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.flipY = true;
      return t;
    }
      
    function conversationTexture(label: string, lines: string[], owner = false) {
      const c = document.createElement('canvas');
      c.width = 576;
      c.height = 256;
      const ctx = c.getContext('2d', { willReadFrequently: false })!;
      
      // Background
      ctx.fillStyle = owner ? '#d8ebcb' : '#ffffff';
      ctx.fillRect(0, 0, 576, 256);
      
      // Label
      ctx.fillStyle = owner ? '#28513a' : '#34543b';
      ctx.font = 'bold 28px Arial, sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(label, 28, 32);
      
      // Content lines
      ctx.fillStyle = owner ? '#28513a' : '#34543b';
      ctx.font = '34px Arial, sans-serif';
      lines.forEach((line, i) => ctx.fillText(line, 28, 88 + i * 46));
      
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.needsUpdate = true;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.flipY = true;
      return t;
    }

    function panel(group: THREE.Group, w: number, h: number, tex: THREE.Texture, x: number, y: number, z: number) {
      const material = new THREE.MeshBasicMaterial({ 
        map: tex, 
        transparent: false,
        side: THREE.FrontSide,
        depthWrite: true,
        depthTest: true
      });
      const p = mesh(
        group,
        new THREE.PlaneGeometry(w, h),
        material,
        x, y, z
      );
      p.castShadow = false;
      p.receiveShadow = false;
      p.renderOrder = 999;
      return p;
    }

    function phone(group: THREE.Group, tex: THREE.Texture, x: number, y: number, z: number) {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      g.rotation.y = -0.18;
      g.rotation.z = 0.055;
      group.add(g);
      box(g, 2.16, 3.62, 0.22, 0, 0, 0, mat(0x173f2d, { roughness: 0.5 }));
      panel(g, 1.83, 3.18, tex, 0, 0, 0.15);
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
    const listingTex = listingTexture();
    const listingPhone = phone(listing, listingTex, 3.35, 2.45, 1.38);

    const vacancy = new THREE.Group();
    listing.add(vacancy);
    vacancy.position.set(-2.55, 2.89, 0.63);
    box(vacancy, 1.45, 0.45, 0.09, 0, 0, 0, mat(0x4a7350));
    panel(
      vacancy,
      1.33, 0.35,
      texture([['ĐANG CHO THUÊ', 38, true]], { bg: '#466f32', ink: '#ffffff' }),
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
    const chatPhone = phone(messages, chatTex, 0.8, 2.5, 1.35);

    const replyData = [
      { x: -3.30, y: 3.70, z: 1.40, side: -1, label: 'NGƯỜI THUÊ', lines: ['Chào anh, vòi nước', 'đang bị rò ạ.'], owner: false },
      { x: 4.70, y: 3.55, z: 1.40, side: 1, label: 'CHỦ TRỌ', lines: ['Mình đã nhận tin.', 'Thợ sẽ ghé 16:00.'], owner: true },
      { x: -3.12, y: 2.57, z: 1.75, side: -1, label: 'NGƯỜI THUÊ', lines: ['Dạ, em cảm ơn anh!'], owner: false },
      { x: 4.52, y: 2.45, z: 1.75, side: 1, label: 'CHỦ TRỌ', lines: ['Chúc bạn', 'một ngày tốt lành.'], owner: true }
    ];

    const replies = replyData.map((item) => {
      const g = new THREE.Group();
      messages.add(g);
      const bubbleHeight = item.lines.length > 1 ? 1.52 : 1.32;
      box(g, 2.82, bubbleHeight, 0.12, 0, 0, 0, mat(item.owner ? 0xc6dfb5 : 0xffffff));
      panel(g, 2.68, bubbleHeight - 0.14, conversationTexture(item.label, item.lines, item.owner), 0, 0, 0.068);
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
