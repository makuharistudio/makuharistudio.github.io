import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { star, mars_mosaic_1, earth_mosaic_1, earth_mosaic_2_specular, earth_mosaic_3_bump, earth_mosaic_4_lights, earth_mosaic_5_clouds, earth_mosaic_6_clouds_transparent } from '../../../../data/assets.js';

function getStarfield({ numStars = 500, radius = 250, exclusionRadius = 30 } = {}) {
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
    return {
      pos: new THREE.Vector3(x, y, z),
      hue: 0.6,
      minDist: r,
    };
  }
  const verts = [];
  const colors = [];
  const positions = [];
  let col;
  for (let i = 0; i < numStars; i += 1) {
    let p = randomSpherePoint();
    const { pos, hue } = p;
    positions.push(p);
    col = new THREE.Color().setHSL(hue, 0.2, Math.random());
    verts.push(pos.x, pos.y, pos.z);
    colors.push(col.r, col.g, col.b);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const texture = new THREE.TextureLoader().load(star);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    map: texture,
    transparent: true,
    alphaTest: 0.1,
    blending: THREE.AdditiveBlending,
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
    uniforms: uniforms,
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
      vec3 color1 = vec3(0.0, 0.1, 0.2); 
      vec3 color2 = vec3(0.01, 0.03, 0.04);
      vec3 color3 = vec3(0.025, 0.025, 0.025); 
      vec3 color = mix(color1, color2, n);
      color = mix(color, color3, n * 0.5);
      gl_FragColor = vec4(color, 1.0);
    }
  `;
  const geometry = new THREE.SphereGeometry(500, 32, 32);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { time: { value: 0.0 } },
    side: THREE.BackSide,
    depthWrite: false,
  });
  const backgroundMesh = new THREE.Mesh(geometry, material);
  backgroundMesh.position.set(0, 0, 0);
  return {
    mesh: backgroundMesh,
    update: (time) => { material.uniforms.time.value = time; },
  };
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
  const background = getBackground();
  scene.add(background.mesh);
  const sunGroup = new THREE.Group();
  sunGroup.rotation.z = -3.4 * Math.PI / 180;
  sunGroup.rotation.x = 90 * Math.PI / 180;
  sunGroup.position.set(0, 0, 0);
  scene.add(sunGroup);
  const sunGeometry = new THREE.IcosahedronGeometry(3, 5);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFF8B0,
    wireframe: true,
  });
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
  let earthOrbitSpeed = 0.00075;
  let earthOrbitAngle = 0;
  const earthOrbitRadiusX = 15.2;
  const earthOrbitRadiusY = 16.0;
  const earthOrbitPoints = [];
  for (let i = 0; i <= 360; i++) {
    const angle = (i * Math.PI) / 180;
    earthOrbitPoints.push(
      new THREE.Vector3(
        earthOrbitRadiusX * Math.cos(angle),
        earthOrbitRadiusY * Math.sin(angle),
        0
      )
    );
  }
  const earthOrbitPath = new THREE.BufferGeometry().setFromPoints(earthOrbitPoints);
  const earthOrbitMaterial = new THREE.LineDashedMaterial({
    color: 0xffffff,
    dashSize: 1,
    gapSize: 0,
    transparent: true,
    opacity: 0.0
  });
  const earthOrbitLine = new THREE.Line(earthOrbitPath, earthOrbitMaterial);
  earthOrbitLine.computeLineDistances();
  scene.add(earthOrbitLine);
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
  let marsOrbitSpeed = 0.00025;
  let marsOrbitAngle = 0;
  const marsOrbitRadiusX = 30.4;
  const marsOrbitRadiusY = 32.0;
  const marsOrbitPoints = [];
  for (let i = 0; i <= 360; i++) {
    const angle = (i * Math.PI) / 180;
    marsOrbitPoints.push(
      new THREE.Vector3(
        marsOrbitRadiusX * Math.cos(angle),
        marsOrbitRadiusY * Math.sin(angle),
        0
      )
    );
  }
  const marsOrbitPath = new THREE.BufferGeometry().setFromPoints(marsOrbitPoints);
  const marsOrbitMaterial = new THREE.LineDashedMaterial({
    color: 0xffffff,
    dashSize: 1,
    gapSize: 0,
    transparent: true,
    opacity: 0.0
  });
  const marsOrbitLine = new THREE.Line(marsOrbitPath, marsOrbitMaterial);
  marsOrbitLine.computeLineDistances();
  scene.add(marsOrbitLine);
  const marsOrbitMaxRadius = Math.max(marsOrbitRadiusX, marsOrbitRadiusY);
  const stars = getStarfield({ numStars: 7500, radius: 50, exclusionRadius: marsOrbitMaxRadius });
  scene.add(stars);
  let clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    background.update(elapsedTime);
    sunMesh.rotation.y += 0.002;
    earthMesh.rotation.y += 0.007;
    earthLightMesh.rotation.y += 0.007;
    earthCloudMesh.rotation.y += 0.0073;
    earthGlowMesh.rotation.y += 0.007;
    marsMesh.rotation.y += 0.007;
    marsGlowMesh.rotation.y += 0.007;
    earthOrbitAngle += earthOrbitSpeed;
    earthGroup.position.set(
      sunGroup.position.x + earthOrbitRadiusX * Math.cos(earthOrbitAngle),
      sunGroup.position.y + earthOrbitRadiusY * Math.sin(earthOrbitAngle),
      0
    );
    marsOrbitAngle += marsOrbitSpeed;
    marsGroup.position.set(
      sunGroup.position.x + marsOrbitRadiusX * Math.cos(marsOrbitAngle),
      sunGroup.position.y + marsOrbitRadiusY * Math.sin(marsOrbitAngle),
      0
    );
    const cameraOffset = new THREE.Vector3(-7, 1, 2);
    camera.position.copy(earthGroup.position).add(cameraOffset);
    camera.lookAt(earthGroup.position);
    controls.target.copy(earthGroup.position);
    stars.rotation.y -= 0.0002;
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