/**
 * Dark-theme Earth background. Ported from the old bg-space-earth.js.
 * Textures live in ../images next to this script. The theme loader passes that folder.
 */
import * as THREE from '../../../../../library/vendor/three.module.js';

let imageBase = '';

function getStarfield(options: { numStars?: number; radius?: number; exclusionRadius?: number } | number = {}, radiusArg = 200, exclusionArg = 60): THREE.Points {
  // The original script passed one options object. A numeric first argument
  // is also accepted so an older call site still produces stars.
  const numStars = typeof options === 'number' ? options : (options.numStars ?? 500);
  const radius = typeof options === 'number' ? radiusArg : (options.radius ?? 200);
  const exclusionRadius = typeof options === 'number' ? exclusionArg : (options.exclusionRadius ?? 60);
  function randomSpherePoint(): { pos: THREE.Vector3; hue: number } {
    let r: number;
    do {
      r = Math.random() * radius * 1.5;
    } while (r < exclusionRadius * 1.25);
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    return {
      pos: new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ),
      hue: 0.6,
    };
  }

  const verts: number[] = [];
  const colors: number[] = [];
  for (let i = 0; i < numStars; i++) {
    const p = randomSpherePoint();
    const col = new THREE.Color().setHSL(p.hue, 0.2, Math.random() * 0.7 + 0.3);
    verts.push(p.pos.x, p.pos.y, p.pos.z);
    colors.push(col.r, col.g, col.b);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const texture = new THREE.TextureLoader().load(`${imageBase}/star.png`);
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

function getFresnelMat(rimHex = 0x3399ff, facingHex = 0x000000): THREE.ShaderMaterial {
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

function getBackground(): { mesh: THREE.Mesh; update: (t: number) => void } {
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
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
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
  return {
    mesh,
    update: (t: number) => {
      const uniforms = material.uniforms;
      const time = uniforms['time'];
      if (time) time.value = t;
    },
  };
}

function disposeObject(root: THREE.Object3D): void {
  root.traverse((obj: THREE.Object3D) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = mesh.material;
    if (!material) return;
    const materials = Array.isArray(material) ? material : [material];
    for (const mat of materials) {
      const mapped = mat as THREE.MeshPhongMaterial;
      const maps: Array<THREE.Texture | null | undefined> = [
        mapped.map,
        mapped.specularMap,
        mapped.bumpMap,
        mapped.alphaMap,
      ];
      for (const tex of maps) tex?.dispose();
      mat.dispose();
    }
  });
}

export function initialiseBackground(container: HTMLElement, textures: string): () => void {
  imageBase = textures;
  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  container.appendChild(renderer.domElement);

  const bg = getBackground();
  scene.add(bg.mesh);

  const stars = getStarfield({ numStars: 3000, radius: 200, exclusionRadius: 100 });
  scene.add(stars);

  const sunGroup = new THREE.Group();
  sunGroup.rotation.z = (-3.4 * Math.PI) / 180;
  scene.add(sunGroup);

  const sunGeometry = new THREE.SphereGeometry(3.2, 32, 24);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
  const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
  sunGroup.add(sunMesh);

  const sunGlow = getFresnelMat(0xffffcc, 0xffdd44);
  const sunGlowMesh = new THREE.Mesh(sunGeometry, sunGlow);
  sunGlowMesh.scale.setScalar(1.18);
  sunGroup.add(sunGlowMesh);

  const sunLight = new THREE.PointLight(0xffffff, 2200, 0);
  sunLight.decay = 1.5;
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  const earthGroup = new THREE.Group();
  scene.add(earthGroup);

  const earthDetail = 22;
  const loader = new THREE.TextureLoader();
  const earthGeometry = new THREE.IcosahedronGeometry(1, earthDetail);

  const earthMaterial = new THREE.MeshPhongMaterial({
    map: loader.load(`${imageBase}/planetary-mosaic-earth-1.jpg`),
    specularMap: loader.load(`${imageBase}/planetary-mosaic-earth-2-specular.jpg`),
    bumpMap: loader.load(`${imageBase}/planetary-mosaic-earth-3-bump.jpg`),
    bumpScale: 0.035,
    shininess: 12,
  });
  const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
  earthGroup.add(earthMesh);
  earthMesh.rotation.x = Math.PI / 2;

  const nightLights = new THREE.MeshBasicMaterial({
    map: loader.load(`${imageBase}/planetary-mosaic-earth-4-lights.jpg`),
    blending: THREE.AdditiveBlending,
  });
  const nightMesh = new THREE.Mesh(earthGeometry, nightLights);
  earthGroup.add(nightMesh);
  nightMesh.rotation.x = Math.PI / 2;

  const cloudsMat = new THREE.MeshStandardMaterial({
    map: loader.load(`${imageBase}/planetary-mosaic-earth-5-clouds.jpg`),
    transparent: true,
    opacity: 0.85,
    alphaMap: loader.load(`${imageBase}/planetary-mosaic-earth-6-cloudstransparent.jpg`),
    blending: THREE.AdditiveBlending,
  });
  const clouds = new THREE.Mesh(earthGeometry, cloudsMat);
  clouds.scale.setScalar(1.004);
  earthGroup.add(clouds);
  clouds.rotation.x = Math.PI / 2;

  const glow = getFresnelMat(0x88ccff, 0x000000);
  const glowMesh = new THREE.Mesh(earthGeometry, glow);
  glowMesh.scale.setScalar(1.012);
  earthGroup.add(glowMesh);
  glowMesh.rotation.x = Math.PI / 2;

  earthGroup.scale.setScalar(5.8);

  const moonlunaGroup = new THREE.Group();
  earthGroup.add(moonlunaGroup);
  const moonlunaRadius = 1 / 3.67;
  const moonlunaGeometry = new THREE.IcosahedronGeometry(moonlunaRadius, 12);
  const moonlunaMaterial = new THREE.MeshPhongMaterial({
    map: loader.load(`${imageBase}/moon-mosaic-luna-1.jpg`),
    bumpMap: loader.load(`${imageBase}/moon-mosaic-luna-1-bump.jpg`),
    bumpScale: 0.06,
    shininess: 5,
  });
  const moonlunaMesh = new THREE.Mesh(moonlunaGeometry, moonlunaMaterial);
  moonlunaGroup.add(moonlunaMesh);
  const moonlunaGlow = getFresnelMat(0xaaaaaa, 0x000000);
  const moonlunaGlowMesh = new THREE.Mesh(moonlunaGeometry, moonlunaGlow);
  moonlunaGlowMesh.scale.setScalar(1.04);
  moonlunaGroup.add(moonlunaGlowMesh);

  const moonlunaOrbitRadius = 8;
  let moonlunaOrbitAngle = Math.random() * Math.PI * 2;
  const moonlunaOrbitSpeed = 0.0032;

  const orbitRadiusX = 100;
  const orbitRadiusY = 100;
  const orbitPoints: THREE.Vector3[] = [];
  const orbitSegments = 128;
  for (let i = 0; i <= orbitSegments; i++) {
    const angle = (i / orbitSegments) * Math.PI * 2;
    orbitPoints.push(new THREE.Vector3(orbitRadiusX * Math.cos(angle), orbitRadiusY * Math.sin(angle), 0));
  }
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });
  scene.add(new THREE.Line(orbitGeometry, orbitMaterial));

  let orbitAngle = Math.random() * Math.PI * 2;
  const orbitSpeed = 0.0006;
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;
  let frame = 0;
  let stopped = false;

  const onPointerMove = (e: MouseEvent | TouchEvent): void => {
    const touch = 'touches' in e ? e.touches[0] : undefined;
    const clientX = 'clientX' in e ? e.clientX : (touch?.clientX ?? window.innerWidth / 2);
    const clientY = 'clientY' in e ? e.clientY : (touch?.clientY ?? window.innerHeight / 2);
    mouseX = (clientX / window.innerWidth) * 2 - 1;
    mouseY = -(clientY / window.innerHeight) * 2 + 1;
  };

  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('touchmove', onPointerMove, { passive: true });

  const clock = new THREE.Clock();

  function animate(): void {
    if (stopped) return;
    frame = requestAnimationFrame(animate);
    if (document.hidden) return;

    const dt = clock.getElapsedTime();
    bg.update(dt);
    stars.rotation.y -= 0.00015;
    sunMesh.rotation.y += 0.002;
    earthMesh.rotation.y += 0.0072 * 0.15;
    nightMesh.rotation.y += 0.0072 * 0.15;
    clouds.rotation.y -= 0.0075 * 0.075;
    glowMesh.rotation.y += 0.0072 * 0.15;

    orbitAngle += orbitSpeed;
    earthGroup.position.set(Math.cos(orbitAngle) * orbitRadiusX, Math.sin(orbitAngle) * orbitRadiusY, 0);

    moonlunaOrbitAngle += moonlunaOrbitSpeed;
    moonlunaGroup.position.set(
      Math.cos(moonlunaOrbitAngle) * moonlunaOrbitRadius,
      Math.sin(moonlunaOrbitAngle) * moonlunaOrbitRadius,
      0,
    );
    moonlunaMesh.rotation.y += 0.004;

    currentX += (mouseX - currentX) * 0.02;
    currentY += (mouseY - currentY) * 0.02;

    const camRadius = 15;
    const theta = 0.3 * Math.PI - currentY * Math.PI * 0.2;
    const phi = currentX * Math.PI * 0.5;
    const relativePos = new THREE.Vector3(
      camRadius * Math.sin(theta) * Math.cos(phi),
      camRadius * Math.sin(theta) * Math.sin(phi),
      camRadius * Math.cos(theta),
    );
    camera.position.copy(earthGroup.position).add(relativePos);

    const lookOffset = new THREE.Vector3(0, 0, 1).multiplyScalar(5.8 * 1.3);
    camera.lookAt(earthGroup.position.clone().add(lookOffset));
    camera.up.set(0, 0, 1);
    renderer.render(scene, camera);
  }

  animate();

  function onResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('touchmove', onPointerMove);
    disposeObject(scene);
    renderer.dispose();
    renderer.forceContextLoss();
    if (renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement);
    }
  };
}
