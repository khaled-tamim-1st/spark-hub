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
    const targetRotationRef = useRef({ x: 0.35, y: isRTL ? 0.6 : -0.6 });
    const currentGlowModeRef = useRef<GlowMode>(glowMode);

    const applyGlowMode = (mode: GlowMode) => {
      currentGlowModeRef.current = mode;
      if (!bloomPassRef.current || !faceMaterialRef.current) return;

      if (mode === 'subtle') {
        bloomPassRef.current.strength = 0.6;
        faceMaterialRef.current.emissiveIntensity = 0.6;
      } else if (mode === 'boosted') {
        bloomPassRef.current.strength = 1.6;
        faceMaterialRef.current.emissiveIntensity = 1.8;
      } else {
        // balanced
        bloomPassRef.current.strength = 1.15;
        faceMaterialRef.current.emissiveIntensity = 1.15;
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
      scene.fog = new THREE.FogExp2(0x06080d, 0.025);

      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);

      const updateCameraLayout = () => {
        const w = container.clientWidth || window.innerWidth;
        const isMobile = w < 1024;
        if (isMobile) {
          camera.position.set(0, 0.8, 9.5);
          camera.lookAt(0, 0.4, 0);
        } else {
          // Centered toward target hemisphere
          const targetX = isRTL ? -2.4 : 2.4;
          camera.position.set(isRTL ? -2.8 : 2.8, 0.4, 8.2);
          camera.lookAt(targetX * 0.9, 0, 0);
        }
      };
      updateCameraLayout();

      // 2. WebGL Renderer
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      // 3. Post-processing Composer (UnrealBloomPass)
      const renderPass = new RenderPass(scene, camera);
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        1.15, // Balanced bloom strength
        0.5,  // Smooth diffusion radius
        0.28  // Threshold
      );
      bloomPassRef.current = bloomPass;

      const composer = new EffectComposer(renderer);
      composer.addPass(renderPass);
      composer.addPass(bloomPass);

      // 4. Lighting Orchestration
      const ambientLight = new THREE.AmbientLight(0xffeedd, 0.95);
      scene.add(ambientLight);

      const coreInnerLight = new THREE.PointLight(0xffb833, 2.2, 14);
      coreInnerLight.position.set(0, 0, 0);
      scene.add(coreInnerLight);

      const sunKeyLight = new THREE.DirectionalLight(0xffe899, 2.2);
      sunKeyLight.position.set(6, 8, 8);
      scene.add(sunKeyLight);

      const rimLight = new THREE.DirectionalLight(0xff9922, 2.4);
      rimLight.position.set(-8, -4, -6);
      scene.add(rimLight);

      // 5. Rubik's Cube Assembly
      const cubeRootGroup = new THREE.Group();
      scene.add(cubeRootGroup);

      const updateCubeRootPosition = () => {
        const w = container.clientWidth || window.innerWidth;
        if (w < 1024) {
          cubeRootGroup.position.set(0, 0.4, 0);
        } else {
          cubeRootGroup.position.set(isRTL ? -2.4 : 2.4, 0.1, 0);
        }
      };
      updateCubeRootPosition();

      // Premium Brushed Gold Material
      const goldMetalMaterial = new THREE.MeshStandardMaterial({
        color: 0xdf9e14,
        metalness: 0.94,
        roughness: 0.24,
        emissive: 0x4d2800,
        emissiveIntensity: 0.2,
      });

      // Luminous Gold Face Plates Material
      const luminousGoldFaceMaterial = new THREE.MeshStandardMaterial({
        color: 0xffe28a,
        emissive: 0xec9900,
        emissiveIntensity: 1.15,
        metalness: 0.72,
        roughness: 0.18,
      });
      faceMaterialRef.current = luminousGoldFaceMaterial;

      // Neon Outlines Material
      const edgeLineMaterial = new THREE.LineBasicMaterial({
        color: 0xffdf80,
        transparent: true,
        opacity: 0.45,
      });

      const cubieSize = 0.84;
      const spacing = 0.90;
      const cubieGeometry = new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize);
      const facePlateGeometry = new THREE.PlaneGeometry(cubieSize * 0.74, cubieSize * 0.74);
      const cubieEdgeGeometry = new THREE.EdgesGeometry(cubieGeometry);

      function attachFace(parent: THREE.Mesh, pos: [number, number, number], rot: [number, number, number]) {
        const plate = new THREE.Mesh(facePlateGeometry, luminousGoldFaceMaterial);
        plate.position.set(...pos);
        plate.rotation.set(...rot);
        parent.add(plate);
      }

      // Generate 27 cubies (3x3x3)
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            const cubie = new THREE.Mesh(cubieGeometry, goldMetalMaterial);
            cubie.position.set(x * spacing, y * spacing, z * spacing);

            const line = new THREE.LineSegments(cubieEdgeGeometry, edgeLineMaterial);
            cubie.add(line);

            // Attach radiant glowing plates on outer exposed faces
            const offset = cubieSize / 2 + 0.006;
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

      const ringGeometry = new THREE.RingGeometry(2.7, 2.76, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffcf44,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      });

      const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
      const ring2 = new THREE.Mesh(ringGeometry, ringMaterial);
      ring2.rotation.x = Math.PI / 2.3;
      const ring3 = new THREE.Mesh(ringGeometry, ringMaterial);
      ring3.rotation.y = Math.PI / 2.5;

      energySpheresGroup.add(ring1, ring2, ring3);

      // Wireframe geodesic aura sphere
      const sphereGeo = new THREE.IcosahedronGeometry(2.9, 2);
      const sphereWireGeo = new THREE.WireframeGeometry(sphereGeo);
      const sphereWireMat = new THREE.LineBasicMaterial({
        color: 0xffbd1e,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
      });
      const wireSphere = new THREE.LineSegments(sphereWireGeo, sphereWireMat);
      energySpheresGroup.add(wireSphere);

      // Golden Dust / Ember Particles
      const particleCount = 140;
      const particleGeo = new THREE.BufferGeometry();
      const posArray = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        const radius = 2.2 + Math.random() * 3.8;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
        posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        posArray[i + 2] = radius * Math.cos(phi);
      }

      particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0xffe277,
        size: 0.05,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const particleSwarm = new THREE.Points(particleGeo, particleMat);
      cubeRootGroup.add(particleSwarm);

      // 7. Interactive Touch & Mouse Drag Rotation with Inertia
      let isDragging = false;
      let previousPointerPosition = { x: 0, y: 0 };
      const mouseParallax = { x: 0, y: 0, targetX: 0, targetY: 0 };

      const onPointerDown = (e: PointerEvent) => {
        isDragging = true;
        previousPointerPosition = { x: e.clientX, y: e.clientY };
      };

      const onPointerMove = (e: PointerEvent) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        mouseParallax.targetX = (e.clientX / w - 0.5) * 0.4;
        mouseParallax.targetY = (e.clientY / h - 0.5) * 0.4;

        if (!isDragging) return;

        const deltaX = e.clientX - previousPointerPosition.x;
        const deltaY = e.clientY - previousPointerPosition.y;

        targetRotationRef.current.y += deltaX * 0.008;
        targetRotationRef.current.x += deltaY * 0.008;

        previousPointerPosition = { x: e.clientX, y: e.clientY };
      };

      const onPointerUp = () => {
        isDragging = false;
      };

      window.addEventListener('pointerdown', onPointerDown);
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
          targetRotationRef.current.y += 0.0035;
          targetRotationRef.current.x += Math.sin(elapsedTime * 0.6) * 0.0008;
        }

        // Smooth damping / inertia
        cubeRootGroup.rotation.y += (targetRotationRef.current.y - cubeRootGroup.rotation.y) * 0.06;
        cubeRootGroup.rotation.x += (targetRotationRef.current.x - cubeRootGroup.rotation.x) * 0.06;

        // Mouse Parallax follow
        mouseParallax.x += (mouseParallax.targetX - mouseParallax.x) * 0.05;
        mouseParallax.y += (mouseParallax.targetY - mouseParallax.y) * 0.05;

        const baseCamX = window.innerWidth < 1024 ? 0 : (isRTL ? -2.8 : 2.8);
        camera.position.x += (mouseParallax.x * 0.8 - (camera.position.x - baseCamX)) * 0.05;

        // Gentle levitation float
        const baseCubeY = window.innerWidth < 1024 ? 0.4 : 0.1;
        cubeRootGroup.position.y += (Math.sin(elapsedTime * 1.6) * 0.12 - (cubeRootGroup.position.y - baseCubeY)) * 0.1;

        // Orbital energy rings counter-rotation
        ring1.rotation.z = elapsedTime * 0.25;
        ring2.rotation.y = elapsedTime * 0.2;
        ring3.rotation.x = -elapsedTime * 0.22;
        wireSphere.rotation.y = elapsedTime * 0.08;

        // Swirling gold dust
        particleSwarm.rotation.y = -elapsedTime * 0.06;

        composer.render();
      };
      animate();

      // Cleanup
      return () => {
        window.removeEventListener('pointerdown', onPointerDown);
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
        className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-auto ${className}`}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
        />
      </div>
    );
  }
);

GlowingGoldenCube.displayName = 'GlowingGoldenCube';

export default GlowingGoldenCube;
