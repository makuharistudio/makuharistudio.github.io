// bg-space-earth.js
import * as THREE from 'three';
import { 
  star, 
  earth_mosaic_1, 
  earth_mosaic_2_specular, 
  earth_mosaic_3_bump, 
  earth_mosaic_4_lights, 
  earth_mosaic_5_clouds, 
  earth_mosaic_6_clouds_transparent,
  moon_luna_mosaic_1,
  moon_luna_mosaic_3_bump
} from '../../../../data/assets.js';

function getStarfield({ numStars = 1200, radius = 200, exclusionRadius = 60 } = {}) {
  function randomSpherePoint() {
    let r;
    do {
      r = Math.random() * radius * 1.5;
    } while (r < (exclusionRadius * 1.25));
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    let x = r * Math.sin(phi) * Math.cos(theta);
    let y = r * Math.sin(phi) * Math.sin(theta);
    let z = r * Math.cos(phi);
    return { pos: new THREE.Vector3(x, y, z), hue: 0.6, minDist: r };
  }

  const verts = [];
  const colors = [];
  for (let i = 0; i < numStars; i++) {
    const p = randomSpherePoint();
    const col = new THREE.Color().setHSL(p.hue, 0.2, Math.random() * 0.7 + 0.3);
    verts.push(p.pos.x, p.pos.y, p.pos.z);
    colors.push(col.r, col.g, col.b);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const texture = new THREE.TextureLoader().load(star);
  texture.colorSpace = THREE.SRGBColorSpace;

  const mat = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    map: texture,
    transparent: true,
    alphaTest: 0.08,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geo, mat);
}

function getFresnelMat({ rimHex = 0x3399ff, facingHex = 0x000000 } = {}) {
  const uniforms = {
    color1: { value: new THREE.Color(rimHex) },
    color2: { value: new THREE.Color(facingHex) },
    fresnelBias: { value: 0.08 },
    fresnelScale: { value: 1.1 },
    fresnelPower: { value: 3.8 },
  };

  const vs = `
    uniform float fresnelBias;
    uniform float fresnelScale;
    uniform float fresnelPower;
    varying float vReflectionFactor;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
      vec3 I = worldPosition.xyz - cameraPosition;
      vReflectionFactor = fresnelBias + fresnelScale * pow(1.0 + dot(normalize(I), worldNormal), fresnelPower);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fs = `
    uniform vec3 color1;
    uniform vec3 color2;
    varying float vReflectionFactor;
    void main() {
      float f = clamp(vReflectionFactor, 0.0, 1.0);
      gl_FragColor = vec4(mix(color2, color1, f), f * 0.85);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vs,
    fragmentShader: fs,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });
}

function getBackground() {
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    uniform float time;
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) +
             (c - a) * u.y * (1.0 - u.x) +
             (d - b) * u.x * u.y;
    }
    void main() {
      vec2 scaledUv = vUv * 30.0;
      float n1 = noise(scaledUv + vec2(time * 0.1, 0.0));
      float n2 = noise(scaledUv + vec2(0.0, time * 0.1));
      float n = noise(scaledUv + vec2(n1, n2));
      vec3 color1 = vec3(0.0, 0.04, 0.08);
      vec3 color2 = vec3(0.004, 0.012, 0.016);
      vec3 color3 = vec3(0.009, 0.009, 0.009);
      vec3 color = mix(color1, color2, n);
      color = mix(color, color3, n * 0.5);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const geometry = new THREE.SphereGeometry(1000, 16, 12);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { time: { value: 0.0 } },
    side: THREE.BackSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  return { mesh, update: (t) => { material.uniforms.time.value = t; } };
}

