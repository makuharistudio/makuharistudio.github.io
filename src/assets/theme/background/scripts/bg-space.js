import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import getStarfield from './bg-space-getStarfield.js';
import { getFresnelMat } from './bg-space-getFresnelMat.js';
import { mars_mosaic_1, earth_mosaic_1, earth_mosaic_2_specular, earth_mosaic_3_bump, earth_mosaic_4_lights, earth_mosaic_5_clouds,earth_mosaic_6_clouds_transparent } from '../../../../data/assets.js';

/* Based on YouTube tutorial "Create the Earth with THREE.js" by Robot Bobby https://www.youtube.com/watch?v=FntV9iEJ0tU */
/* The shuttle that flies from Earth was created using ChatGPT */

function initSpaceBackground(container) {
  const w = container.offsetWidth;
  const h = container.offsetHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
  camera.position.set(-1, -5.5, 1.25);
  camera.up.set(0, 0, 1);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  container.appendChild(renderer.domElement);

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;



  // Sun
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

  // Sun's light
  const sunLight = new THREE.PointLight(0xffffee, 1350.0, 9999999999999999999999); // Color, intensity, and distance
  sunLight.position.set(0, 0, 0);
  sunLight.castShadow = true;
  scene.add(sunLight);



  // Earth
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
  earthCloudMesh.scale.setScalar(0.5015); // Previously (1.003), reduced to half for distance illusion
  earthGroup.add(earthCloudMesh);
  earthCloudMesh.rotation.x = Math.PI / 2;
  const earthFresnel = getFresnelMat({ rimHex: 0x0000ff });
  const earthGlowMesh = new THREE.Mesh(earthGeometry, earthFresnel);
  earthGlowMesh.scale.setScalar(1.01); // Previously (1.01), reduced to half for distance illusion
  earthGroup.add(earthGlowMesh);
  earthGlowMesh.rotation.x = Math.PI / 2;
  earthGroup.scale.set(0.5, 0.5, 0.5); // Previously (1, 1, 1), reduced to half for distance illusion
  let earthOrbitSpeed = 0.00075;
  let earthOrbitAngle = 0;

  // Earth's elliptical orbit path
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
    opacity: 0.1
  });

  const earthOrbitLine = new THREE.Line(earthOrbitPath, earthOrbitMaterial);
  earthOrbitLine.computeLineDistances(); // Required for dashed lines
  scene.add(earthOrbitLine);



  // Mars
  const marsGroup = new THREE.Group();
  scene.add(marsGroup);
  const marsDetail = 60;
  const marsLoader = new THREE.TextureLoader();
  const marsGeometry = new THREE.IcosahedronGeometry(1, marsDetail);
  const marsMaterial = new THREE.MeshPhongMaterial({
    map: marsLoader.load(mars_mosaic_1) /* ,
    specularMap: marsLoader.load('02_marsspec1k.jpg'),
    bumpMap: marsLoader.load('01_marsbump1k.jpg'),
    bumpScale: 0.04, */
  });
  const marsMesh = new THREE.Mesh(marsGeometry, marsMaterial);
  marsGroup.add(marsMesh);
  marsMesh.rotation.x = Math.PI / 2;
  /*
  const marsLight = new THREE.MeshBasicMaterial({
    map: marsLoader.load('03_marslights1k.jpg'),
    blending: THREE.AdditiveBlending,
  });
  const marsLightMesh = new THREE.Mesh(marsGeometry, marsLight);
  marsGroup.add(marsLightMesh);
  marsLightMesh.rotation.x = Math.PI / 2;
  const marsClouds = new THREE.MeshStandardMaterial({
    map: marsLoader.load('04_marscloudmap.jpg'),
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    alphaMap: marsLoader.load('05_marscloudmaptrans.jpg'),
  });
  const marsCloudMesh = new THREE.Mesh(marsGeometry, marsClouds);
  marsCloudMesh.scale.setScalar(1.003);
  marsGroup.add(marsCloudMesh);
  marsCloudMesh.rotation.x = Math.PI / 2;
  */
  const marsFresnel = getFresnelMat({ rimHex: 0xff0000 });
  const marsGlowMesh = new THREE.Mesh(marsGeometry, marsFresnel);
  marsGlowMesh.scale.setScalar(1.01);
  marsGroup.add(marsGlowMesh);
  marsGlowMesh.rotation.x = Math.PI / 2;
  marsGroup.scale.set(1, 1, 1);
  let marsOrbitSpeed = 0.00025;
  let marsOrbitAngle = 0;

  // mars's elliptical orbit path
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
    opacity: 0.1
  });

  const marsOrbitLine = new THREE.Line(marsOrbitPath, marsOrbitMaterial);
  marsOrbitLine.computeLineDistances();
  scene.add(marsOrbitLine);



  // Stars
  const marsOrbitMaxRadius = Math.max(marsOrbitRadiusX, marsOrbitRadiusY);
  const stars = getStarfield({ numStars: 2000, radius: 100, exclusionRadius: marsOrbitMaxRadius });
  scene.add(stars);



  // Shuttle
  const shuttleGeometry = new THREE.ConeGeometry(0.025, 0.1, 10);
  const shuttleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
  function createShuttle() {
    const shuttle = new THREE.Mesh(shuttleGeometry, shuttleMaterial);
    scene.add(shuttle);
  
    let progress = 0;
    const start = earthGroup.position.clone();
  
    function animateShuttle() {
      progress += 0.003; // Slower increment for smoother animation
      if (progress > 1) {
        scene.remove(shuttle);
        shuttle.geometry.dispose();
        shuttle.material.dispose();
        return;
      }
  
      const end = marsGroup.position.clone();
      const position = new THREE.Vector3().lerpVectors(start, end, progress);
  
      shuttle.position.copy(position);
  
      // Align shuttle's cone tip to face Mars (target)
      const direction = new THREE.Vector3().subVectors(marsGroup.position, shuttle.position).normalize();
      shuttle.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  
      renderer.render(scene, camera);
      requestAnimationFrame(animateShuttle);
    }
  
    animateShuttle();
  }  
  setInterval(() => createShuttle(), Math.random() * (25000 - 10000) + 10000);



  // ANIMATION
  function animate() {
    requestAnimationFrame(animate);

    // Rotate sun and planets
    sunMesh.rotation.y += 0.002;
    earthMesh.rotation.y += 0.007;
    earthLightMesh.rotation.y += 0.007;
    earthCloudMesh.rotation.y += 0.0073;
    earthGlowMesh.rotation.y += 0.007;
    marsMesh.rotation.y += 0.007;
    // marsLightMesh.rotation.y += 0.007;
    // marsCloudMesh.rotation.y += 0.0073;
    marsGlowMesh.rotation.y += 0.007;

    // Orbit of planets
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

    // Update camera position to follow Mars
    const cameraOffset = new THREE.Vector3(-1, -5, 2); // Adjust the offset as needed 4, -6, 8
    camera.position.copy(marsGroup.position).add(cameraOffset);
    camera.lookAt(marsGroup.position);
    controls.target.copy(marsGroup.position); // Update controls target to Mars position

    // Star animation
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

export { initSpaceBackground };