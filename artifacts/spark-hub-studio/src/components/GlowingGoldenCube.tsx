import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export type GlowMode = 'balanced' | 'subtle' | 'boosted';

export interface GlowingGoldenCubeHandle {
  resetRotation: () => void;
  setGlowMode: (mode: GlowMode) => void;
  cycleGlowMode: () => GlowMode;
}

export interface GlowingGoldenCubeProps {
  className?: string;
  isRTL?: boolean;
  glowMode?: GlowMode;
  onGlowModeChange?: (mode: GlowMode) => void;
}

export const GlowingGoldenCube = forwardRef<GlowingGoldenCubeHandle, GlowingGoldenCubeProps>(
  ({ className = '', isRTL = false, glowMode = 'balanced', onGlowModeChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bloomPassRef = useRef<UnrealBloomPass | null>(null);
    const faceMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
    const goldMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
    const targetRotationRef = useRef({ x: 0.35, y: isRTL ? 0.6 : -0.6 });
    const currentGlowModeRef = useRef<GlowMode>(glowMode);

    const applyGlowMode = (mode: GlowMode) => {
      currentGlowModeRef.current = mode;
      if (!bloomPassRef.current || !faceMaterialRef.current) return;

      if (mode === 'subtle') {
        bloomPassRef.current.strength = 0.35;
        faceMaterialRef.current.emissiveIntensity = 0.2;
        if (goldMaterialRef.current) goldMaterialRef.current.emissiveIntensity = 0.2;
      } else if (mode === 'boosted') {
        bloomPassRef.current.strength = 0.85;
        faceMaterialRef.current.emissiveIntensity = 0.55;
        if (goldMaterialRef.current) goldMaterialRef.current.emissiveIntensity = 0.45;
      } else {
        // balanced
        bloomPassRef.current.strength = 0.55;
        faceMaterialRef.current.emissiveIntensity = 0.35;
        if (goldMaterialRef.current) goldMaterialRef.current.emissiveIntensity = 0.35;
      }
      onGlowModeChange?.(mode);
    };

    useImperativeHandle(ref, () => ({
      resetRotation: () => {
        targetRotationRef.current = { x: 0.35, y: isRTL ? 0.6 : -0.6 };
      },
      setGlowMode: (mode: GlowMode) => {
        applyGlowMode(mode);
      },
      cycleGlowMode: () => {
        const nextMode: GlowMode =
          currentGlowModeRef.current === 'balanced'
            ? 'subtle'
            : currentGlowModeRef.current === 'subtle'
            ? 'boosted'
            : 'balanced';
        applyGlowMode(nextMode);
        return nextMode;
      },
    }));

    useEffect(() => {
      applyGlowMode(glowMode);
    }, [glowMode]);

    useEffect(() => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      // 1. Scene & Camera Setup
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x06080d, 0.022);

      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);

      const updateCameraLayout = () => {
        const w = container.clientWidth || window.innerWidth;
        const isMobile = w < 1024;
        if (isMobile) {
          camera.position.set(0, 0.6, 9.6);
          camera.lookAt(0, 0.3, 0);
        } else {
          // Centered toward target hemisphere, comfortably positioned away from typography
          const targetX = isRTL ? -2.7 : 2.7;
          camera.position.set(isRTL ? -3.1 : 3.1, 0.35, 8.5);
          camera.lookAt(targetX * 0.92, 0.05, 0);
        }
      };
      updateCameraLayout();

      // 2. WebGL Renderer with High Dynamic Range Tone Mapping
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;

      // 3. Post-processing Composer (Soft & Warm Bloom Pass)
      const renderPass = new RenderPass(scene, camera);
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.55, // Soft balanced bloom strength
        0.4,  // Soft radius
        0.45  // Higher threshold so bloom only highlights edge reflections
      );
      bloomPassRef.current = bloomPass;

      const composer = new EffectComposer(renderer);
      composer.addPass(renderPass);
      composer.addPass(bloomPass);

      // 4. Warm Luxury Metallic Lighting
      const warmAmbient = new THREE.AmbientLight(0xffdfa0, 0.8);
      scene.add(warmAmbient);

      const dirLight1 = new THREE.DirectionalLight(0xffeaad, 3.2);
      dirLight1.position.set(5, 8, 4);
      scene.add(dirLight1);

      const rimLightGold = new THREE.PointLight(0xffaa22, 2.5, 20);
      rimLightGold.position.set(-6, -2, -4);
      scene.add(rimLightGold);

      // Subtle warm fill light from opposite angle
      const fillLight = new THREE.DirectionalLight(0xd99b42, 1.4);
      fillLight.position.set(-4, 5, -2);
      scene.add(fillLight);

      // 5. Rubik's Cube Assembly (Reduced by 20% for optimal balance)
      const cubeRootGroup = new THREE.Group();
      cubeRootGroup.scale.set(0.8, 0.8, 0.8);
      scene.add(cubeRootGroup);

      const updateCubeRootPosition = () => {
        const w = container.clientWidth || window.innerWidth;
        if (w < 1024) {
          cubeRootGroup.position.set(0, 0.35, 0);
          cubeRootGroup.scale.set(0.72, 0.72, 0.72);
        } else {
          // Anchored on the right side in LTR, left in RTL
          cubeRootGroup.position.set(isRTL ? -2.7 : 2.7, 0.1, 0);
          cubeRootGroup.scale.set(0.8, 0.8, 0.8);
        }
      };
      updateCubeRootPosition();

      // 1. خامة الذهب الفاخر (Dark Gold Metallic with warm glow)
      const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xc8963e,           // درجة ذهب شامبين دافئ وأنيق
        emissive: 0x4a2a00,        // توهج كهرماني برونزي خافت (بدل الأصفر الفاقع)
        emissiveIntensity: 0.35,   // شدة خفيفة تبرز التجسيم
        metalness: 0.92,           // طابع معدني صريح
        roughness: 0.18,           // لمعان وانعكاس حاد للأضواء
      });
      goldMaterialRef.current = goldMaterial;

      // 2. خامة الحواف والفواصل (Dark Inner Core / Bevel)
      const innerCoreMaterial = new THREE.MeshBasicMaterial({
        color: 0x111115,
      });

      // Luminous Gold Face Plates Material (Polished gold facet plates)
      const facePlateMaterial = new THREE.MeshStandardMaterial({
        color: 0xd6a44d,
        emissive: 0x5a3405,
        emissiveIntensity: 0.35,
        metalness: 0.90,
        roughness: 0.16,
      });
      faceMaterialRef.current = facePlateMaterial;

      // Sophisticated metallic outline seams
      const edgeLineMaterial = new THREE.LineBasicMaterial({
        color: 0xba852e,
        transparent: true,
        opacity: 0.32,
      });

      const cubieSize = 0.84;
      const spacing = 0.90;
      const cubieGeometry = new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize);
      const facePlateGeometry = new THREE.PlaneGeometry(cubieSize * 0.74, cubieSize * 0.74);
      const cubieEdgeGeometry = new THREE.EdgesGeometry(cubieGeometry);

      function attachFace(parent: THREE.Mesh, pos: [number, number, number], rot: [number, number, number]) {
        const plate = new THREE.Mesh(facePlateGeometry, facePlateMaterial);
        plate.position.set(...pos);
        plate.rotation.set(...rot);
        parent.add(plate);
      }

      // Generate 27 cubies (3x3x3)
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            const cubie = new THREE.Mesh(cubieGeometry, goldMaterial);
            cubie.position.set(x * spacing, y * spacing, z * spacing);

            const line = new THREE.LineSegments(cubieEdgeGeometry, edgeLineMaterial);
            cubie.add(line);

            // Attach polished luxury face plates on exposed outer faces
            const offset = cubieSize / 2 + 0.005;
            if (x === 1) attachFace(cubie, [offset, 0, 0], [0, Math.PI / 2, 0]);
            if (x === -1) attachFace(cubie, [-offset, 0, 0], [0, -Math.PI / 2, 0]);
            if (y === 1) attachFace(cubie, [0, offset, 0], [-Math.PI / 2, 0, 0]);
            if (y === -1) attachFace(cubie, [0, -offset, 0], [Math.PI / 2, 0, 0]);
            if (z === 1) attachFace(cubie, [0, 0, offset], [0, 0, 0]);
            if (z === -1) attachFace(cubie, [0, 0, -offset], [0, Math.PI, 0]);

            cubeRootGroup.add(cubie);
          }
        }
      }

      // 6. Surrounding Ethereal Wireframe Energy Cage
      const energySpheresGroup = new THREE.Group();
      cubeRootGroup.add(energySpheresGroup);

      const ringGeometry = new THREE.RingGeometry(2.7, 2.75, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xc8963e,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
      });

      const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
      const ring2 = new THREE.Mesh(ringGeometry, ringMaterial);
      ring2.rotation.x = Math.PI / 2.3;
      const ring3 = new THREE.Mesh(ringGeometry, ringMaterial);
      ring3.rotation.y = Math.PI / 2.5;

      energySpheresGroup.add(ring1, ring2, ring3);

      // Wireframe geodesic aura sphere in warm bronze
      const sphereGeo = new THREE.IcosahedronGeometry(2.9, 2);
      const sphereWireGeo = new THREE.WireframeGeometry(sphereGeo);
      const sphereWireMat = new THREE.LineBasicMaterial({
        color: 0x9e6c24,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
      });
      const wireSphere = new THREE.LineSegments(sphereWireGeo, sphereWireMat);
      energySpheresGroup.add(wireSphere);

      // Golden Dust / Ember Particles
      const particleCount = 120;
      const particleGeo = new THREE.BufferGeometry();
      const posArray = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        const radius = 2.1 + Math.random() * 3.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
        posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        posArray[i + 2] = radius * Math.cos(phi);
      }

      particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0xd9a44b,
        size: 0.045,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      });
      const particleSwarm = new THREE.Points(particleGeo, particleMat);
      cubeRootGroup.add(particleSwarm);

      // 7. Non-blocking Pointer Drag Rotation with Inertia (Preserving Vertical Page Scroll)
      let isDragging = false;
      let startPointerPosition = { x: 0, y: 0 };
      let previousPointerPosition = { x: 0, y: 0 };
      let isHorizontalDrag = false;
      const mouseParallax = { x: 0, y: 0, targetX: 0, targetY: 0 };

      const onPointerDown = (e: PointerEvent) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        isDragging = true;
        isHorizontalDrag = false;
        startPointerPosition = { x: e.clientX, y: e.clientY };
        previousPointerPosition = { x: e.clientX, y: e.clientY };
      };

      const onPointerMove = (e: PointerEvent) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        mouseParallax.targetX = (e.clientX / w - 0.5) * 0.35;
        mouseParallax.targetY = (e.clientY / h - 0.5) * 0.35;

        if (!isDragging) return;

        const totalDeltaX = Math.abs(e.clientX - startPointerPosition.x);
        const totalDeltaY = Math.abs(e.clientY - startPointerPosition.y);

        // If user is performing vertical scrolling on mobile/touch, cancel drag to let browser scroll smoothly
        if (e.pointerType === 'touch' && !isHorizontalDrag) {
          if (totalDeltaY > 8 && totalDeltaY > totalDeltaX * 1.1) {
            isDragging = false;
            return;
          }
          if (totalDeltaX > 8 && totalDeltaX >= totalDeltaY) {
            isHorizontalDrag = true;
          }
        }

        const deltaX = e.clientX - previousPointerPosition.x;
        const deltaY = e.clientY - previousPointerPosition.y;

        targetRotationRef.current.y += deltaX * 0.007;
        if (e.pointerType !== 'touch' || isHorizontalDrag) {
          targetRotationRef.current.x += deltaY * 0.004;
        }

        previousPointerPosition = { x: e.clientX, y: e.clientY };
      };

      const onPointerUp = () => {
        isDragging = false;
        isHorizontalDrag = false;
      };

      // Attach pointerdown strictly to canvas so text/buttons/cards remain 100% responsive
      canvas.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);

      // 8. Resize Handling
      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        composer.setSize(w, h);
        updateCameraLayout();
        updateCubeRootPosition();
      };
      window.addEventListener('resize', handleResize);

      // 9. Animation Loop
      let animationFrameId: number;
      const clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Idle orbit rotation
        if (!isDragging) {
          targetRotationRef.current.y += 0.0032;
          targetRotationRef.current.x += Math.sin(elapsedTime * 0.5) * 0.0006;
        }

        // Smooth damping / inertia
        cubeRootGroup.rotation.y += (targetRotationRef.current.y - cubeRootGroup.rotation.y) * 0.06;
        cubeRootGroup.rotation.x += (targetRotationRef.current.x - cubeRootGroup.rotation.x) * 0.06;

        // Subtle mouse parallax follow
        mouseParallax.x += (mouseParallax.targetX - mouseParallax.x) * 0.04;
        mouseParallax.y += (mouseParallax.targetY - mouseParallax.y) * 0.04;

        const baseCamX = window.innerWidth < 1024 ? 0 : (isRTL ? -3.1 : 3.1);
        camera.position.x += (mouseParallax.x * 0.6 - (camera.position.x - baseCamX)) * 0.04;

        // Gentle floating levitation
        const baseCubeY = window.innerWidth < 1024 ? 0.35 : 0.1;
        cubeRootGroup.position.y += (Math.sin(elapsedTime * 1.5) * 0.1 - (cubeRootGroup.position.y - baseCubeY)) * 0.08;

        // Orbital energy rings counter-rotation
        ring1.rotation.z = elapsedTime * 0.22;
        ring2.rotation.y = elapsedTime * 0.18;
        ring3.rotation.x = -elapsedTime * 0.2;
        wireSphere.rotation.y = elapsedTime * 0.06;

        // Swirling dust particles
        particleSwarm.rotation.y = -elapsedTime * 0.05;

        composer.render();
      };
      animate();

      // Cleanup
      return () => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        renderer.dispose();
      };
    }, [isRTL]);

    return (
      <div
        ref={containerRef}
        className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none ${className}`}
        style={{ touchAction: 'pan-y' }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-grab active:cursor-grabbing pointer-events-auto"
          style={{ touchAction: 'pan-y' }}
        />
      </div>
    );
  }
);

GlowingGoldenCube.displayName = 'GlowingGoldenCube';

export default GlowingGoldenCube;
