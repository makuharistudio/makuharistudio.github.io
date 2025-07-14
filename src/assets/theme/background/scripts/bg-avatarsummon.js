import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

function getBackground() {
  const aspect = window.innerWidth / window.innerHeight;
  const fovRad = (75 * Math.PI) / 180;
  const viewportHeight = 2 * 5 * Math.tan(fovRad / 2);
  const radius = (0.55 * viewportHeight) / (2 / Math.sqrt(1 + aspect * aspect));
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00FF00, // Lime green
    wireframe: true,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0, // Completely transparent
  });
  const backgroundMesh = new THREE.Mesh(geometry, material);
  backgroundMesh.position.set(0, 0, 0);
  return { mesh: backgroundMesh, update: () => {}, radius };
}

function getAvatarPlatform(radius) {
  const hexGeometry = new THREE.BufferGeometry();
  const vertices = [];
  const hexSize = 0.5 * (radius / 10);
  const hexHeight = hexSize * Math.sqrt(3);
  const cols = Math.ceil(radius / (1.5 * hexSize));
  const rows = Math.ceil(radius / hexHeight);
  for (let q = -cols; q <= cols; q++) {
    for (let r = -rows; r <= rows; r++) {
      const x = hexSize * 1.5 * q;
      const y = hexHeight * (r + (q % 2) * 0.5);
      if (Math.sqrt(x * x + y * y) <= radius * 0.5) {
        const points = [
          new THREE.Vector2(x + hexSize * Math.cos(0), y + hexSize * Math.sin(0)),
          new THREE.Vector2(x + hexSize * Math.cos(Math.PI / 3), y + hexSize * Math.sin(Math.PI / 3)),
          new THREE.Vector2(x + hexSize * Math.cos(2 * Math.PI / 3), y + hexSize * Math.sin(2 * Math.PI / 3)),
          new THREE.Vector2(x + hexSize * Math.cos(Math.PI), y + hexSize * Math.sin(Math.PI)),
          new THREE.Vector2(x + hexSize * Math.cos(4 * Math.PI / 3), y + hexSize * Math.sin(4 * Math.PI / 3)),
          new THREE.Vector2(x + hexSize * Math.cos(5 * Math.PI / 3), y + hexSize * Math.sin(5 * Math.PI / 3)),
          new THREE.Vector2(x + hexSize * Math.cos(0), y + hexSize * Math.sin(0)),
        ];
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          const z = radius * 0.1 * (1 - (Math.sqrt(p1.x * p1.x + p1.y * p1.y) / (radius * 0.5)));
          vertices.push(p1.x, p1.y, z, p2.x, p2.y, z);
        }
      }
    }
  }
  hexGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.LineBasicMaterial({
    color: 0x0066CC, // Darker blue
    transparent: true,
    opacity: 0.5,
  });
  const hexGrid = new THREE.LineSegments(hexGeometry, material);
  hexGrid.position.set(0, radius * -0.8, 0);
  hexGrid.rotation.set(-Math.PI / 2, 0, 0);
  return {
    mesh: hexGrid,
    update: (time) => {
      const glow = 0.5 + 0.5 * Math.sin(time * 2 * Math.PI / 3);
      material.color.setHSL(0.58, 1, 0.4 + 0.2 * glow); // Shift to blue hue (0.58), darker lightness
      material.opacity = 0.5 + 0.5 * glow;
    },
  };
}

function getAvatar(radius) {
  const height = radius * 0.8;
  const geometry = new THREE.CylinderGeometry(0.5 * (radius / 10), 0.5 * (radius / 10), height, 16);
  const material = new THREE.MeshBasicMaterial({
    color: 0xFF4500,
    wireframe: true,
  });
  const avatar = new THREE.Mesh(geometry, material);
  avatar.position.set(0, radius * -0.3, 0);
  return avatar;
}

function getRectanglePoints(radius, j, platformY) {
  const capRadius = radius * Math.sqrt(1 - 0.75 * 0.75);
  const innerRadius = capRadius * 0.95;
  const angle1 = (2 * j / 24) * Math.PI * 2;
  const angle2 = ((2 * j + 1) / 24) * Math.PI * 2;

  return [
    new THREE.Vector3(capRadius * Math.cos(angle1), platformY, capRadius * Math.sin(angle1)), // v0: Outer, angle1
    new THREE.Vector3(capRadius * Math.cos(angle2), platformY, capRadius * Math.sin(angle2)), // v1: Outer, angle2
    new THREE.Vector3(innerRadius * Math.cos(angle2), platformY, innerRadius * Math.sin(angle2)), // v2: Inner, angle2
    new THREE.Vector3(innerRadius * Math.cos(angle1), platformY, innerRadius * Math.sin(angle1)), // v3: Inner, angle1
  ];
}

