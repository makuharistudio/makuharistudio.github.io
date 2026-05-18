import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import {
  earth_mosaic_1,
  earth_mosaic_2_specular,
  earth_mosaic_3_bump,
  earth_mosaic_4_lights,
  earth_mosaic_5_clouds,
  earth_mosaic_6_clouds_transparent
} from '../../data/assets.js';

const SatelliteCoverageOptimiser = () => {
  const [satellites, setSatellites] = useState([]);
  const [coveragePercent, setCoveragePercent] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [timeScale, setTimeScale] = useState(3600);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [selectedSatId, setSelectedSatId] = useState(null);

  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const earthRef = useRef(null);
  const samplePointsRef = useRef(null);

  const satMeshesRef = useRef(new Map());
  const orbitLinesRef = useRef(new Map());
  const clockRef = useRef(null);

  const cameraAzimuthRef = useRef(Math.PI / 2);
  const cameraPolarRef = useRef(2 * Math.PI / 3);
  const cameraDistanceRef = useRef(5.5125);

  const resetCamera = useCallback(() => {
    if (!cameraRef.current) return;
    cameraAzimuthRef.current = Math.PI / 2;
    cameraPolarRef.current = 2 * Math.PI / 3;
    cameraDistanceRef.current = 5.5125;
    const x = cameraDistanceRef.current * Math.sin(cameraPolarRef.current) * Math.cos(cameraAzimuthRef.current);
    const z = cameraDistanceRef.current * Math.sin(cameraPolarRef.current) * Math.sin(cameraAzimuthRef.current);
    const y = cameraDistanceRef.current * Math.cos(cameraPolarRef.current);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 0, 0);
  }, []);

  const samplePositionsKmRef = useRef([]);

  const earthCoreRef = useRef(null);
  const cloudsRef = useRef(null);

  const EARTH_RADIUS_KM = 6371;
  const EARTH_RADIUS_SCENE = 1.5225;
  const SCALE = EARTH_RADIUS_SCENE / EARTH_RADIUS_KM;
  const MU_KM3_PER_S2 = 398600.4418;

  const toScene = (km) => km * SCALE;

  const getFresnelMat = ({ rimHex = 0x3399ff, facingHex = 0x000000 } = {}) => {
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
  };

  const getSatellitePosition = useCallback((sat, elapsedSeconds) => {
    const a = EARTH_RADIUS_KM + sat.altitude;
    const period = 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / MU_KM3_PER_S2);
    const angularSpeed = (2 * Math.PI) / period;
    const M = (sat.phase + angularSpeed * elapsedSeconds) % (2 * Math.PI);

    const perifocal = new THREE.Vector3(a * Math.cos(M), a * Math.sin(M), 0);

    const incRad = (sat.inclination * Math.PI) / 180;
    const raanRad = (sat.raan * Math.PI) / 180;
    const RzOmega = new THREE.Matrix4().makeRotationZ(-raanRad);
    const RxInc = new THREE.Matrix4().makeRotationX(-incRad);

    perifocal.applyMatrix4(RxInc).applyMatrix4(RzOmega);
    return perifocal.multiplyScalar(SCALE);
  }, []);

  const isPointCoveredBySat = (groundUnit, satPosScene) => {
    const rSat = satPosScene.length();
    const rEarth = EARTH_RADIUS_SCENE;
    const cosAlpha = rEarth / rSat;
    return groundUnit.dot(satPosScene.normalize()) > cosAlpha;
  };

  const calculateCoverage = useCallback((elapsedSeconds) => {
    if (!samplePositionsKmRef.current.length || satellites.length === 0) {
      setCoveragePercent(0);
      return;
    }

    let coveredCount = 0;
    const groundUnits = samplePositionsKmRef.current;

    for (let i = 0; i < groundUnits.length; i++) {
      let covered = false;
      for (const sat of satellites) {
        const satPos = getSatellitePosition(sat, elapsedSeconds);
        if (isPointCoveredBySat(groundUnits[i], satPos)) {
          covered = true;
          break;
        }
      }
      if (covered) coveredCount++;
    }

    const percent = Math.round((coveredCount / groundUnits.length) * 100);
    setCoveragePercent(percent);

    if (percent === 100 && !showWin) {
      setShowWin(true);
    }
  }, [satellites, getSatellitePosition, showWin]);

  const generateSamplePoints = () => {
    const points = [];
    const latSteps = 25;
    const lonSteps = 32;
    const latStep = 180 / latSteps;
    const lonStep = 360 / lonSteps;

    for (let lat = -90 + latStep / 2; lat <= 90; lat += latStep) {
      for (let lon = -180 + lonStep / 2; lon < 180; lon += lonStep) {
        const latRad = (lat * Math.PI) / 180;
        const lonRad = (lon * Math.PI) / 180;
        const x = Math.cos(latRad) * Math.cos(lonRad);
        const y = Math.cos(latRad) * Math.sin(lonRad);
        const z = Math.sin(latRad);
        points.push(new THREE.Vector3(x, y, z));
      }
    }
    return points;
  };

  const initThree = useCallback(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 0.025));
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
    sunLight.position.set(20, 10, 15);
    scene.add(sunLight);

    // Earth
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
    earthMesh.rotation.x = Math.PI / 2;

    const nightLights = new THREE.MeshBasicMaterial({
      map: loader.load(earth_mosaic_4_lights),
      blending: THREE.AdditiveBlending,
    });
    const nightMesh = new THREE.Mesh(earthGeometry, nightLights);
    nightMesh.rotation.x = Math.PI / 2;

    const cloudsMat = new THREE.MeshStandardMaterial({
      map: loader.load(earth_mosaic_5_clouds),
      transparent: true,
      opacity: 0.6,
      alphaMap: loader.load(earth_mosaic_6_clouds_transparent),
      blending: THREE.AdditiveBlending,
    });
    const clouds = new THREE.Mesh(earthGeometry, cloudsMat);
    clouds.rotation.x = Math.PI / 2;
    clouds.scale.setScalar(1.004);

    const glowMat = getFresnelMat({ rimHex: 0x88ccff });
    const glowMesh = new THREE.Mesh(earthGeometry, glowMat);
    glowMesh.rotation.x = Math.PI / 2;
    glowMesh.scale.setScalar(1.012);

    const earthCore = new THREE.Group();
    earthCore.add(earthMesh, nightMesh, glowMesh);
    earthCoreRef.current = earthCore;

    cloudsRef.current = clouds;

    const earthGroup = new THREE.Group();
    earthGroup.add(earthCore, clouds);
    earthGroup.rotation.z = 0;
    earthGroup.rotation.x = -90 * Math.PI / 180;
    earthGroup.scale.setScalar(EARTH_RADIUS_SCENE);

    // Tilt group for Earth's axis (23.5° tilt)
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.x = 44.8 * Math.PI / 180;
    tiltGroup.add(earthGroup);

    // Pole markers
    const poleGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const poleMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const northPole = new THREE.Mesh(poleGeo, poleMat);
    northPole.position.set(0, EARTH_RADIUS_SCENE, 0);
    const southPoleMat = new THREE.MeshBasicMaterial({ color: 0x0077FF });
    const southPole = new THREE.Mesh(poleGeo, southPoleMat);
    southPole.position.set(0, -EARTH_RADIUS_SCENE, 0);
    tiltGroup.add(northPole, southPole);

    scene.add(tiltGroup);

    earthRef.current = tiltGroup;

    // Sample points
    const samplePoints = generateSamplePoints();
    samplePositionsKmRef.current = samplePoints;

    const pointsGeo = new THREE.BufferGeometry();
    const pointPositions = new Float32Array(samplePoints.length * 3);
    const pointColors = new Float32Array(samplePoints.length * 3);

    samplePoints.forEach((unit, i) => {
      const pos = unit.clone().multiplyScalar(EARTH_RADIUS_SCENE * 1.02);
      pointPositions[i * 3] = pos.x; pointPositions[i * 3 + 1] = pos.y; pointPositions[i * 3 + 2] = pos.z;
      pointColors[i * 3] = 0.4; pointColors[i * 3 + 1] = 0.4; pointColors[i * 3 + 2] = 0.4;
    });

    pointsGeo.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
    pointsGeo.setAttribute('color', new THREE.BufferAttribute(pointColors, 3));

    const pointsMat = new THREE.PointsMaterial({ size: 3.0, vertexColors: true, transparent: true, opacity: 0.85, sizeAttenuation: false });
    const pointsMesh = new THREE.Points(pointsGeo, pointsMat);
    samplePointsRef.current = pointsMesh;
    samplePointsRef.current.rotation.x = THREE.MathUtils.degToRad(-45);
    scene.add(pointsMesh);

    // Camera setup
    const updateCamera = () => {
      if (!cameraRef.current) return;
      const x = cameraDistanceRef.current * Math.sin(cameraPolarRef.current) * Math.cos(cameraAzimuthRef.current);
      const z = cameraDistanceRef.current * Math.sin(cameraPolarRef.current) * Math.sin(cameraAzimuthRef.current);
      const y = cameraDistanceRef.current * Math.cos(cameraPolarRef.current);
      cameraRef.current.position.set(x, y, z);
      cameraRef.current.lookAt(0, 0, 0);
    };
    updateCamera();

    clockRef.current = new THREE.Clock();

    let lastUpdate = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();

      if (earthRef.current) earthRef.current.rotation.y = elapsed * 0.4;

      satMeshesRef.current.forEach((mesh, id) => {
        const sat = satellites.find(s => s.id === id);
        if (sat) mesh.position.copy(getSatellitePosition(sat, elapsed * timeScale));
      });

      if (elapsed - lastUpdate > 0.25) {
        calculateCoverage(elapsed * timeScale);
        lastUpdate = elapsed;

        if (samplePointsRef.current) {
          const colors = samplePointsRef.current.geometry.getAttribute('color').array;
          const groundUnits = samplePositionsKmRef.current;
          for (let i = 0; i < groundUnits.length; i++) {
            let covered = false;
            for (const sat of satellites) {
              if (isPointCoveredBySat(groundUnits[i], getSatellitePosition(sat, elapsed * timeScale))) {
                covered = true;
                break;
              }
            }
            const idx = i * 3;
            if (covered) {
              colors[idx] = 0; colors[idx + 1] = 1; colors[idx + 2] = 0.3;
            } else {
              colors[idx] = 1; colors[idx + 1] = 0.1; colors[idx + 2] = 0.1;
            }
          }
          samplePointsRef.current.geometry.getAttribute('color').needsUpdate = true;
        }
      }

      if (rendererRef.current && cameraRef.current) rendererRef.current.render(scene, cameraRef.current);
    };
    animate();

    // Drag controls (touch + mouse)
    let isDragging = false;
    let prevX = 0, prevY = 0;

    const onDown = (e) => {
      isDragging = true;
      prevX = e.clientX || (e.touches && e.touches[0].clientX);
      prevY = e.clientY || (e.touches && e.touches[0].clientY);
    };

    const onMove = (e) => {
      if (!isDragging) return;
      const cx = e.clientX || (e.touches && e.touches[0].clientX);
      const cy = e.clientY || (e.touches && e.touches[0].clientY);

      cameraAzimuthRef.current += (cx - prevX) * 0.003;
      cameraPolarRef.current = Math.max(0.2, Math.min(Math.PI - 0.2, cameraPolarRef.current + (cy - prevY) * 0.003));

      updateCamera();
      prevX = cx;
      prevY = cy;
    };

    const onUp = () => { isDragging = false; };

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onUp);
    canvas.addEventListener('mouseleave', onUp);
    canvas.addEventListener('touchstart', onDown);
    canvas.addEventListener('touchmove', onMove);
    canvas.addEventListener('touchend', onUp);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const clickHandler = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(Array.from(satMeshesRef.current.values()));
      if (intersects.length > 0) {
        const selectedMesh = intersects[0].object;
        const selectedId = Array.from(satMeshesRef.current.entries()).find(([id, mesh]) => mesh === selectedMesh)?.[0];
        setSelectedSatId(selectedId);
      }
    };

    canvas.addEventListener('click', clickHandler);

    window.__threeCleanup = () => {
      canvas.removeEventListener('mousedown', onDown);
      // ... (other listeners removed similarly)
      canvas.removeEventListener('click', clickHandler);
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, [calculateCoverage, getSatellitePosition]);

  const handleResize = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    setIsPortrait(h > w);
    if (cameraRef.current && rendererRef.current) {
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    }
  }, []);

  const addSatellite = () => {
    const types = ['LEO', 'MEO', 'GEO'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    let altitude, inclination, color;
    if (chosenType === 'LEO') {
      altitude = 300 + Math.random() * 1700; // 300-2000 km
      inclination = 45 + Math.random() * 45;
      color = '#00ff00'; // green
    } else if (chosenType === 'MEO') {
      altitude = 8000 + Math.random() * 12000; // 8000-20000 km
      inclination = 45 + Math.random() * 45;
      color = '#ffa500'; // orange
    } else { // GEO
      altitude = 35786; // fixed
      inclination = 0; // equatorial
      color = '#ffff00'; // yellow
    }
    const newSat = {
      id: Date.now(),
      type: chosenType,
      altitude,
      inclination,
      raan: Math.random() * 360,
      phase: Math.random() * Math.PI * 2,
      color,
    };
    setSatellites(prev => [...prev, newSat]);
  };

  const removeSatellite = (id) => setSatellites(prev => prev.filter(s => s.id !== id));

  const updateSatellite = (id, updates) => {
    setSatellites(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // Recreate satellite meshes when list changes
  useEffect(() => {
    if (!sceneRef.current) return;
  satMeshesRef.current.forEach(m => { if (m.parent) m.parent.remove(m); });
  orbitLinesRef.current.forEach(l => { if (l.parent) l.parent.remove(l); });
    satMeshesRef.current.clear();
    orbitLinesRef.current.clear();

    satellites.forEach(sat => {
      const satGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const satMat = new THREE.MeshPhongMaterial({ color: sat.color, emissive: sat.color, emissiveIntensity: 0.6 });
      const mesh = new THREE.Mesh(satGeo, satMat);
      sceneRef.current.add(mesh);
      satMeshesRef.current.set(sat.id, mesh);
      if (sat.id === selectedSatId) mesh.scale.setScalar(1.5);

      // Orbit line (realistic)
      const points = [];
      const aScene = toScene(EARTH_RADIUS_KM + sat.altitude);
      for (let i = 0; i <= 256; i++) {
        const ang = (i / 256) * Math.PI * 2;
        let p = new THREE.Vector3(aScene * Math.cos(ang), aScene * Math.sin(ang), 0);
        const incRad = (sat.inclination * Math.PI) / 180;
        const raanRad = (sat.raan * Math.PI) / 180;
        p.applyMatrix4(new THREE.Matrix4().makeRotationX(-incRad))
         .applyMatrix4(new THREE.Matrix4().makeRotationZ(-raanRad));
        points.push(p);
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: sat.color, transparent: true, opacity: 0.3, linewidth: 2 }));
      sceneRef.current.add(line);
      orbitLinesRef.current.set(sat.id, line);

      // Circular ends at poles for polar orbits
      if (sat.inclination > 80) {
        const ringGeo = new THREE.RingGeometry(0.1, 0.15, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: sat.color, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
        const northRing = new THREE.Mesh(ringGeo, ringMat);
        northRing.position.set(0, EARTH_RADIUS_SCENE + 0.1, 0);
        northRing.rotation.x = Math.PI / 2;
        earthRef.current.add(northRing);
        orbitLinesRef.current.set(`${sat.id}-north`, northRing);

        const southRing = new THREE.Mesh(ringGeo, ringMat);
        southRing.position.set(0, -EARTH_RADIUS_SCENE - 0.1, 0);
        southRing.rotation.x = Math.PI / 2;
        earthRef.current.add(southRing);
        orbitLinesRef.current.set(`${sat.id}-south`, southRing);
      }
    });
  }, [satellites, selectedSatId]);





  useEffect(() => {
    initThree();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (rendererRef.current && mountRef.current) mountRef.current.removeChild(rendererRef.current.domElement);
      if (window.__threeCleanup) window.__threeCleanup();
    };
  }, [initThree, handleResize]);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          #controls {
            position: absolute;
            left: 0;
            top: 0;
          }
        `
      }} />
      <div className="relative w-screen h-screen bg-black overflow-hidden text-white font-mono">
      {/* Full-screen 3D Globe (always interactive) */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Overlay Controls */}
      <div id="controls" className="absolute top-0 left-0 w-72 h-full bg-zinc-950/80 backdrop-blur-md border-r border-zinc-700 p-3 overflow-y-auto z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tighter">SATELLITE COVERAGE OPTIMIZER</h1>
            <p className="text-emerald-400 text-sm">Multi-Orbit LEO/MEO/GEO Constellation Design</p>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-mono font-bold tabular-nums transition-colors ${coveragePercent === 100 ? 'text-emerald-400' : 'text-white'}`}>
              {coveragePercent}%
            </div>
            <div className="text-xs text-zinc-400">GLOBAL COVERAGE</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6 text-xs text-center">
          <div className="bg-zinc-900 rounded-xl p-3">
            <div className="text-emerald-400">SATELLITES</div>
            <div className="font-mono text-2xl">{satellites.length}</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-3">
            <div className="text-sky-400">TARGET</div>
            <div className="font-mono text-2xl">100%</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-3">
            <div className="text-amber-400">SPEED</div>
            <div className="font-mono text-2xl">{timeScale}×</div>
          </div>
        </div>

        <div className="space-y-5 mb-8">
          {satellites.map(sat => (
            <div key={sat.id} className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: sat.color }} />
                  <span>SAT-{sat.id.toString().slice(-4)} ({sat.type})</span>
                </div>
                <button onClick={() => removeSatellite(sat.id)} className="text-red-400 text-2xl">×</button>
              </div>

              {/* Type selector */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>TYPE</span>
                  <span className="font-mono">{sat.type}</span>
                </div>
                <select
                  value={sat.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    let updates = { type: newType };
                    if (newType === 'LEO') {
                      updates.altitude = 300 + Math.random() * 1700;
                      updates.inclination = 45 + Math.random() * 45;
                      updates.color = '#00ff00';
                    } else if (newType === 'MEO') {
                      updates.altitude = 8000 + Math.random() * 12000;
                      updates.inclination = 45 + Math.random() * 45;
                      updates.color = '#ffa500';
                    } else { // GEO
                      updates.altitude = 35786;
                      updates.inclination = 0;
                      updates.color = '#ffff00';
                    }
                    updateSatellite(sat.id, updates);
                  }}
                  className="w-full bg-zinc-800 text-white rounded px-2 py-1"
                >
                  <option value="LEO">LEO (Low Earth Orbit)</option>
                  <option value="MEO">MEO (Medium Earth Orbit)</option>
                  <option value="GEO">GEO (Geostationary)</option>
                </select>
              </div>

              {/* Sliders for each parameter */}
              {['altitude', 'inclination', 'raan', 'phase'].map(param => {
                let min, max, step, disabled = false;
                if (param === 'altitude') {
                  if (sat.type === 'LEO') { min = 300; max = 2000; step = 50; }
                  else if (sat.type === 'MEO') { min = 8000; max = 20000; step = 500; }
                  else { min = 35786; max = 35786; step = 1; disabled = true; }
                } else if (param === 'inclination') {
                  if (sat.type === 'GEO') { min = 0; max = 0; step = 1; disabled = true; }
                  else { min = 0; max = 180; step = 1; }
                } else {
                  min = 0; max = 360; step = 1;
                }
                return (
                  <div key={param}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{param.toUpperCase().replace('RAAN', 'RAAN (Plane)')}</span>
                      <span className="font-mono">
                        {param === 'phase' ? (sat.phase * 180 / Math.PI).toFixed(0) + '°' :
                         param === 'altitude' ? sat.altitude.toFixed(0) + ' km' : sat[param].toFixed(0) + (param === 'inclination' ? '°' : '°')}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      disabled={disabled}
                      value={param === 'phase' ? sat.phase * 180 / Math.PI : sat[param]}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        updateSatellite(sat.id, param === 'phase' ? { phase: val * Math.PI / 180 } : { [param]: val });
                      }}
                      className="w-full accent-emerald-400"
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>



        <div className="flex gap-3">
          <button onClick={addSatellite} className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-5 rounded-3xl text-lg font-semibold flex items-center justify-center gap-2">
            + ADD SATELLITE
          </button>
          <button onClick={() => setSatellites([])} className="px-8 bg-zinc-800 hover:bg-zinc-700 rounded-3xl text-sm">CLEAR</button>
          <button onClick={resetCamera} className="px-8 bg-zinc-800 hover:bg-zinc-700 rounded-3xl text-sm">Reset camera</button>
        </div>

        <div className="mt-6 flex items-center gap-3 text-sm">
          <span>SIM SPEED</span>
          <input type="range" min="30" max="600" step="30" value={timeScale} onChange={e => setTimeScale(+e.target.value)} className="flex-1 accent-amber-400" />
          <span className="font-mono w-12">{timeScale}×</span>
        </div>


      </div>

      {/* WIN SCREEN */}
      {showWin && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-20">
          <div className="text-center max-w-md px-8">
            <div className="text-8xl mb-6">🎉</div>
            <h2 className="text-5xl font-bold text-emerald-400 mb-4">MISSION SUCCESS</h2>
            <p className="text-2xl mb-8">You achieved 100% global coverage</p>
            <div className="text-zinc-300 mb-10">
              This is how modern mega-constellations like Starlink provide near-continuous service worldwide using carefully phased orbital planes.
            </div>
            <button
              onClick={() => { setShowWin(false); setSatellites([]); setCoveragePercent(0); }}
              className="px-12 py-5 bg-white text-black rounded-3xl text-xl font-semibold hover:bg-emerald-400 transition-colors"
            >
              DESIGN ANOTHER CONSTELLATION
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default SatelliteCoverageOptimiser;