function initialiseBackground(container) {
  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  container.appendChild(renderer.domElement);

  // Background
  const bg = getBackground();
  scene.add(bg.mesh);

  // Stars
  const stars = getStarfield({ numStars: 3000, radius: 200, exclusionRadius: 100 });
  scene.add(stars);

  // Sun group + visible sun mesh + light
  const sunGroup = new THREE.Group();
  sunGroup.rotation.z = -3.4 * Math.PI / 180;
  scene.add(sunGroup);

  const sunGeometry = new THREE.SphereGeometry(3.2, 32, 24);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1,
  });
  const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
  sunGroup.add(sunMesh);

  const sunGlow = getFresnelMat({ rimHex: 0xffffcc, facingHex: 0xffdd44 });
  const sunGlowMesh = new THREE.Mesh(sunGeometry, sunGlow);
  sunGlowMesh.scale.setScalar(1.18);
  sunGroup.add(sunGlowMesh);

  const sunLight = new THREE.PointLight(0xffffff, 2200, 0);
  sunLight.decay = 1.5;
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  // Earth system
  const earthGroup = new THREE.Group();
  scene.add(earthGroup);

  const earthDetail = 22;
  const loader = new THREE.TextureLoader();

  const earthGeometry = new THREE.IcosahedronGeometry(1, earthDetail);

  const earthMaterial = new THREE.MeshPhongMaterial({
    map: loader.load(earth_mosaic_1),
    specularMap: loader.load(earth_mosaic_2_specular),
    bumpMap: loader.load(earth_mosaic_3_bump),
    bumpScale: 0.035,
    shininess: 12,
  });
  const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
  earthGroup.add(earthMesh);
  earthMesh.rotation.x = Math.PI / 2;

  const nightLights = new THREE.MeshBasicMaterial({
    map: loader.load(earth_mosaic_4_lights),
    blending: THREE.AdditiveBlending,
  });
  const nightMesh = new THREE.Mesh(earthGeometry, nightLights);
  earthGroup.add(nightMesh);
  nightMesh.rotation.x = Math.PI / 2;

  const cloudsMat = new THREE.MeshStandardMaterial({
    map: loader.load(earth_mosaic_5_clouds),
    transparent: true,
    opacity: 0.85,
    alphaMap: loader.load(earth_mosaic_6_clouds_transparent),
    blending: THREE.AdditiveBlending,
  });
  const clouds = new THREE.Mesh(earthGeometry, cloudsMat);
  clouds.scale.setScalar(1.004);
  earthGroup.add(clouds);
  clouds.rotation.x = Math.PI / 2;

  const glow = getFresnelMat({ rimHex: 0x88ccff });
  const glowMesh = new THREE.Mesh(earthGeometry, glow);
  glowMesh.scale.setScalar(1.012);
  earthGroup.add(glowMesh);
  glowMesh.rotation.x = Math.PI / 2;

  earthGroup.scale.setScalar(5.8);

  // ────────────────────────────────────────────────────────────────
  // Moon (named moonluna for future-proofing)
  // ────────────────────────────────────────────────────────────────
  const moonlunaGroup = new THREE.Group();
  earthGroup.add(moonlunaGroup);

  const moonlunaRadius = 1 / 3.67; // ≈ 0.272 × Earth radius (before group scaling)
  const moonlunaGeometry = new THREE.IcosahedronGeometry(moonlunaRadius, 12);

  const moonlunaMaterial = new THREE.MeshPhongMaterial({
    map: loader.load(moon_luna_mosaic_1),
    bumpMap: loader.load(moon_luna_mosaic_3_bump),
    bumpScale: 0.06,
    shininess: 5,
  });

  const moonlunaMesh = new THREE.Mesh(moonlunaGeometry, moonlunaMaterial);
  moonlunaGroup.add(moonlunaMesh);

  // Optional subtle rim lighting
  const moonlunaGlow = getFresnelMat({ rimHex: 0xaaaaaa, facingHex: 0x000000 });
  const moonlunaGlowMesh = new THREE.Mesh(moonlunaGeometry, moonlunaGlow);
  moonlunaGlowMesh.scale.setScalar(1.04);
  moonlunaGroup.add(moonlunaGlowMesh);

  // Moon orbit parameters (relative to Earth)
  const moonlunaOrbitRadius = 8;
  let moonlunaOrbitAngle = Math.random() * Math.PI * 2;
  const moonlunaOrbitSpeed = 0.0032; // roughly realistic relative to earth orbit speed

  // ────────────────────────────────────────────────────────────────
  // Earth orbital path around Sun
  // ────────────────────────────────────────────────────────────────
  const orbitRadiusX = 100;
  const orbitRadiusY = 100;
  const orbitPoints = [];
  const orbitSegments = 128;
  for (let i = 0; i <= orbitSegments; i++) {
    const angle = (i / orbitSegments) * Math.PI * 2;
    const x = orbitRadiusX * Math.cos(angle);
    const y = orbitRadiusY * Math.sin(angle);
    const z = 0;
    orbitPoints.push(new THREE.Vector3(x, y, z));
  }

  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0, // set to 0.35 if you want to see it
    blending: THREE.AdditiveBlending,
    linewidth: 1.5,
  });
  const earthOrbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
  scene.add(earthOrbitLine);

  // ────────────────────────────────────────────────────────────────
  // Animation loop variables
  // ────────────────────────────────────────────────────────────────
  let orbitAngle = Math.random() * Math.PI * 2;
  const orbitSpeed = 0.0006;

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  const onPointerMove = (e) => {
    let clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : window.innerWidth / 2);
    let clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : window.innerHeight / 2);
    mouseX = (clientX / window.innerWidth) * 2 - 1;
    mouseY = -(clientY / window.innerHeight) * 2 + 1;
  };

  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('touchmove', onPointerMove, { passive: true });

  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    if (document.hidden) return;

    const dt = clock.getElapsedTime();

    bg.update(dt);
    stars.rotation.y -= 0.00015;
    sunMesh.rotation.y += 0.002;

    // Earth system rotation
    earthMesh.rotation.y += 0.0072 * 0.15;
    nightMesh.rotation.y += 0.0072 * 0.15;
    clouds.rotation.y -= 0.0075 * 0.075;
    glowMesh.rotation.y += 0.0072 * 0.15;

    // Earth orbit around sun
    orbitAngle += orbitSpeed;
    earthGroup.position.set(
      Math.cos(orbitAngle) * orbitRadiusX,
      Math.sin(orbitAngle) * orbitRadiusY,
      0
    );

    // Moonluna orbit + rotation
    moonlunaOrbitAngle += moonlunaOrbitSpeed;
    moonlunaGroup.position.set(
      Math.cos(moonlunaOrbitAngle) * moonlunaOrbitRadius,
      Math.sin(moonlunaOrbitAngle) * moonlunaOrbitRadius,
      0
    );

    moonlunaMesh.rotation.y += 0.004; // slow self-rotation

    // Camera control
    currentX += (mouseX - currentX) * 0.02;
    currentY += (mouseY - currentY) * 0.02;

    const camRadius = 15;
    const theta = 0.3 * Math.PI - currentY * Math.PI * 0.2;
    const phi = currentX * Math.PI * 0.5;

    const relativePos = new THREE.Vector3(
      camRadius * Math.sin(theta) * Math.cos(phi),
      camRadius * Math.sin(theta) * Math.sin(phi),
      camRadius * Math.cos(theta)
    );

    camera.position.copy(earthGroup.position).add(relativePos);

    const northDirection = new THREE.Vector3(0, 0, 1).normalize();
    const earthRadiusWorld = 1 * 5.8;
    const surfaceBias = 1.3;
    const lookOffset = northDirection.multiplyScalar(earthRadiusWorld * surfaceBias);
    const lookTarget = earthGroup.position.clone().add(lookOffset);

    camera.lookAt(lookTarget);
    camera.up.copy(new THREE.Vector3(0, 0, 1));

    renderer.render(scene, camera);
  }

  animate();

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  return () => {
    window.removeEventListener('resize', onResize);
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('touchmove', onPointerMove);
    renderer.dispose();
    container.removeChild(renderer.domElement);
  };
}

export { initialiseBackground };