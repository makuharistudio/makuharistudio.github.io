// bg-solid-dark.js
// Ultra-lightweight solid black background for dark-theme game routes

import * as THREE from 'three';

export function initialiseBackground(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: 'low-power',
    alpha: false,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(1);
  container.appendChild(renderer.domElement);
  renderer.render(scene, camera);

  const handleResize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.render(scene, camera);
  };

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode) {
      container.removeChild(renderer.domElement);
    }
  };
}