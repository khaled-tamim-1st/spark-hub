import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export const GlowingGoldenCube: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5.5, 3.5, 6.5);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 3. OrbitControls (Smooth Touch & Mouse Rotation)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;

    // 4. Post-processing (Balanced Golden Glow Bloom)
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.15, // Bloom strength (متوازن وهادئ)
      0.45, // Radius
      0.28  // Threshold
    );
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff1cc, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffdd66, 2.5);
    keyLight.position.set(6, 8, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xffaa00, 3.0, 15);
    rimLight.position.set(-5, -3, -4);
    scene.add(rimLight);

    // 6. Build the 3x3x3 Rubik's Cube
    const rubikGroup = new THREE.Group();
    const cubeSize = 0.72;
    const gap = 0.07;
    const step = cubeSize + gap;

    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd043,
      emissive: 0xd98200,
      emissiveIntensity: 0.95,
      metalness: 0.88,
      roughness: 0.22,
    });

    const boxGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue; // تجويف المركز لتحسين الأداء
          const piece = new THREE.Mesh(boxGeo, goldMaterial);
          piece.position.set(x * step, y * step, z * step);
          rubikGroup.add(piece);
        }
      }
    }
    scene.add(rubikGroup);

    // 7. Ambient Rings & Floating Energy Sphere
    const ringGeo = new THREE.RingGeometry(2.35, 2.38, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffcc33,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2.6;
    const ring2 = new THREE.Mesh(ringGeo, ringMat.clone());
    ring2.rotation.y = Math.PI / 3;
    scene.add(ring1, ring2);

    // 8. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();

      // دوران إضافي ناعم للحلقات
      ring1.rotation.z += 0.003;
      ring2.rotation.x += 0.002;

      composer.render();
    };
    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 300;
      const h = container.clientHeight || 300;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative cursor-grab active:cursor-grabbing ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
};

export default GlowingGoldenCube;
