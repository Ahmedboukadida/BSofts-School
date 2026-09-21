'use client';

import { useEffect, useRef } from 'react';

export function Hero3DScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDisposed = false;
    let animFrameId: number;

    // Check if WebGL & Three.js can be dynamically loaded
    async function initThree() {
      try {
        const THREE = await import('three');
        if (isDisposed || !container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.position.z = 32;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Group to hold all 3D educational shapes
        const mainGroup = new THREE.Group();
        scene.add(mainGroup);

        // 1. Central Wireframe Icosahedron (knowledge crystal in Golden Bronze #CCA43B)
        const icosaGeometry = new THREE.IcosahedronGeometry(10, 1);
        const icosaMaterial = new THREE.MeshStandardMaterial({
          color: 0xcca43b,
          wireframe: true,
          transparent: true,
          opacity: 0.45,
          roughness: 0.2,
          metalness: 0.85,
        });
        const icosaMesh = new THREE.Mesh(icosaGeometry, icosaMaterial);
        mainGroup.add(icosaMesh);

        // 2. Inner Core Dodecahedron (Jet Black #242F40 with Golden Bronze edge glow)
        const coreGeometry = new THREE.DodecahedronGeometry(5, 0);
        const coreMaterial = new THREE.MeshStandardMaterial({
          color: 0x242f40,
          wireframe: true,
          transparent: true,
          opacity: 0.65,
          emissive: 0xcca43b,
          emissiveIntensity: 0.35,
        });
        const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
        mainGroup.add(coreMesh);

        // 3. Surrounding Floating Constellation Particles
        const particleCount = 120;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const scales = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
          const u = Math.random();
          const v = Math.random();
          const theta = u * 2.0 * Math.PI;
          const phi = Math.acos(2.0 * v - 1.0);
          const r = Math.cbrt(Math.random()) * 22 + 8;
          const sinPhi = Math.sin(phi);

          positions[i * 3] = r * sinPhi * Math.cos(theta);
          positions[i * 3 + 1] = r * sinPhi * Math.sin(theta);
          positions[i * 3 + 2] = r * Math.cos(phi);
          scales[i] = Math.random() * 2 + 1;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMaterial = new THREE.PointsMaterial({
          color: 0xcca43b,
          size: 0.35,
          transparent: true,
          opacity: 0.7,
          blending: THREE.AdditiveBlending,
        });

        const points = new THREE.Points(particleGeometry, particleMaterial);
        mainGroup.add(points);

        // 4. Ambient & Directional Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0xcca43b, 3.0, 55);
        pointLight1.position.set(15, 12, 10);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x242f40, 2.5, 55);
        pointLight2.position.set(-15, -10, 12);
        scene.add(pointLight2);

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

        // Resize handler
        const onResize = () => {
          if (!container) return;
          const w = container.clientWidth;
          const h = container.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);

        // Animation Loop
        const clock = new THREE.Clock();
        const animate = () => {
          if (isDisposed) return;
          animFrameId = requestAnimationFrame(animate);

          const delta = clock.getDelta();
          targetX += (mouseX - targetX) * 0.05;
          targetY += (mouseY - targetY) * 0.05;

          mainGroup.rotation.y += delta * 0.15 + targetX * 0.02;
          mainGroup.rotation.x += delta * 0.08 + targetY * 0.02;
          coreMesh.rotation.y -= delta * 0.25;
          coreMesh.rotation.z += delta * 0.15;

          renderer.render(scene, camera);
        };
        animate();

        return () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('resize', onResize);
          if (renderer.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
          renderer.dispose();
          icosaGeometry.dispose();
          coreGeometry.dispose();
          particleGeometry.dispose();
        };
      } catch {
        // Fallback: 2D Canvas 3D particle constellation if WebGL/Three fails
        initCanvasFallback();
      }
    }

    function initCanvasFallback() {
      if (!container || isDisposed) return;
      const canvas = document.createElement('canvas');
      container.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const resize = () => {
        canvas.width = container.clientWidth * window.devicePixelRatio;
        canvas.height = container.clientHeight * window.devicePixelRatio;
        canvas.style.width = `${container.clientWidth}px`;
        canvas.style.height = `${container.clientHeight}px`;
      };
      resize();
      window.addEventListener('resize', resize);

      const nodes: { x: number; y: number; z: number; vx: number; vy: number; vz: number }[] = [];
      for (let i = 0; i < 40; i++) {
        nodes.push({
          x: (Math.random() - 0.5) * 400,
          y: (Math.random() - 0.5) * 400,
          z: (Math.random() - 0.5) * 400,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          vz: (Math.random() - 0.5) * 0.5,
        });
      }

      const draw = () => {
        if (isDisposed) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const fov = 350;

        ctx.strokeStyle = 'rgba(204, 164, 59, 0.25)';
        ctx.fillStyle = 'rgba(204, 164, 59, 0.75)';

        nodes.forEach((n) => {
          n.x += n.vx;
          n.y += n.vy;
          n.z += n.vz;
          if (n.x > 200 || n.x < -200) n.vx *= -1;
          if (n.y > 200 || n.y < -200) n.vy *= -1;
          if (n.z > 200 || n.z < -200) n.vz *= -1;

          const scale = fov / (fov + n.z + 200);
          const px = cx + n.x * scale;
          const py = cy + n.y * scale;

          ctx.beginPath();
          ctx.arc(px, py, Math.max(1, 3 * scale), 0, Math.PI * 2);
          ctx.fill();
        });

        animFrameId = requestAnimationFrame(draw);
      };
      draw();
    }

    let cleanup: (() => void) | void;
    initThree().then((res) => {
      cleanup = res;
    });

    return () => {
      isDisposed = true;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-85 transition-opacity duration-700"
      aria-hidden="true"
    />
  );
}
