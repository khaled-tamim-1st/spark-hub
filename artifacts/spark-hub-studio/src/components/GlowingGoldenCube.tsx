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
        faceMaterialRef.current.emissiveIntensity = 0.25;
        if (goldMaterialRef.current) goldMaterialRef.current.emissiveIntensity = 0.12;
      } else if (mode === 'boosted') {
        bloomPassRef.current.strength = 0.75;
        faceMaterialRef.current.emissiveIntensity = 0.65;
        if (goldMaterialRef.current) goldMaterialRef.current.emissiveIntensity = 0.28;
      } else {
        // balanced: elegant, warm, visible but never overblown
        bloomPassRef.current.strength = 0.48;
        faceMaterialRef.current.emissiveIntensity = 0.40;
        if (goldMaterialRef.current) goldMaterialRef.current.emissiveIntensity = 0.18;
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

      const getResponsiveMetrics = (w: number) => {
        const isSmallPhone = w < 480;
        const isPhone = w < 768;
        const isTablet = w < 1024;

        if (isSmallPhone) {
          return {
            scale: 0.28,        // Down drastically to fit small mobile elegantly
            baseX: 0,
            baseY: 0.6,
            camX: 0,
            camY: 0.2,
            camZ: 10.2,
            travelY: 2.2,       // Descent distance when scrolling
          };
        } else if (isPhone) {
          return {
            scale: 0.34,        // Refined size on larger phones
            baseX: 0,
            baseY: 0.5,
            camX: 0,
            camY: 0.22,
            camZ: 9.8,
            travelY: 2.0,
          };
        } else if (isTablet) {
          return {
            scale: 0.50,
            baseX: isRTL ? -1.8 : 1.8,
            baseY: 0.2,
            camX: isRTL ? -2.0 : 2.0,
            camY: 0.25,
            camZ: 9.2,
            travelY: 1.6,
          };
        } else {
          // Desktop (w >= 1024)
          return {
            scale: 0.72,
            baseX: isRTL ? -2.7 : 2.7,
            baseY: 0.1,
            camX: isRTL ? -3.1 : 3.1,
            camY: 0.35,
            camZ: 8.5,
            travelY: 1.5,
          };
        }
      };

      const metrics = getResponsiveMetrics(width);

      const updateCameraLayout = () => {
        const w = window.innerWidth;
        const m = getResponsiveMetrics(w);
        camera.position.set(m.camX, m.camY, m.camZ);
        camera.lookAt(m.baseX * 0.92, 0.05, 0);
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
      renderer.toneMappingExposure = 1.10;

      // 3. Post-processing Composer (Balanced Warm Gold Bloom Pass)
      const renderPass = new RenderPass(scene, camera);
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.48, // Balanced, natural golden bloom
        0.40, // Soft radius
        0.36  // Catches metallic facet edges cleanly without overblowing
      );
      bloomPassRef.current = bloomPass;

      const composer = new EffectComposer(renderer);
      composer.addPass(renderPass);
      composer.addPass(bloomPass);

      // 4. Pure Warm Luxury Gold Lighting (Balanced & Metallic)
      const warmAmbient = new THREE.AmbientLight(0xffeedd, 0.90);
      scene.add(warmAmbient);

      const dirLight1 = new THREE.DirectionalLight(0xffeaad, 2.4);
      dirLight1.position.set(5, 8, 4);
      scene.add(dirLight1);

      // Soft warm rim light
      const rimLightGold = new THREE.PointLight(0xffd277, 1.5, 20);
      rimLightGold.position.set(-6, -2, -4);
      scene.add(rimLightGold);

      // Soft warm fill light
      const fillLight = new THREE.DirectionalLight(0xd99b42, 1.0);
      fillLight.position.set(-4, 5, -2);
      scene.add(fillLight);

      // 5. Rubik's Cube Assembly
      const cubeRootGroup = new THREE.Group();
      cubeRootGroup.scale.set(metrics.scale, metrics.scale, metrics.scale);
      cubeRootGroup.position.set(metrics.baseX, metrics.baseY, 0);
      scene.add(cubeRootGroup);

      const updateCubeRootPosition = () => {
        const w = window.innerWidth;
        const m = getResponsiveMetrics(w);
        cubeRootGroup.scale.set(m.scale, m.scale, m.scale);
        cubeRootGroup.position.x = m.baseX;
      };
      updateCubeRootPosition();

      // 1. خامة الذهب الفاخر البرونزي (Warm Brushed Metallic Gold)
      const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xc8963e,           // درجة ذهب شامبين وبرونز دافئ وأنيق
        emissive: 0x332208,        // توهج كهرماني خافت هادئ
        emissiveIntensity: 0.18,   // تجسيم معدني صريح غير معتم
        metalness: 0.92,           // طابع معدني فاخر
        roughness: 0.20            // ملمس معدن مصقول عاكس
      });
      goldMaterialRef.current = goldMaterial;

      // 2. خامة الحواف والفواصل (Dark Inner Core / Bevel)
      const innerCoreMaterial = new THREE.MeshBasicMaterial({
        color: 0x111115,
      });

      // Luminous Gold Face Plates Material (Warm radiant facet plates)
      const facePlateMaterial = new THREE.MeshStandardMaterial({
        color: 0xd6a44d,
        emissive: 0x664410,        // توهج ذهبي دافئ نقي وواضح
        emissiveIntensity: 0.40,   // متوازن: مضيء بوضوح بدون أن يكون فاقعاً
        metalness: 0.88,
        roughness: 0.16,
      });
      faceMaterialRef.current = facePlateMaterial;

      // Sophisticated metallic outline seams
      const edgeLineMaterial = new THREE.LineBasicMaterial({
        color: 0xdfaa45,
        transparent: true,
        opacity: 0.45,
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
        color: 0xffd255,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
      });

      const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
      const ring2 = new THREE.Mesh(ringGeometry, ringMaterial);
      ring2.rotation.x = Math.PI / 2.3;
      const ring3 = new THREE.Mesh(ringGeometry, ringMaterial);
      ring3.rotation.y = Math.PI / 2.5;

      energySpheresGroup.add(ring1, ring2, ring3);

      // Wireframe geodesic aura sphere in luminous gold
      const sphereGeo = new THREE.IcosahedronGeometry(2.9, 2);
      const sphereWireGeo = new THREE.WireframeGeometry(sphereGeo);
      const sphereWireMat = new THREE.LineBasicMaterial({
        color: 0xffbf30,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
      });
      const wireSphere = new THREE.LineSegments(sphereWireGeo, sphereWireMat);
      energySpheresGroup.add(wireSphere);

      // Golden Dust / Ember Particles (Restored)
      const ENABLE_DUST_PARTICLES = true;
      let particleSwarm: THREE.Points | null = null;

      if (ENABLE_DUST_PARTICLES) {
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
        particleSwarm = new THREE.Points(particleGeo, particleMat);
        cubeRootGroup.add(particleSwarm);
      }

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

      // 8. Scroll Tracking (Cube travels down with page scroll)
      let currentScrollY = window.scrollY;
      let targetScrollY = window.scrollY;

      const handleScroll = () => {
        targetScrollY = window.scrollY;
      };
      window.addEventListener('scroll', handleScroll, { passive: true });

      // 9. Resize Handling
      const handleResize = () => {
        if (!container) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        composer.setSize(w, h);
        updateCameraLayout();
        updateCubeRootPosition();
      };
      window.addEventListener('resize', handleResize);

      // 10. Animation Loop
      let animationFrameId: number;
      const clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Smooth scroll interpolation
        currentScrollY += (targetScrollY - currentScrollY) * 0.08;
        const scrollDelta = targetScrollY - currentScrollY;

        // Idle orbit rotation + subtle scroll spin
        if (!isDragging) {
          targetRotationRef.current.y += 0.0030 + scrollDelta * 0.0006;
          targetRotationRef.current.x += Math.sin(elapsedTime * 0.5) * 0.0005 + scrollDelta * 0.0003;
        }

        // Smooth damping / inertia
        cubeRootGroup.rotation.y += (targetRotationRef.current.y - cubeRootGroup.rotation.y) * 0.06;
        cubeRootGroup.rotation.x += (targetRotationRef.current.x - cubeRootGroup.rotation.x) * 0.06;

        // Subtle mouse parallax follow
        mouseParallax.x += (mouseParallax.targetX - mouseParallax.x) * 0.04;
        mouseParallax.y += (mouseParallax.targetY - mouseParallax.y) * 0.04;

        const w = window.innerWidth;
        const m = getResponsiveMetrics(w);
        camera.position.x = m.camX + mouseParallax.x * 0.5;

        // Scroll descent: As the user scrolls down, cube descends with the content
        const scrollProgress = Math.min(1.0, Math.max(0, currentScrollY / 1000));
        const descentY = scrollProgress * m.travelY;

        // Gentle floating levitation + scroll descent
        cubeRootGroup.position.x = m.baseX;
        cubeRootGroup.position.y = m.baseY - descentY + Math.sin(elapsedTime * 1.5) * 0.06;

        // Orbital energy rings counter-rotation
        ring1.rotation.z = elapsedTime * 0.22;
        ring2.rotation.y = elapsedTime * 0.18;
        ring3.rotation.x = -elapsedTime * 0.2;
        wireSphere.rotation.y = elapsedTime * 0.06;

        // Swirling dust particles (if active)
        if (particleSwarm) {
          particleSwarm.rotation.y = -elapsedTime * 0.05;
        }

        // Hide cube smoothly when approaching the footer so the footer remains 100% clear
        const footerEl = document.querySelector('footer');
        let cubeOpacity = 1;
        if (footerEl) {
          const rect = footerEl.getBoundingClientRect();
          const vh = window.innerHeight;
          if (rect.top < vh + 120) {
            cubeOpacity = Math.max(0, Math.min(1, (rect.top - 60) / 220));
          }
        }
        renderer.domElement.style.opacity = String(cubeOpacity);

        composer.render();
      };
      animate();

      // Cleanup
      return () => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        renderer.dispose();
      };
    }, [isRTL]);

    return (
      <div
        ref={containerRef}
        className={`fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 ${className}`}
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
