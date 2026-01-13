import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { star, mars_mosaic_1, earth_mosaic_1, earth_mosaic_2_specular, earth_mosaic_3_bump, earth_mosaic_4_lights, earth_mosaic_5_clouds, earth_mosaic_6_clouds_transparent } from '../../../../data/assets.js';

function getStarfield({ numStars = 500, radius = 250, exclusionRadius = 30, hueBase = 0.6 } = {}) {
  const verts = [];
  const colors = [];
  let col;
  for (let i = 0; i < numStars; i += 1) {
    const r = exclusionRadius + Math.random() * (radius - exclusionRadius);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    const hue = hueBase + (Math.random() - 0.5) * 0.15;
    col = new THREE.Color().setHSL(hue, 0.4, 0.5 + Math.random() * 0.5);
    verts.push(x, y, z);
    colors.push(col.r, col.g, col.b);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const texture = new THREE.TextureLoader().load(star);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.PointsMaterial({
    size: 0.25,
    vertexColors: true,
    map: texture,
    transparent: true,
    alphaTest: 0.1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}

function getFresnelMat({ rimHex = 0x0088ff, facingHex = 0x000000 } = {}) {
  const uniforms = {
    color1: { value: new THREE.Color(rimHex) },
    color2: { value: new THREE.Color(facingHex) },
    fresnelBias: { value: 0.1 },
    fresnelScale: { value: 1.0 },
    fresnelPower: { value: 4.0 },
  };
  const vs = `
  uniform float fresnelBias;
  uniform float fresnelScale;
  uniform float fresnelPower;
  varying float vReflectionFactor;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
    vec3 I = worldPosition.xyz - cameraPosition;
    vReflectionFactor = fresnelBias + fresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), fresnelPower );
    gl_Position = projectionMatrix * mvPosition;
  }
  `;
  const fs = `
  uniform vec3 color1;
  uniform vec3 color2;
  varying float vReflectionFactor;
  void main() {
    float f = clamp( vReflectionFactor, 0.0, 1.0 );
    gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
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

function getGalaxyCloud({
  position,
  colorInner = 0xFFFF88,
  colorOuter = 0xAA22FF,
  darkColor = 0x110011,
  size = 30,
  thickness = 2,
  driftSpeed = 0.05,
  noiseScale = 4.0,
  numStars = 80,
  starHue = 0.6,
  rotationSpeed = 0.0005,
  opacity = 0.6
} = {}) {
  const group = new THREE.Group();
  group.position.copy(position);

  const cloudGeo = new THREE.PlaneGeometry(size * 2, size * 2, 64, 64);

  const cloudMaterial = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    opacity: opacity,
    uniforms: {
      time: { value: 0 },
      colorInner: { value: new THREE.Color(colorInner) },
      colorOuter: { value: new THREE.Color(colorOuter) },
      darkColor: { value: new THREE.Color(darkColor) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float time;
      uniform vec3 colorInner;
      uniform vec3 colorOuter;
      uniform vec3 darkColor;

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
        vec2 uv = vUv - 0.5;
        float dist = length(uv) * 2.0;
        if (dist > 1.0) discard;

        vec2 scaled = uv * ${noiseScale.toFixed(1)};
        float n1 = noise(scaled + time * ${driftSpeed.toFixed(3)});
        float n2 = noise(scaled * 1.5 + vec2(time * ${driftSpeed.toFixed(3) * 0.7}, 0.0));
        float n = noise(scaled + vec2(n1, n2) * 2.0);

        float angle = atan(uv.y, uv.x);
        float spiral = sin(angle * 3.0 + dist * 10.0 + time * 0.5) * 0.5 + 0.5;
        n = n * 0.7 + spiral * 0.3;

        float edge = 1.0 - smoothstep(0.6, 1.0, dist);

        vec3 base = mix(colorInner, colorOuter, dist);
        vec3 color = mix(darkColor, base, n * edge);

        float alpha = n * edge * 0.8;
        gl_FragColor = vec4(color, alpha);
      }
    `
  });

  const cloudMesh = new THREE.Mesh(cloudGeo, cloudMaterial);
  cloudMesh.rotation.z = Math.random() * Math.PI * 2;
  group.add(cloudMesh);

  // Full-disk stars with strong central condensation
  const fullRadius = size;
  const verts = [];
  const colors = [];
  let col;

  for (let i = 0; i < numStars; i++) {
    let r;
    do {
      r = Math.random() * fullRadius;
    } while (Math.random() > Math.pow(1 - r / fullRadius, 2.8));

    const theta = Math.random() * Math.PI * 2;
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    const z = (Math.random() - 0.5) * thickness * 0.3;

    const hue = starHue + (Math.random() - 0.5) * 0.15;
    col = new THREE.Color().setHSL(hue, 0.4, 0.5 + Math.random() * 0.5);

    verts.push(x, y, z);
    colors.push(col.r, col.g, col.b);
  }

  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  starGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const texture = new THREE.TextureLoader().load(star);
  texture.colorSpace = THREE.SRGBColorSpace;

  const starMat = new THREE.PointsMaterial({
    size: 0.20,
    vertexColors: true,
    map: texture,
    transparent: true,
    opacity: 0.70,
    alphaTest: 0.1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const flatStars = new THREE.Points(starGeo, starMat);
  flatStars.rotation.z = Math.random() * Math.PI * 2;
  group.add(flatStars);

  return {
    group,
    update: (time, delta) => {
      cloudMaterial.uniforms.time.value = time;
      flatStars.rotation.z += delta * rotationSpeed;
    }
  };
}

function getSkybox() {
  const geometry = new THREE.SphereGeometry(500, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    color: 0x000004,
    side: THREE.BackSide,
    depthWrite: false,
  });
  return new THREE.Mesh(geometry, material);
}

function generateRandomGalaxyConfigs(numGalaxies = 4, minDist = 80, maxDist = 480) {
  const configs = [];
  const colorVariants = [
    { inner: 0xFFFFAA, outer: 0xCC66FF, dark: 0x220044, hue: 0.8 },
    { inner: 0xFFDD88, outer: 0x66FFFF, dark: 0x002244, hue: 0.55 },
    { inner: 0xFFFFFF, outer: 0xFF88AA, dark: 0x440022, hue: 0.1 },
    { inner: 0xFFFF66, outer: 0x88FF88, dark: 0x114411, hue: 0.35 },
    { inner: 0xFFD700, outer: 0xFF66CC, dark: 0x330033, hue: 0.7 },
    { inner: 0xFFAAFF, outer: 0x00FFFF, dark: 0x001122, hue: 0.6 },
    { inner: 0xFFFF00, outer: 0xFF0088, dark: 0x220011, hue: 0.2 },
    { inner: 0x88FFFF, outer: 0xFF8800, dark: 0x221100, hue: 0.4 },
    { inner: 0xFF88FF, outer: 0x00FF88, dark: 0x002211, hue: 0.9 },
    { inner: 0xFFFFFF, outer: 0x8888FF, dark: 0x000044, hue: 0.3 },
    { inner: 0xFFBB00, outer: 0xBB00FF, dark: 0x110011, hue: 0.75 },
    { inner: 0x00FFFF, outer: 0xFFFF00, dark: 0x002222, hue: 0.5 },
    { inner: 0xFFCC88, outer: 0x88CCFF, dark: 0x112233, hue: 0.65 },
    { inner: 0xCCFF88, outer: 0xFFCC00, dark: 0x223300, hue: 0.45 },
    { inner: 0x88FFCC, outer: 0xCC00FF, dark: 0x330022, hue: 0.85 },
  ];

  for (let i = 0; i < numGalaxies; i++) {
    const dist = minDist + Math.random() * (maxDist - minDist);
    const theta = Math.random() * Math.PI * 2;
    let phi = Math.acos(2 * Math.random() - 1);
    if (Math.random() < 0.3) {
      phi = Math.PI / 4 + Math.random() * (Math.PI / 2);
    }
    const x = dist * Math.sin(phi) * Math.cos(theta);
    const y = dist * Math.sin(phi) * Math.sin(theta);
    const z = dist * Math.cos(phi);

    const variant = colorVariants[Math.floor(Math.random() * colorVariants.length)];

    const distanceFactor = (dist - minDist) / (maxDist - minDist);
    const baseSize = 12 + Math.random() * 30;
    const size = baseSize * (1.0 - distanceFactor * 0.7);

    // DOUBLED the range: was 50–120 → now 100–240 stars per galaxy
    const numStars = 100 + Math.floor(Math.random() * 140);

    const opacity = (0.15 + Math.random() * 0.2 - distanceFactor * 0.2) * 0.525;
    const clampedOpacity = Math.max(0.1, Math.min(0.45, opacity));

    const rotationSpeed = (0.000225 + Math.random() * 0.000375) * 0.7;

    configs.push({
      pos: new THREE.Vector3(x, y, z),
      inner: variant.inner,
      outer: variant.outer,
      dark: variant.dark,
      hue: variant.hue + (Math.random() - 0.5) * 0.1,
      size,
      numStars,
      opacity: clampedOpacity,
      rotationSpeed,
    });
  }
  return configs;
}

function initialiseBackground(container) {
  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(-1, -5.5, 1.25);
  camera.up.set(0, 0, 1);
  camera.far = 1000;
  camera.updateProjectionMatrix();

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = false;

  scene.add(getSkybox());

  const backgroundGroup = new THREE.Group();
  scene.add(backgroundGroup);

  const generalStars = getStarfield({ numStars: 8000, radius: 480, exclusionRadius: 60 });
  backgroundGroup.add(generalStars);

  const galaxies = [];

  const marsOrbitRadiusX = 30.4;
  const marsOrbitRadiusY = 32.0;
  const outermostOrbitRadius = Math.max(marsOrbitRadiusX, marsOrbitRadiusY);
  const galaxyMinDist = outermostOrbitRadius * 1.5;

  const galaxyConfigs = generateRandomGalaxyConfigs(60, galaxyMinDist, 480);

  galaxyConfigs.forEach(config => {
    const galaxy = getGalaxyCloud({
      position: config.pos,
      colorInner: config.inner,
      colorOuter: config.outer,
      darkColor: config.dark,
      size: config.size,
      thickness: 3,
      driftSpeed: 0.03 + Math.random() * 0.05,
      noiseScale: 4.0 + Math.random() * 2.5,
      numStars: config.numStars,
      starHue: config.hue,
      rotationSpeed: config.rotationSpeed,
      opacity: config.opacity
    });
    backgroundGroup.add(galaxy.group);
    galaxies.push(galaxy);
  });

  const sunGroup = new THREE.Group();
  sunGroup.rotation.z = -3.4 * Math.PI / 180;
  sunGroup.rotation.x = 90 * Math.PI / 180;
  scene.add(sunGroup);

  const sunGeometry = new THREE.IcosahedronGeometry(3, 5);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFFF8B0, wireframe: true });
  const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
  sunGroup.add(sunMesh);

  const sunLight = new THREE.PointLight(0xffffee, 1350.0, 9999999999999999999999);
  sunLight.position.set(0, 0, 0);
  sunLight.castShadow = true;
  scene.add(sunLight);

  const earthGroup = new THREE.Group();
  scene.add(earthGroup);
  const earthDetail = 60;
  const earthLoader = new THREE.TextureLoader();
  const earthGeometry = new THREE.IcosahedronGeometry(1, earthDetail);
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthLoader.load(earth_mosaic_1),
    specularMap: earthLoader.load(earth_mosaic_2_specular),
    bumpMap: earthLoader.load(earth_mosaic_3_bump),
    bumpScale: 0.04,
  });
  const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
  earthGroup.add(earthMesh);
  earthMesh.rotation.x = Math.PI / 2;

  const earthLight = new THREE.MeshBasicMaterial({
    map: earthLoader.load(earth_mosaic_4_lights),
    blending: THREE.AdditiveBlending,
  });
  const earthLightMesh = new THREE.Mesh(earthGeometry, earthLight);
  earthGroup.add(earthLightMesh);
  earthLightMesh.rotation.x = Math.PI / 2;

  const earthClouds = new THREE.MeshStandardMaterial({
    map: earthLoader.load(earth_mosaic_5_clouds),
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    alphaMap: earthLoader.load(earth_mosaic_6_clouds_transparent),
  });
  const earthCloudMesh = new THREE.Mesh(earthGeometry, earthClouds);
  earthCloudMesh.scale.setScalar(0.5015);
  earthGroup.add(earthCloudMesh);
  earthCloudMesh.rotation.x = Math.PI / 2;

  const earthFresnel = getFresnelMat({ rimHex: 0x0000ff });
  const earthGlowMesh = new THREE.Mesh(earthGeometry, earthFresnel);
  earthGlowMesh.scale.setScalar(1.01);
  earthGroup.add(earthGlowMesh);
  earthGlowMesh.rotation.x = Math.PI / 2;

  earthGroup.scale.set(0.5, 0.5, 0.5);

  const earthOrbitRadiusX = 15.2;
  const earthOrbitRadiusY = 16.0;

  const marsGroup = new THREE.Group();
  scene.add(marsGroup);
  const marsDetail = 60;
  const marsLoader = new THREE.TextureLoader();
  const marsGeometry = new THREE.IcosahedronGeometry(1, marsDetail);
  const marsMaterial = new THREE.MeshPhongMaterial({
    map: marsLoader.load(mars_mosaic_1)
  });
  const marsMesh = new THREE.Mesh(marsGeometry, marsMaterial);
  marsGroup.add(marsMesh);
  marsMesh.rotation.x = Math.PI / 2;

  const marsFresnel = getFresnelMat({ rimHex: 0xff0000 });
  const marsGlowMesh = new THREE.Mesh(marsGeometry, marsFresnel);
  marsGlowMesh.scale.setScalar(1.01);
  marsGroup.add(marsGlowMesh);
  marsGlowMesh.rotation.x = Math.PI / 2;

  marsGroup.scale.set(1, 1, 1);

  let earthOrbitSpeed = 0.00075;
  let earthOrbitAngle = 0;

  let marsOrbitSpeed = 0.00025;
  let marsOrbitAngle = 0;

  let target = earthGroup;

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    galaxies.forEach(g => {
      g.group.lookAt(target.position);
      g.update(elapsed, delta);
    });

    backgroundGroup.rotation.y -= 0.0001;

    sunMesh.rotation.y += 0.002;
    earthMesh.rotation.y += 0.007;
    earthLightMesh.rotation.y += 0.007;
    earthCloudMesh.rotation.y += 0.0073;
    earthGlowMesh.rotation.y += 0.007;
    marsMesh.rotation.y += 0.007;
    marsGlowMesh.rotation.y += 0.007;

    earthOrbitAngle += earthOrbitSpeed;
    earthGroup.position.set(
      earthOrbitRadiusX * Math.cos(earthOrbitAngle),
      earthOrbitRadiusY * Math.sin(earthOrbitAngle),
      0
    );

    marsOrbitAngle += marsOrbitSpeed;
    marsGroup.position.set(
      marsOrbitRadiusX * Math.cos(marsOrbitAngle),
      marsOrbitRadiusY * Math.sin(marsOrbitAngle),
      0
    );

    const cameraOffset = new THREE.Vector3(-7, 1, 2);
    camera.position.copy(earthGroup.position).add(cameraOffset);
    camera.lookAt(earthGroup.position);
    controls.target.copy(earthGroup.position);
    controls.update();

    renderer.render(scene, camera);
  }

  animate();

  function handleWindowResize() {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  }
  window.addEventListener('resize', handleWindowResize);

  return () => {
    window.removeEventListener('resize', handleWindowResize);
    container.removeChild(renderer.domElement);
  };
}

export { initialiseBackground };