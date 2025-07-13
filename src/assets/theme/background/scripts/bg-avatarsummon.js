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
    color: 0x049AFF,
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
      material.color.setHSL(0.55, 1, 0.5 + 0.5 * glow);
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
  avatar.position.set(0, radius * -0.3, 0); // Center at radius * 0.15
  return avatar;
}

function getRectanglePoints(radius, j, platformY) {
  const capRadius = radius * Math.sqrt(1 - 0.75 * 0.75); // ≈ radius * 0.661
  const innerRadius = capRadius * 0.95; // ≈ radius * 0.628
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
  const lineGroup = new THREE.Group();
  const rectGroup = new THREE.Group();
  const lineCount = 24;
  const connectCount = 12; // 24 / 2 = 12 staples
  const platformY = -radius * 0.75; // Y-position
  const capRadius = radius * Math.sqrt(1 - 0.75 * 0.75); // ≈ radius * 0.661
  const innerRadius = capRadius * 0.95; // Inner edge at 95% of capRadius

  // Material for red lines
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xFF0000, // Red
    transparent: true,
    opacity: 0.85,
  });

  // Material for light blue rectangles
  const rectMaterial = new THREE.MeshBasicMaterial({
    color: 0xA0EBFF, // Light blue
    transparent: true,
    side: THREE.DoubleSide,
    opacity: 0.85,
  });

  // Create 24 radial red lines (legs of staples)
  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * Math.PI * 2;
    const lineGeometry = new THREE.BufferGeometry();
    const lineVertices = [
      0, platformY, 0, // Start at center
      capRadius * Math.cos(angle), platformY, capRadius * Math.sin(angle), // End at cap edge
    ];
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));
    const line = new THREE.Line(lineGeometry, lineMaterial);
    lineGroup.add(line);
  }

  // Create 12 outer and inner connecting lines
  for (let j = 0; j < connectCount; j++) {
    const i1 = 2 * j; // First point index
    const i2 = 2 * j + 1; // Second point index
    const angle1 = (i1 / lineCount) * Math.PI * 2;
    const angle2 = (i2 / lineCount) * Math.PI * 2;

    // Outer connecting line geometry
    const connectGeometry = new THREE.BufferGeometry();
    const connectVertices = [
      capRadius * Math.cos(angle1), platformY, capRadius * Math.sin(angle1), // Endpoint of line i1
      capRadius * Math.cos(angle2), platformY, capRadius * Math.sin(angle2), // Endpoint of line i2
    ];
    connectGeometry.setAttribute('position', new THREE.Float32BufferAttribute(connectVertices, 3));
    const connectLine = new THREE.Line(connectGeometry, lineMaterial);
    lineGroup.add(connectLine);

    // Inner connecting line geometry
    const innerConnectGeometry = new THREE.BufferGeometry();
    const innerConnectVertices = [
      innerRadius * Math.cos(angle1), platformY, innerRadius * Math.sin(angle1), // Inner point at angle1
      innerRadius * Math.cos(angle2), platformY, innerRadius * Math.sin(angle2), // Inner point at angle2
    ];
    innerConnectGeometry.setAttribute('position', new THREE.Float32BufferAttribute(innerConnectVertices, 3));
    const innerConnectLine = new THREE.Line(innerConnectGeometry, lineMaterial);
    lineGroup.add(innerConnectLine);
  }

  // Create 12 light blue rectangles
  for (let j = 0; j < connectCount; j++) {
    const points = getRectanglePoints(radius, j, platformY);
    const rectGeometry = new THREE.BufferGeometry();
    const vertices = [
      points[0].x, points[0].y, points[0].z, // v0
      points[1].x, points[1].y, points[1].z, // v1
      points[2].x, points[2].y, points[2].z, // v2
      points[3].x, points[3].y, points[3].z, // v3
    ];
    const indices = [0, 1, 2, 0, 2, 3]; // Two triangles
    rectGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    rectGeometry.setIndex(indices);
    const rectangle = new THREE.Mesh(rectGeometry, rectMaterial);
    rectGroup.add(rectangle);
  }

  return {
    lineMesh: lineGroup,
    rectMesh: rectGroup,
    update: (time) => {
      const glow = 0.5 + 0.5 * Math.sin(time * 2 * Math.PI / 5); // Slow glow (5s period)
      lineMaterial.opacity = 0.7 + 0.3 * glow;
      rectMaterial.opacity = 0.7 + 0.3 * glow;
    },
  };
}

function initialiseBackground(container) {
  const scene = new THREE.Scene();
  scene.background = null;
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const background = getBackground();
  const radius = background.radius;
  camera.position.set(0, 0, 0); // Initial position (will be updated in animate)
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  scene.add(background.mesh);
  const hexGrid = getAvatarPlatform(radius);
  scene.add(hexGrid.mesh);
  const avatar = getAvatar(radius);
  scene.add(avatar);
  const lightRing = getLightRing(radius);
  scene.add(lightRing.lineMesh); // Add red lines
  scene.add(lightRing.rectMesh); // Add light blue rectangles

  // Avatar center is at (0, 0, radius * 0.15)
  const avatarCenter = new THREE.Vector3(0, 0, radius * 0.15);

  // Disable OrbitControls since we want manual mouse-based rotation
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableRotate = false;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  let mouseX = 0;
  const onMouseMove = (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1; // Normalized -1 to 1
  };
  window.addEventListener('mousemove', onMouseMove);

  let clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    hexGrid.update(elapsedTime);
    lightRing.update(elapsedTime); // Update line and rectangle glow

    // Camera orbits the sphere near the bottom
    const sphereRadius = radius; // Use the sphere's radius
    const theta = 0.7 * Math.PI; // Orbit near the bottom (126° from top, ~36° above bottom pole)
    const phi = mouseX * Math.PI * 0.5; // Slower rotation: 90° range

    // Calculate camera position in spherical coordinates
    camera.position.set(
      sphereRadius * Math.sin(theta) * Math.cos(phi), // x
      sphereRadius * Math.sin(theta) * Math.sin(phi), // y
      sphereRadius * Math.cos(theta) // z
    );

    // Ensure camera looks at avatarCenter
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