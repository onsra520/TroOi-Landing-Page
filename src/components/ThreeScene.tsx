import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../hooks/useTheme';

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 160);
    camera.position.set(16, 15, 21);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ 
      alpha: false, 
      antialias: true,
      powerPreference: 'high-performance'
    });
    
    const bgColor = theme === 'forest' ? 0x102a20 : 0xe7ede1;
    renderer.setClearColor(bgColor, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.HemisphereLight(0xffffff, 0x6d8255, 3));
    
    const sun = new THREE.DirectionalLight(0xfff6db, 5);
    sun.position.set(-8, 19, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, {
      left: -22, right: 22, top: 22, bottom: -22, near: 0.5, far: 60
    });
    sun.shadow.normalBias = 0.04;
    sun.shadow.bias = -0.0003;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xd8f5ff, 2);
    fill.position.set(10, 8, -8);
    scene.add(fill);

    // Simple cube as placeholder
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x91b45e, 
      roughness: 0.65 
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(24, 21);
    groundGeo.rotateX(-Math.PI / 2);
    const ground = new THREE.Mesh(
      groundGeo,
      new THREE.MeshStandardMaterial({ color: 0xc4d5a8 })
    );
    ground.receiveShadow = true;
    scene.add(ground);

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [theme]);

  return (
    <div 
      ref={mountRef} 
      className="fixed top-0 left-0 w-full h-screen pointer-events-none z-[1]"
      role="img"
      aria-label="Cảnh 3D minh họa"
    />
  );
}
