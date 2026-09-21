'use client';

import { useEffect, useRef } from 'react';
import type * as THREE from 'three';

/**
 * Auth3DScene: An interactive procedural Three.js educational 3D scene
 * designed specifically for authentication and public portals.
 * Renders an animated golden armillary sphere with knowledge crystal,
 * orbital rings, and responsive mouse parallax in the strict solid palette:
 * - Golden Bronze (#CCA43B)
 * - Jet Black (#242F40)
 * - Graphite (#363636)
 * - White (#FFFFFF)
 */
export function Auth3DScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDisposed = false;
    let animFrameId: number;

    async function initThree() {
      try {
        const THREE = await import('three');
        if (isDisposed || !container) return;

        const width = container.clientWidth || 400;
        const height = container.clientHeight || 500;

        // Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 28);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Root 3D group
        const group = new THREE.Group();
        scene.add(group);

        // 1. Central Knowledge Core: Dodecahedron in Jet Black (#242F40) with subtle bronze wireframe
        const coreGeometry = new THREE.DodecahedronGeometry(4.2, 0);
        const coreMaterial = new THREE.MeshStandardMaterial({
          color: 0x242f40,
          roughness: 0.25,
          metalness: 0.9,
          wireframe: false,
        });
        const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
        group.add(coreMesh);

        // Golden wireframe overlay on the core
        const wireGeometry = new THREE.WireframeGeometry(coreGeometry);
        const wireMaterial = new THREE.LineBasicMaterial({
          color: 0xcca43b,
          transparent: true,
          opacity: 0.85,
          linewidth: 1.5,
        });
        const wireLines = new THREE.LineSegments(wireGeometry, wireMaterial);
        coreMesh.add(wireLines);

        // 2. Primary Armillary Ring (Equatorial - Golden Bronze #CCA43B)
        const ring1Geometry = new THREE.TorusGeometry(8.5, 0.12, 16, 100);
        const goldMaterial = new THREE.MeshStandardMaterial({
          color: 0xcca43b,
          roughness: 0.2,
          metalness: 0.95,
        });
        const ring1 = new THREE.Mesh(ring1Geometry, goldMaterial);
        group.add(ring1);

        // 3. Secondary Armillary Ring (Meridian - 60 deg tilted)
        const ring2Geometry = new THREE.TorusGeometry(9.8, 0.1, 16, 100);
        const ring2 = new THREE.Mesh(ring2Geometry, goldMaterial);
        ring2.rotation.x = Math.PI / 3;
        ring2.rotation.y = Math.PI / 4;
        group.add(ring2);

        // 4. Tertiary Outer Orbital Ring (90 deg tilted)
        const ring3Geometry = new THREE.TorusGeometry(11.2, 0.08, 16, 100);
        const ring3 = new THREE.Mesh(ring3Geometry, goldMaterial);
        ring3.rotation.x = -Math.PI / 4;
        ring3.rotation.z = Math.PI / 6;
        group.add(ring3);

        // 5. Orbiting Knowledge Satellites (Small spheres on rings)
        const satelliteGeo = new THREE.SphereGeometry(0.55, 16, 16);
        const satelliteMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xcca43b,
          emissiveIntensity: 0.6,
          roughness: 0.1,
          metalness: 0.8,
        });

        const satellites: THREE.Mesh[] = [];
        for (let i = 0; i < 4; i++) {
          const sat = new THREE.Mesh(satelliteGeo, satelliteMat);
          satellites.push(sat);
          group.add(sat);
        }

        // 6. Floating Constellation Dust Particles
        const particleCount = 80;
        const particlePositions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
          const radius = 12 + Math.random() * 8;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
          particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          particlePositions[i * 3 + 2] = radius * Math.cos(phi);
        }
        const particlesGeometry = new THREE.BufferGeometry();
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        const particlesMaterial = new THREE.PointsMaterial({
          color: 0xcca43b,
          size: 0.28,
          transparent: true,
          opacity: 0.75,
        });
        const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
        group.add(particleSystem);

        // 7. Balanced Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xcca43b, 3.2);
        keyLight.position.set(15, 12, 18);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 1.8);
        fillLight.position.set(-15, -10, -10);
        scene.add(fillLight);

        // Interactive mouse parallax
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        const onMouseMove = (e: MouseEvent) => {
          const rect = container.getBoundingClientRect();
          mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
          mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        };
        window.addEventListener('mousemove', onMouseMove, { passive: true });

        // Responsive resize
        const onResize = () => {
          if (!container || isDisposed) return;
          const w = container.clientWidth || 400;
          const h = container.clientHeight || 500;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);

        // Animation clock
        const clock = new THREE.Clock();

        const animate = () => {
          if (isDisposed) return;
          animFrameId = requestAnimationFrame(animate);

          const elapsedTime = clock.getElapsedTime();
          const delta = clock.getDelta();

          // Smooth lerp for mouse parallax
          targetX += (mouseX - targetX) * 0.04;
          targetY += (mouseY - targetY) * 0.04;

          // Rotation of main elements
          group.rotation.y = elapsedTime * 0.12 + targetX * 0.35;
          group.rotation.x = Math.sin(elapsedTime * 0.1) * 0.08 - targetY * 0.35;

          coreMesh.rotation.y -= 0.006;
          coreMesh.rotation.x += 0.004;

          ring1.rotation.z += 0.008;
          ring2.rotation.z -= 0.006;
          ring3.rotation.y += 0.007;

          // Orbit satellites along mathematical paths
          satellites[0].position.set(
            Math.cos(elapsedTime * 0.9) * 8.5,
            Math.sin(elapsedTime * 0.9) * 8.5,
            0
          );
          satellites[1].position.set(
            Math.cos(elapsedTime * 0.7 + 1.5) * 9.8,
            Math.sin(elapsedTime * 0.7 + 1.5) * 9.8 * 0.5,
            Math.sin(elapsedTime * 0.7 + 1.5) * 9.8 * 0.866
          );
          satellites[2].position.set(
            Math.cos(elapsedTime * 0.6 + 3.0) * 11.2 * 0.7,
            Math.sin(elapsedTime * 0.6 + 3.0) * 11.2,
            Math.cos(elapsedTime * 0.6 + 3.0) * 11.2 * 0.7
          );
          satellites[3].position.set(
            0,
            Math.cos(elapsedTime * 0.8 + 4.5) * 6.5,
            Math.sin(elapsedTime * 0.8 + 4.5) * 6.5
          );

          particleSystem.rotation.y = elapsedTime * 0.02;

          renderer.render(scene, camera);
        };

        animate();

        return () => {
          isDisposed = true;
          cancelAnimationFrame(animFrameId);
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('resize', onResize);
          if (renderer.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
          renderer.dispose();
          coreGeometry.dispose();
          coreMaterial.dispose();
          wireGeometry.dispose();
          wireMaterial.dispose();
          ring1Geometry.dispose();
          ring2Geometry.dispose();
          ring3Geometry.dispose();
          goldMaterial.dispose();
          satelliteGeo.dispose();
          satelliteMat.dispose();
          particlesGeometry.dispose();
          particlesMaterial.dispose();
        };
      } catch {
        // Graceful fallback if WebGL or Three.js import fails
      }
    }

    const cleanupPromise = initThree();

    return () => {
      isDisposed = true;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      cleanupPromise.then((cleanup) => {
        if (typeof cleanup === 'function') cleanup();
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    />
  );
}
