import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { CalculationResult } from '../types';

interface Props {
  result: CalculationResult;
  theme: 'dark' | 'light';
}

const MAX_RENDERED_CARTONS = 4000;

export function Container3D({ result, theme }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme === 'dark' ? 0x0b1220 : 0xf6f7fb);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const { container, bestOrientation, mixed } = result;
    const L = container.internalLengthCm;
    const W = container.internalWidthCm;
    const H = container.internalHeightCm;
    const maxDim = Math.max(L, W, H);
    const scale = 300 / maxDim; // normalize so the container fits a ~300 unit scene

    // Container wireframe
    const containerGeo = new THREE.BoxGeometry(L * scale, H * scale, W * scale);
    const edges = new THREE.EdgesGeometry(containerGeo);
    const wireframe = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: theme === 'dark' ? 0x5b6bf5 : 0x5b6bf5, transparent: true, opacity: 0.6 })
    );
    scene.add(wireframe);

    // Floor grid for spatial reference
    const grid = new THREE.GridHelper(Math.max(L, W) * scale * 1.4, 12, 0x8891ab, theme === 'dark' ? 0x24304a : 0xe6e8f0);
    grid.position.y = (-H * scale) / 2;
    scene.add(grid);

    const [dx, dy, dz] = bestOrientation.dims;
    const cartonW = dx * scale;
    const cartonH = dz * scale;
    const cartonD = dy * scale;

    const originX = (-L * scale) / 2;
    const originY = (-H * scale) / 2;
    const originZ = (-W * scale) / 2;

    // Base orientation instanced cartons (loaded)
    const baseCount = Math.min(bestOrientation.totalCartons, MAX_RENDERED_CARTONS);
    if (baseCount > 0) {
      const geo = new THREE.BoxGeometry(cartonW * 0.94, cartonH * 0.94, cartonD * 0.94);
      const mat = new THREE.MeshStandardMaterial({ color: 0x5b6bf5, roughness: 0.6, metalness: 0.05 });
      const mesh = new THREE.InstancedMesh(geo, mat, baseCount);
      const dummy = new THREE.Object3D();
      let i = 0;
      outer: for (let hz = 0; hz < bestOrientation.fitHeight; hz++) {
        for (let wy = 0; wy < bestOrientation.fitWidth; wy++) {
          for (let lx = 0; lx < bestOrientation.fitLength; lx++) {
            if (i >= baseCount) break outer;
            dummy.position.set(
              originX + lx * cartonW + cartonW / 2,
              originY + hz * cartonH + cartonH / 2,
              originZ + wy * cartonD + cartonD / 2
            );
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
            i++;
          }
        }
      }
      scene.add(mesh);
    }

    // Represent the mixed-orientation gap-fill cartons as a distinct-colored slab near the length end,
    // proportional to how many additional cartons were found (illustrative, not exact placement).
    if (mixed.additionalCartons > 0) {
      const usedLength = bestOrientation.fitLength * dx;
      const remaining = L - usedLength;
      if (remaining > 1) {
        const slabGeo = new THREE.BoxGeometry(remaining * scale * 0.94, H * scale * 0.94, W * scale * 0.94);
        const slabMat = new THREE.MeshStandardMaterial({ color: 0x22c1a3, roughness: 0.6, transparent: true, opacity: 0.55 });
        const slab = new THREE.Mesh(slabGeo, slabMat);
        slab.position.set(originX + usedLength * scale + (remaining * scale) / 2, 0, 0);
        scene.add(slab);
      }
    }

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(200, 300, 200);
    scene.add(dir);

    camera.position.set(maxDim * scale * 0.9, maxDim * scale * 0.7, maxDim * scale * 1.1);
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 50;
    controls.maxDistance = maxDim * scale * 4;

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.InstancedMesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [result, theme]);

  const truncated = result.bestOrientation.totalCartons > MAX_RENDERED_CARTONS;

  return (
    <div className="rounded-2xl border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary">3D Load Visualization</h3>
          <p className="text-xs text-text-muted-light dark:text-text-muted">Drag to rotate · scroll to zoom · right-click to pan</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-accent inline-block" /> Loaded</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-accent-2 inline-block" /> Gap-fill zone</span>
        </div>
      </div>
      <div ref={mountRef} className="w-full h-[360px] rounded-xl overflow-hidden" />
      {truncated && (
        <p className="text-xs text-text-muted-light dark:text-text-muted mt-2">
          Showing {MAX_RENDERED_CARTONS.toLocaleString()} of {result.bestOrientation.totalCartons.toLocaleString()} cartons for rendering performance — figures elsewhere reflect the full count.
        </p>
      )}
    </div>
  );
}