function getLightRing(radius) {
  const rectGroup = new THREE.Group();
  const platformY = -radius * 0.75;
  const connectCount = 12;
  const wallHeight = radius * 0.1;

  // Material for light blue rectangles
  const rectMaterial = new THREE.MeshBasicMaterial({
    color: 0x80C8FF, // Brighter blue
    transparent: true,
    side: THREE.DoubleSide,
    opacity: 0.85,
  });

  // Custom ShaderMaterial for walls with opacity gradient starting at 70% height
  const wallMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0x80C8FF) }, // Brighter blue
      glow: { value: 0.5 },
      fadeStart: { value: 0.7 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform float glow;
      uniform float fadeStart;
      varying vec2 vUv;
      void main() {
        float baseOpacity = 0.3;
        float glowFactor = 0.2 + 0.2 * glow;
        float opacity;
        if (vUv.y < fadeStart) {
          opacity = baseOpacity * glowFactor;
        } else {
          float t = (vUv.y - fadeStart) / (1.0 - fadeStart);
          opacity = baseOpacity * (1.0 - t) * glowFactor;
        }
        gl_FragColor = vec4(color, opacity);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  // Create 12 light blue rectangles and their walls
  for (let j = 0; j < connectCount; j++) {
    // Rectangle
    const points = getRectanglePoints(radius, j, platformY);
    const rectGeometry = new THREE.BufferGeometry();
    const rectVertices = [
      points[0].x, points[0].y, points[0].z,
      points[1].x, points[1].y, points[1].z,
      points[2].x, points[2].y, points[2].z,
      points[3].x, points[3].y, points[3].z,
    ];
    const indices = [0, 1, 2, 0, 2, 3];
    rectGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rectVertices, 3));
    rectGeometry.setIndex(indices);
    const rectangle = new THREE.Mesh(rectGeometry, rectMaterial);
    rectangle.renderOrder = 1; // Render rectangles after walls
    rectGroup.add(rectangle);

    // Create four walls for each rectangle
    const wallPoints = [
      [points[0], points[1]],
      [points[1], points[2]],
      [points[2], points[3]],
      [points[3], points[0]],
    ];

    wallPoints.forEach(([p1, p2]) => {
      const wallVertices = [
        p1.x, p1.y, p1.z,
        p2.x, p2.y, p2.z,
        p2.x, p2.y + wallHeight, p2.z,
        p1.x, p1.y + wallHeight, p1.z,
      ];
      const wallGeometry = new THREE.BufferGeometry();
      wallGeometry.setAttribute('position', new THREE.Float32BufferAttribute(wallVertices, 3));
      wallGeometry.setAttribute('uv', new THREE.Float32BufferAttribute([
        0, 0,
        1, 0,
        1, 1,
        0, 1,
      ], 2));
      wallGeometry.setIndex([0, 1, 2, 0, 2, 3]);
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.renderOrder = 0; // Render walls first
      rectGroup.add(wall);
    });
  }

  return {
    rectMesh: rectGroup,
    update: (time) => {
      const glow = 0.5 + 0.5 * Math.sin(time * 2 * Math.PI / 5);
      rectMaterial.opacity = 0.7 + 0.3 * glow;
      wallMaterial.uniforms.glow.value = glow;
      rectGroup.rotation.y = time * 0.1; // Counterclockwise rotation
    },
  };
}

function initialiseBackground(container) {
  const scene = new THREE.Scene();
  scene.background = null;
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const background = getBackground();
  const radius = background.radius;
  camera.position.set(0, 0, 0);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  scene.add(background.mesh);
  const hexGrid = getAvatarPlatform(radius);
  scene.add(hexGrid.mesh);
  const avatar = getAvatar(radius);
  scene.add(avatar);
  const lightRing = getLightRing(radius);
  scene.add(lightRing.rectMesh);

  const avatarCenter = new THREE.Vector3(0, 0, radius * 0.15);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableRotate = false;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  let mouseX = 0;
  const onMouseMove = (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  };
  window.addEventListener('mousemove', onMouseMove);

  let clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    hexGrid.update(elapsedTime);
    lightRing.update(elapsedTime);

    const sphereRadius = radius;
    const theta = 0.7 * Math.PI;
    const phi = mouseX * Math.PI * 0.5;

    camera.position.set(
      sphereRadius * Math.sin(theta) * Math.cos(phi),
      sphereRadius * Math.sin(theta) * Math.sin(phi),
      sphereRadius * Math.cos(theta)
    );

    camera.lookAt(avatarCenter);
    controls.target.copy(avatarCenter);
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
    window.removeEventListener('mousemove', onMouseMove);
    container.removeChild(renderer.domElement);
  };
}

export { initialiseBackground };