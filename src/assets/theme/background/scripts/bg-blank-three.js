// bg-blank.js
// Ultra-lightweight solid white background — zero animation, minimal GPU usage

import * as THREE from 'three';

export function initialiseBackground(container) {
  // ── Scene setup ─────────────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff); // pure white

  // ── Camera (minimal — we don't even move it) ────────────────────────────────
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5; // arbitrary — doesn't really matter for solid color

  // ── Renderer ────────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    antialias: false,             // saves a tiny bit of perf
    powerPreference: "low-power", // hint to use integrated GPU if possible
    alpha: false
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(1);      // ← important: don't use device pixel ratio
  container.appendChild(renderer.domElement);

  // Just render once — no animation loop needed for solid color
  renderer.render(scene, camera);

  // ── Resize handler ──────────────────────────────────────────────────────────
  const handleResize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.render(scene, camera); // re-render on resize only
  };

  window.addEventListener('resize', handleResize);

  // ── Cleanup function ────────────────────────────────────────────────────────
  return () => {
    window.removeEventListener('resize', handleResize);
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode) {
      container.removeChild(renderer.domElement);
    }
  };
}