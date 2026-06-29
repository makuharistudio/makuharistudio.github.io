/*
---
title: Satellite Coverage Optimiser
photo: ./SatelliteCoverageOptimiser.png
desc: A game that teaches you the spacial positioning of satellites to maximise global coverage.
---
*/

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import {
  earth_mosaic_1,
  earth_mosaic_2_specular,
  earth_mosaic_3_bump,
  earth_mosaic_4_lights,
  earth_mosaic_5_clouds,
  earth_mosaic_6_clouds_transparent
} from '../../data/assets.js';

// Match site layout insets (see App.css #outlet on portrait)
const SITE_FOOTER_HEIGHT = 'calc(var(--menu-footer-button-width, 15vw) * 2.5)';
const SITE_TOP_INSET_PORTRAIT = 'var(--menu-footer-button-width, 15vw)';
const PANEL_ABOVE_FOOTER_GAP = '0.75rem';
const PORTRAIT_SHELL_BOTTOM = `calc(${SITE_FOOTER_HEIGHT} + ${PANEL_ABOVE_FOOTER_GAP})`;
const PORTRAIT_MODAL_MAX_HEIGHT = `calc(100vh - ${SITE_TOP_INSET_PORTRAIT} - ${SITE_FOOTER_HEIGHT} - ${PANEL_ABOVE_FOOTER_GAP} - 1.5rem)`;

const MIN_ELEVATION_DEG = 10;
const SAT_COST = { LEO: 1, MEO: 5, GEO: 14 };
const MIN_METRIC_SAMPLES = 12;

const MISSION_MODES = {
  emergency: {
    id: 'emergency',
    label: 'Emergency Comms',
    tagline: 'SOS & disaster relay — stay reachable almost everywhere',
    realExample: 'Iridium-style phone networks',
    targets: { timeAvg: 90, worstPoint: 72, dualCover: 80, maxSats: 16, maxCost: 22 },
    weights: { timeAvg: 0.32, worstPoint: 0.28, cost: 0.25, dualCover: 0.15 },
    winScore: 72,
    kpis: ['timeAvg', 'worstPoint', 'dualCover', 'cost'],
  },
  broadband: {
    id: 'broadband',
    label: 'Broadband Internet',
    tagline: 'Fast, low-delay internet for homes, ships & planes',
    realExample: 'Starlink-style LEO mega-constellations',
    targets: { timeAvg: 86, polar: 78, dualCover: 75, maxCost: 35, minLeoShare: 0.65 },
    weights: { timeAvg: 0.28, polar: 0.27, cost: 0.22, leoMix: 0.13, dualCover: 0.10 },
    winScore: 70,
    kpis: ['timeAvg', 'polar', 'dualCover', 'cost'],
  },
  broadcast: {
    id: 'broadcast',
    label: 'TV Broadcast',
    tagline: 'Stable TV & radio across continents with few satellites',
    realExample: 'Fixed GEO slots for continental TV & radio broadcast',
    targets: { equatorial: 94, maxSats: 5, maxCost: 42, minGeo: 2 },
    weights: { equatorial: 0.42, cost: 0.33, geoFleet: 0.25 },
    winScore: 68,
    kpis: ['equatorial', 'cost', 'geoCount'],
  },
  navigation: {
    id: 'navigation',
    label: 'GPS Navigation',
    tagline: 'Precise positioning — receivers need 4+ satellites',
    realExample: 'GPS, Galileo & BeiDou MEO navigation',
    targets: { timeAvg: 82, fourFoldPoints: 85, maxCost: 45, minMeoShare: 0.5 },
    weights: { fourFold: 0.38, timeAvg: 0.28, cost: 0.2, meoMix: 0.14 },
    winScore: 74,
    kpis: ['fourFold', 'timeAvg', 'cost'],
  },
};

const KPI_LABELS = {
  timeAvg: 'Time-averaged coverage',
  worstPoint: 'Worst-region coverage',
  dualCover: 'Dual-satellite availability',
  polar: 'Polar coverage',
  equatorial: 'Equatorial coverage',
  fourFold: '4+ satellite points',
  cost: 'Fleet cost',
  geoCount: 'GEO satellites',
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function getConstellationCost(satellites) {
  return satellites.reduce((sum, sat) => sum + (SAT_COST[sat.type] || 1), 0);
}

function getFleetMix(satellites) {
  if (!satellites.length) return { leo: 0, meo: 0, geo: 0, geoCount: 0 };
  const counts = { LEO: 0, MEO: 0, GEO: 0 };
  satellites.forEach((sat) => { counts[sat.type] += 1; });
  const total = satellites.length;
  return {
    leo: counts.LEO / total,
    meo: counts.MEO / total,
    geo: counts.GEO / total,
    geoCount: counts.GEO,
  };
}

function createEmptyMetrics(pointCount) {
  return {
    samples: 0,
    pointCoverCount: new Float32Array(pointCount),
    pointDualCoverCount: new Float32Array(pointCount),
    pointQuadCoverCount: new Float32Array(pointCount),
  };
}

function deriveCoverageMetrics(metrics, sampleMeta) {
  const samples = Math.max(metrics.samples, 1);
  const pointFracs = Array.from(metrics.pointCoverCount, (count) => count / samples);
  const dualFracs = Array.from(metrics.pointDualCoverCount, (count) => count / samples);
  const quadFracs = Array.from(metrics.pointQuadCoverCount, (count) => count / samples);

  const polarFracs = sampleMeta.filter((m) => m.isPolar).map((m) => pointFracs[m.index]);
  const equatorialFracs = sampleMeta.filter((m) => m.isEquatorial).map((m) => pointFracs[m.index]);

  return {
    timeAvg: avg(pointFracs) * 100,
    worstPoint: pointFracs.length ? Math.min(...pointFracs) * 100 : 0,
    dualCover: avg(dualFracs) * 100,
    polar: avg(polarFracs) * 100,
    equatorial: avg(equatorialFracs) * 100,
    fourFoldPoints: pointFracs.length
      ? (pointFracs.filter((_, i) => quadFracs[i] >= 0.75).length / pointFracs.length) * 100
      : 0,
    samples: metrics.samples,
  };
}

function targetSubscore(value, target, higherIsBetter = true) {
  if (target <= 0) return 0;
  const ratio = higherIsBetter ? value / target : target / Math.max(value, 0.001);
  return clamp(ratio * 100, 0, 100);
}

function costSubscore(cost, maxCost, satCount, maxSats) {
  if (cost <= 0) return 0;
  let score = cost <= maxCost
    ? 80 + 20 * (1 - cost / maxCost)
    : Math.max(0, 100 - (cost - maxCost) * 4);
  if (satCount > maxSats) score *= Math.max(0.35, maxSats / satCount);
  return clamp(score, 0, 100);
}

function scoreMission(mission, coverageMetrics, satellites) {
  const cost = getConstellationCost(satellites);
  const mix = getFleetMix(satellites);
  const breakdown = [];
  let score = 0;

  const add = (id, label, value, target, subscore, weight, fmt) => {
    breakdown.push({ id, label, value, target, subscore: Math.round(subscore), weight, fmt });
    score += subscore * weight;
  };

  if (mission.weights.timeAvg) {
    add('timeAvg', KPI_LABELS.timeAvg, coverageMetrics.timeAvg, mission.targets.timeAvg,
      targetSubscore(coverageMetrics.timeAvg, mission.targets.timeAvg), mission.weights.timeAvg, '%');
  }
  if (mission.weights.worstPoint) {
    add('worstPoint', KPI_LABELS.worstPoint, coverageMetrics.worstPoint, mission.targets.worstPoint,
      targetSubscore(coverageMetrics.worstPoint, mission.targets.worstPoint), mission.weights.worstPoint, '%');
  }
  if (mission.weights.dualCover) {
    add('dualCover', KPI_LABELS.dualCover, coverageMetrics.dualCover, mission.targets.dualCover,
      targetSubscore(coverageMetrics.dualCover, mission.targets.dualCover), mission.weights.dualCover, '%');
  }
  if (mission.weights.polar) {
    add('polar', KPI_LABELS.polar, coverageMetrics.polar, mission.targets.polar,
      targetSubscore(coverageMetrics.polar, mission.targets.polar), mission.weights.polar, '%');
  }
  if (mission.weights.equatorial) {
    add('equatorial', KPI_LABELS.equatorial, coverageMetrics.equatorial, mission.targets.equatorial,
      targetSubscore(coverageMetrics.equatorial, mission.targets.equatorial), mission.weights.equatorial, '%');
  }
  if (mission.weights.fourFold) {
    add('fourFold', KPI_LABELS.fourFold, coverageMetrics.fourFoldPoints, mission.targets.fourFoldPoints,
      targetSubscore(coverageMetrics.fourFoldPoints, mission.targets.fourFoldPoints), mission.weights.fourFold, '%');
  }
  if (mission.weights.cost) {
    add('cost', KPI_LABELS.cost, cost, mission.targets.maxCost,
      costSubscore(cost, mission.targets.maxCost, satellites.length, mission.targets.maxSats), mission.weights.cost, ' pts');
  }
  if (mission.weights.geoFleet) {
    add('geoFleet', 'GEO fleet size', mix.geoCount, mission.targets.minGeo,
      targetSubscore(mix.geoCount, mission.targets.minGeo), mission.weights.geoFleet, ' sats');
  }
  if (mission.weights.leoMix) {
    add('leoMix', 'LEO fleet share', mix.leo * 100, mission.targets.minLeoShare * 100,
      targetSubscore(mix.leo, mission.targets.minLeoShare), mission.weights.leoMix, '%');
  }
  if (mission.weights.meoMix) {
    add('meoMix', 'MEO fleet share', mix.meo * 100, mission.targets.minMeoShare * 100,
      targetSubscore(mix.meo, mission.targets.minMeoShare), mission.weights.meoMix, '%');
  }

  const finalScore = Math.round(clamp(score, 0, 100));
  return {
    score: finalScore,
    passed: finalScore >= mission.winScore,
    breakdown,
    cost,
    coverageMetrics,
    mix,
  };
}

// ─── Theme hooks (shared pattern with DualNBack) ─────────────────────────────

function useSiteTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute('data-theme') || 'light');
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}

function useIsCompact() {
  const [compact, setCompact] = useState(() => window.innerWidth < 640);

  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return compact;
}

function useThemePalette(isDark) {
  return useMemo(
    () => ({
      bg: 'var(--content-background)',
      text: 'var(--content-font-color)',
      accent: 'var(--content-font-color-hover)',
      border: 'var(--border)',
      panel: 'var(--text-background)',
      button: 'var(--button-font-color)',
      buttonHover: 'var(--button-font-color-hover)',
      font: 'var(--content-font)',
      titleFont: 'var(--title-font)',
      success: isDark ? '#4ade80' : '#15803d',
      error: isDark ? '#f87171' : '#b91c1c',
      warn: isDark ? '#fbbf24' : '#b45309',
      muted: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(20,20,30,0.55)',
      overlay: isDark ? 'rgba(0,0,0,0.72)' : 'rgba(255,255,255,0.82)',
      inputBg: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.65)',
      canvasWash: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.08)',
    }),
    [isDark]
  );
}

function primaryBtn(palette, compact) {
  return {
    background: palette.panel,
    border: palette.border,
    color: palette.buttonHover,
    borderRadius: 8,
    cursor: 'pointer',
    padding: compact ? '0.65rem 1rem' : '0.75rem 1.25rem',
    fontFamily: palette.titleFont,
    fontSize: compact ? '0.85rem' : '0.95rem',
    fontWeight: 600,
    touchAction: 'manipulation',
  };
}

function secondaryBtn(palette, compact) {
  return {
    background: palette.inputBg,
    border: palette.border,
    color: palette.text,
    borderRadius: 8,
    cursor: 'pointer',
    padding: compact ? '0.55rem 0.85rem' : '0.65rem 1rem',
    fontFamily: palette.font,
    fontSize: compact ? '0.8rem' : '0.85rem',
    touchAction: 'manipulation',
  };
}

function iconBtn(palette) {
  return {
    background: 'transparent',
    border: palette.border,
    color: palette.error,
    borderRadius: 6,
    cursor: 'pointer',
    padding: '0.15rem 0.45rem',
    fontFamily: palette.font,
    fontSize: '1.25rem',
    lineHeight: 1,
  };
}

function statCard(palette) {
  return {
    background: palette.panel,
    border: palette.border,
    borderRadius: 8,
    padding: '0.65rem 0.5rem',
    textAlign: 'center',
  };
}

function Modal({ open, onClose, title, children, palette, compact, portrait }) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: portrait ? 'flex-start' : 'center',
        justifyContent: 'center',
        padding: portrait
          ? `${SITE_TOP_INSET_PORTRAIT} ${compact ? '1rem' : '1.25rem'} ${PORTRAIT_SHELL_BOTTOM}`
          : (compact ? '1rem' : '2rem'),
        background: palette.overlay,
        backdropFilter: 'blur(4px)',
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 600,
          width: '100%',
          maxHeight: portrait ? PORTRAIT_MODAL_MAX_HEIGHT : '85vh',
          overflowY: 'auto',
          background: palette.bg,
          color: palette.text,
          border: palette.border,
          borderRadius: 8,
          padding: compact ? '1.25rem' : '1.75rem',
          fontFamily: palette.font,
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <h2
            id="modal-title"
            style={{
              margin: 0,
              fontFamily: palette.titleFont,
              fontSize: compact ? '1.15rem' : '1.35rem',
              color: palette.accent,
            }}
          >
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" style={iconBtn(palette)}>
            ✕
          </button>
        </div>
        <div style={{ marginTop: '1rem', lineHeight: 1.65, fontSize: compact ? '0.95rem' : '1rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function KpiMeter({ label, value, target, unit, palette, compact }) {
  const pct = target > 0 ? clamp((value / target) * 100, 0, 100) : 0;
  const met = value >= target;
  return (
    <div style={{ marginBottom: compact ? '0.45rem' : '0.55rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.72rem',
        color: palette.muted,
        marginBottom: '0.2rem',
        gap: '0.5rem',
      }}
      >
        <span>{label}</span>
        <span style={{ color: met ? palette.success : palette.text, fontFamily: palette.titleFont }}>
          {typeof value === 'number' ? (unit === ' pts' || unit === ' sats' ? Math.round(value) : Math.round(value)) : value}
          {unit}
          {' '}/ {target}{unit}
        </span>
      </div>
      <div style={{ height: 6, background: palette.inputBg, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: met ? palette.success : palette.accent,
          borderRadius: 4,
          transition: 'width 0.25s ease',
        }}
        />
      </div>
    </div>
  );
}

const SatelliteCoverageOptimiser = () => {
  const siteTheme = useSiteTheme();
  const isDark = siteTheme === 'dark';
  const palette = useThemePalette(isDark);
  const compact = useIsCompact();

  const pointColorsRef = useRef({
    covered: [0, 1, 0.3],
    uncovered: [1, 0.1, 0.1],
    idle: [0.4, 0.4, 0.4],
  });

  useEffect(() => {
    pointColorsRef.current = isDark
      ? { covered: [0.18, 0.92, 0.48], uncovered: [0.97, 0.28, 0.28], idle: [0.4, 0.4, 0.4] }
      : { covered: [0.08, 0.5, 0.24], uncovered: [0.73, 0.11, 0.11], idle: [0.55, 0.55, 0.6] };
  }, [isDark]);
  const [satellites, setSatellites] = useState([]);
  const [coveragePercent, setCoveragePercent] = useState(0);
  const [timeScale, setTimeScale] = useState(3600);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [selectedSatId, setSelectedSatId] = useState(null);
  const [missionMode, setMissionMode] = useState('emergency');
  const [showHelp, setShowHelp] = useState(false);
  const [showMissionResult, setShowMissionResult] = useState(false);
  const [missionScore, setMissionScore] = useState(0);
  const [missionResult, setMissionResult] = useState(null);
  const [liveKpis, setLiveKpis] = useState(null);

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
  const isPortraitRef = useRef(window.innerHeight > window.innerWidth);

  const BASE_CAMERA_DISTANCE = 5.5125;
  const PORTRAIT_EARTH_SIZE_FACTOR = 1.5;
  const PORTRAIT_CAMERA_DISTANCE = 6.1 / PORTRAIT_EARTH_SIZE_FACTOR;
  const PORTRAIT_LOOK_AT_Y = -0.42; // look below centre so Earth sits higher in frame

  const updateCameraFromOrbit = useCallback(() => {
    if (!cameraRef.current) return;
    const portrait = isPortraitRef.current;
    const dist = portrait ? PORTRAIT_CAMERA_DISTANCE : BASE_CAMERA_DISTANCE;
    cameraDistanceRef.current = dist;

    const x = dist * Math.sin(cameraPolarRef.current) * Math.cos(cameraAzimuthRef.current);
    const z = dist * Math.sin(cameraPolarRef.current) * Math.sin(cameraAzimuthRef.current);
    const y = dist * Math.cos(cameraPolarRef.current);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, portrait ? PORTRAIT_LOOK_AT_Y : 0, 0);
  }, []);

  const resetCamera = useCallback(() => {
    cameraAzimuthRef.current = Math.PI / 2;
    cameraPolarRef.current = 2 * Math.PI / 3;
    updateCameraFromOrbit();
  }, [updateCameraFromOrbit]);

  const updateViewportSize = useCallback(() => {
    const mount = mountRef.current;
    if (!mount || !cameraRef.current || !rendererRef.current) return;

    const portrait = window.innerHeight > window.innerWidth;
    isPortraitRef.current = portrait;
    setIsPortrait(portrait);

    const cw = mount.clientWidth;
    const ch = mount.clientHeight;
    if (cw === 0 || ch === 0) return;

    cameraRef.current.aspect = cw / ch;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(cw, ch);
    updateCameraFromOrbit();
  }, [updateCameraFromOrbit]);

  const samplePositionsKmRef = useRef([]);
  const samplePointMetaRef = useRef([]);
  const metricsRef = useRef(createEmptyMetrics(0));
  const missionModeRef = useRef(missionMode);

  const activeMission = MISSION_MODES[missionMode];

  useEffect(() => {
    missionModeRef.current = missionMode;
  }, [missionMode]);

  const resetMetrics = useCallback(() => {
    metricsRef.current = createEmptyMetrics(samplePositionsKmRef.current.length);
    setMissionScore(0);
    setLiveKpis(null);
    setShowMissionResult(false);
    setMissionResult(null);
  }, []);

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
    const satDir = satPosScene.clone().normalize();
    const cosAlpha = rEarth / rSat;
    if (groundUnit.dot(satDir) <= cosAlpha) return false;

    const cosZenith = groundUnit.dot(satDir);
    const zenithRad = Math.acos(clamp(cosZenith, -1, 1));
    const elevRad = (Math.PI / 2) - zenithRad;
    return elevRad >= (MIN_ELEVATION_DEG * Math.PI) / 180;
  };

  const countVisibleSats = useCallback((groundUnit, elapsedSeconds) => {
    let count = 0;
    for (const sat of satellites) {
      const satPos = getSatellitePosition(sat, elapsedSeconds);
      if (isPointCoveredBySat(groundUnit, satPos)) count += 1;
    }
    return count;
  }, [satellites, getSatellitePosition]);

  const updateMissionMetrics = useCallback((elapsedSeconds) => {
    const groundUnits = samplePositionsKmRef.current;
    const metrics = metricsRef.current;
    if (!groundUnits.length || !satellites.length) return;

    metrics.samples += 1;
    for (let i = 0; i < groundUnits.length; i++) {
      const visible = countVisibleSats(groundUnits[i], elapsedSeconds);
      if (visible > 0) metrics.pointCoverCount[i] += 1;
      if (visible >= 2) metrics.pointDualCoverCount[i] += 1;
      if (visible >= 4) metrics.pointQuadCoverCount[i] += 1;
    }

    if (metrics.samples >= MIN_METRIC_SAMPLES) {
      const coverageMetrics = deriveCoverageMetrics(metrics, samplePointMetaRef.current);
      const result = scoreMission(MISSION_MODES[missionModeRef.current], coverageMetrics, satellites);
      setMissionScore(result.score);
      setLiveKpis({ coverageMetrics, cost: result.cost, mix: result.mix });
    }
  }, [satellites, countVisibleSats]);

  const calculateCoverage = useCallback((elapsedSeconds) => {
    if (!samplePositionsKmRef.current.length || satellites.length === 0) {
      setCoveragePercent(0);
      return;
    }

    let coveredCount = 0;
    const groundUnits = samplePositionsKmRef.current;

    for (let i = 0; i < groundUnits.length; i++) {
      if (countVisibleSats(groundUnits[i], elapsedSeconds) > 0) coveredCount += 1;
    }

    setCoveragePercent(Math.round((coveredCount / groundUnits.length) * 100));
    updateMissionMetrics(elapsedSeconds);
  }, [satellites, countVisibleSats, updateMissionMetrics]);

  const generateSamplePoints = () => {
    const points = [];
    const meta = [];
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
        const index = points.length;
        points.push(new THREE.Vector3(x, y, z));
        meta.push({
          index,
          lat,
          lon,
          isPolar: Math.abs(lat) >= 55,
          isEquatorial: Math.abs(lat) <= 35,
        });
      }
    }
    samplePointMetaRef.current = meta;
    metricsRef.current = createEmptyMetrics(points.length);
    return points;
  };

  const initThree = useCallback(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const mount = mountRef.current;
    const initW = mount.clientWidth || window.innerWidth;
    const initH = mount.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(60, initW / initH, 0.1, 100);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(initW, initH);
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

    const glowMat = getFresnelMat({ rimHex: isDark ? 0x88ccff : 0x006ed2 });
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

    updateCameraFromOrbit();

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
            const pt = pointColorsRef.current;
            const rgb = covered ? pt.covered : pt.uncovered;
            colors[idx] = rgb[0];
            colors[idx + 1] = rgb[1];
            colors[idx + 2] = rgb[2];
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

      updateCameraFromOrbit();
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
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
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
  }, [calculateCoverage, getSatellitePosition, isDark, updateCameraFromOrbit]);

  const handleResize = useCallback(() => {
    updateViewportSize();
  }, [updateViewportSize]);

  const evaluateMission = useCallback(() => {
    if (!satellites.length) return;
    const coverageMetrics = deriveCoverageMetrics(metricsRef.current, samplePointMetaRef.current);
    const result = scoreMission(activeMission, coverageMetrics, satellites);
    setMissionResult(result);
    setMissionScore(result.score);
    setShowMissionResult(true);
  }, [activeMission, satellites]);

  const handleMissionChange = (nextMission) => {
    setMissionMode(nextMission);
    resetMetrics();
  };

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
    resetMetrics();
    setSatellites((prev) => [...prev, newSat]);
  };

  const removeSatellite = (id) => {
    resetMetrics();
    setSatellites((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSatellite = (id, updates) => {
    resetMetrics();
    setSatellites((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const clearConstellation = () => {
    setSatellites([]);
    resetMetrics();
    setCoveragePercent(0);
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
    requestAnimationFrame(() => updateViewportSize());
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (rendererRef.current && mountRef.current) mountRef.current.removeChild(rendererRef.current.domElement);
      if (window.__threeCleanup) window.__threeCleanup();
    };
  }, [initThree, handleResize, updateViewportSize]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    const observer = new ResizeObserver(() => updateViewportSize());
    observer.observe(mount);
    return () => observer.disconnect();
  }, [updateViewportSize, isPortrait]);

  const inputStyle = {
    width: '100%',
    background: palette.inputBg,
    color: palette.text,
    border: palette.border,
    borderRadius: 6,
    padding: '0.4rem 0.5rem',
    fontFamily: palette.font,
    fontSize: '0.85rem',
    boxSizing: 'border-box',
  };

  const labelRow = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: palette.muted,
    marginBottom: '0.25rem',
    fontFamily: palette.font,
  };

  const modalOpen = showHelp || showMissionResult;

  const shellStyle = isPortrait
    ? {
        position: 'fixed',
        top: SITE_TOP_INSET_PORTRAIT,
        left: 0,
        right: 0,
        bottom: PORTRAIT_SHELL_BOTTOM,
        width: '100vw',
        overflow: 'hidden',
        background: palette.bg,
        color: palette.text,
        fontFamily: palette.font,
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateRows: 'minmax(0, 1fr) minmax(0, 46%)',
        zIndex: modalOpen ? 1001 : 1,
      }
    : {
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: palette.bg,
        color: palette.text,
        fontFamily: palette.font,
        boxSizing: 'border-box',
        display: 'block',
      };

  const globeStyle = isPortrait
    ? {
        position: 'relative',
        minHeight: 0,
        width: '100%',
        overflow: 'hidden',
        zIndex: 0,
        background: palette.canvasWash,
      }
    : {
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        background: palette.canvasWash,
      };

  const controlsStyle = isPortrait
    ? {
        position: 'relative',
        minHeight: 0,
        zIndex: 10,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        padding: compact ? '0.65rem' : '0.85rem',
        paddingBottom: compact ? '0.75rem' : '0.85rem',
        marginBottom: PANEL_ABOVE_FOOTER_GAP,
        background: palette.panel,
        borderTop: palette.border,
        borderRadius: '10px 10px 0 0',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
      }
    : {
        position: 'absolute',
        top: 0,
        left: 0,
        width: compact ? 280 : 320,
        height: '100%',
        zIndex: 10,
        overflowY: 'auto',
        padding: compact ? '0.75rem' : '1rem',
        background: palette.panel,
        borderRight: palette.border,
        backdropFilter: 'blur(8px)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
      };

  return (
    <div style={shellStyle}>
      <div ref={mountRef} style={globeStyle} />

      <div style={controlsStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{
              margin: 0,
              fontFamily: palette.titleFont,
              fontSize: compact ? '1rem' : '1.25rem',
              color: palette.accent,
              lineHeight: 1.2,
            }}>
              Satellite Coverage Optimiser
            </h1>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: palette.muted }}>
              {activeMission.tagline}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setShowHelp(true)}
              style={{ ...iconBtn(palette), fontSize: '0.85rem' }}
              aria-label="Mission guide"
            >
              ?
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '0.85rem' }}>
          <div style={labelRow}>
            <span>MISSION MODE</span>
            <span>{activeMission.realExample}</span>
          </div>
          <select
            value={missionMode}
            onChange={(e) => handleMissionChange(e.target.value)}
            style={inputStyle}
          >
            {Object.values(MISSION_MODES).map((mission) => (
              <option key={mission.id} value={mission.id}>{mission.label}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: palette.titleFont,
              fontSize: compact ? '2rem' : '2.5rem',
              fontWeight: 700,
              color: missionScore >= activeMission.winScore ? palette.success : palette.accent,
              lineHeight: 1,
            }}>
              {satellites.length ? missionScore : '—'}
            </div>
            <div style={{ fontSize: '0.7rem', color: palette.muted, marginTop: '0.2rem' }}>
              MISSION SCORE / {activeMission.winScore} to pass
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: palette.titleFont,
              fontSize: compact ? '1.35rem' : '1.6rem',
              fontWeight: 700,
              color: palette.accent,
              lineHeight: 1,
            }}>
              {coveragePercent}%
            </div>
            <div style={{ fontSize: '0.7rem', color: palette.muted, marginTop: '0.2rem' }}>INSTANT COVERAGE</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.85rem', fontSize: '0.75rem' }}>
          <div style={statCard(palette)}>
            <div style={{ color: palette.accent }}>SATELLITES</div>
            <div style={{ fontFamily: palette.titleFont, fontSize: '1.35rem', marginTop: '0.15rem' }}>{satellites.length}</div>
          </div>
          <div style={statCard(palette)}>
            <div style={{ color: palette.success }}>TIME AVG</div>
            <div style={{ fontFamily: palette.titleFont, fontSize: '1.35rem', marginTop: '0.15rem' }}>
              {liveKpis ? `${Math.round(liveKpis.coverageMetrics.timeAvg)}%` : '—'}
            </div>
          </div>
          <div style={statCard(palette)}>
            <div style={{ color: palette.warn }}>COST</div>
            <div style={{ fontFamily: palette.titleFont, fontSize: '1.35rem', marginTop: '0.15rem' }}>
              {satellites.length ? getConstellationCost(satellites) : '—'}
            </div>
          </div>
        </div>

        {liveKpis && (
          <div style={{
            background: palette.bg,
            border: palette.border,
            borderRadius: 8,
            padding: compact ? '0.65rem' : '0.75rem',
            marginBottom: '1rem',
          }}
          >
            {activeMission.kpis.map((kpiId) => {
              const targets = activeMission.targets;
              if (kpiId === 'timeAvg') {
                return (
                  <KpiMeter key={kpiId} label={KPI_LABELS.timeAvg} value={liveKpis.coverageMetrics.timeAvg}
                    target={targets.timeAvg} unit="%" palette={palette} compact={compact} />
                );
              }
              if (kpiId === 'worstPoint') {
                return (
                  <KpiMeter key={kpiId} label={KPI_LABELS.worstPoint} value={liveKpis.coverageMetrics.worstPoint}
                    target={targets.worstPoint} unit="%" palette={palette} compact={compact} />
                );
              }
              if (kpiId === 'dualCover') {
                return (
                  <KpiMeter key={kpiId} label={KPI_LABELS.dualCover} value={liveKpis.coverageMetrics.dualCover}
                    target={targets.dualCover} unit="%" palette={palette} compact={compact} />
                );
              }
              if (kpiId === 'polar') {
                return (
                  <KpiMeter key={kpiId} label={KPI_LABELS.polar} value={liveKpis.coverageMetrics.polar}
                    target={targets.polar} unit="%" palette={palette} compact={compact} />
                );
              }
              if (kpiId === 'equatorial') {
                return (
                  <KpiMeter key={kpiId} label={KPI_LABELS.equatorial} value={liveKpis.coverageMetrics.equatorial}
                    target={targets.equatorial} unit="%" palette={palette} compact={compact} />
                );
              }
              if (kpiId === 'fourFold') {
                return (
                  <KpiMeter key={kpiId} label={KPI_LABELS.fourFold} value={liveKpis.coverageMetrics.fourFoldPoints}
                    target={targets.fourFoldPoints} unit="%" palette={palette} compact={compact} />
                );
              }
              if (kpiId === 'cost') {
                return (
                  <KpiMeter key={kpiId} label={KPI_LABELS.cost} value={liveKpis.cost}
                    target={targets.maxCost} unit=" pts" palette={palette} compact={compact} />
                );
              }
              if (kpiId === 'geoCount') {
                return (
                  <KpiMeter key={kpiId} label={KPI_LABELS.geoCount} value={liveKpis.mix.geoCount}
                    target={targets.minGeo} unit=" sats" palette={palette} compact={compact} />
                );
              }
              return null;
            })}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
          <span style={{ color: palette.muted, fontFamily: palette.titleFont, fontSize: '0.75rem' }}>SIM SPEED</span>
          <input
            type="range"
            min="30"
            max="600"
            step="30"
            value={timeScale}
            onChange={(e) => setTimeScale(+e.target.value)}
            style={{ flex: 1, accentColor: palette.warn }}
          />
          <span style={{ fontFamily: palette.titleFont, width: 44, textAlign: 'right' }}>{timeScale}×</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          {satellites.map((sat) => (
            <div
              key={sat.id}
              style={{
                background: palette.bg,
                border: selectedSatId === sat.id ? `2px solid ${palette.accent}` : palette.border,
                borderRadius: 10,
                padding: compact ? '0.75rem' : '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: palette.titleFont, fontSize: '0.85rem' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: sat.color, flexShrink: 0 }} />
                  <span>SAT-{sat.id.toString().slice(-4)} ({sat.type})</span>
                </div>
                <button type="button" onClick={() => removeSatellite(sat.id)} style={iconBtn(palette)} aria-label="Remove satellite">
                  ×
                </button>
              </div>

              <div>
                <div style={labelRow}>
                  <span>TYPE</span>
                  <span>{sat.type}</span>
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
                    } else {
                      updates.altitude = 35786;
                      updates.inclination = 0;
                      updates.color = '#ffff00';
                    }
                    updateSatellite(sat.id, updates);
                  }}
                  style={inputStyle}
                >
                  <option value="LEO">LEO (Low Earth Orbit)</option>
                  <option value="MEO">MEO (Medium Earth Orbit)</option>
                  <option value="GEO">GEO (Geostationary)</option>
                </select>
              </div>

              {['altitude', 'inclination', 'raan', 'phase'].map((param) => {
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
                    <div style={labelRow}>
                      <span>{param.toUpperCase().replace('RAAN', 'RAAN (Plane)')}</span>
                      <span>
                        {param === 'phase' ? `${(sat.phase * 180 / Math.PI).toFixed(0)}°` :
                         param === 'altitude' ? `${sat.altitude.toFixed(0)} km` : `${sat[param].toFixed(0)}°`}
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
                      style={{ width: '100%', accentColor: palette.accent, opacity: disabled ? 0.45 : 1 }}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <button type="button" onClick={addSatellite} style={{ ...primaryBtn(palette, compact), flex: 1, minWidth: 140 }}>
            + Add satellite
          </button>
          <button
            type="button"
            onClick={evaluateMission}
            disabled={!satellites.length || !liveKpis}
            style={{
              ...primaryBtn(palette, compact),
              flex: 1,
              minWidth: 140,
              opacity: !satellites.length || !liveKpis ? 0.5 : 1,
            }}
          >
            Evaluate mission
          </button>
          <button type="button" onClick={clearConstellation} style={secondaryBtn(palette, compact)}>
            Clear
          </button>
          <button type="button" onClick={resetCamera} style={secondaryBtn(palette, compact)}>
            Reset camera
          </button>
        </div>
      </div>

      <MissionResultModal
        open={showMissionResult}
        onClose={() => setShowMissionResult(false)}
        result={missionResult}
        mission={activeMission}
        palette={palette}
        compact={compact}
        portrait={isPortrait}
        onRetry={clearConstellation}
      />

      <InstructionsModal
        open={showHelp}
        onClose={() => setShowHelp(false)}
        palette={palette}
        compact={compact}
        portrait={isPortrait}
      />
    </div>
  );
};

function MissionResultModal({ open, onClose, result, mission, palette, compact, portrait, onRetry }) {
  if (!open || !result) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={result.passed ? 'Mission success' : 'Mission assessment'}
      palette={palette}
      compact={compact}
      portrait={portrait}
    >
      <p style={{ margin: '0 0 1rem', color: palette.muted }}>
        {mission.label}: {mission.tagline}
      </p>
      <div style={{
        textAlign: 'center',
        marginBottom: '1rem',
        padding: '1rem',
        background: palette.panel,
        border: palette.border,
        borderRadius: 8,
      }}
      >
        <div style={{
          fontFamily: palette.titleFont,
          fontSize: compact ? '2.5rem' : '3rem',
          color: result.passed ? palette.success : palette.warn,
          lineHeight: 1,
        }}
        >
          {result.score}
        </div>
        <div style={{ fontSize: '0.85rem', color: palette.muted, marginTop: '0.35rem' }}>
          Mission score {result.passed ? `(passed — need ${mission.winScore}+)` : `(need ${mission.winScore}+ to pass)`}
        </div>
      </div>
      {result.breakdown.map((row) => (
        <KpiMeter
          key={row.id}
          label={row.label}
          value={row.value}
          target={row.target}
          unit={row.fmt}
          palette={palette}
          compact={compact}
        />
      ))}
      <p style={{ color: palette.muted, fontSize: '0.9rem', margin: '1rem 0' }}>
        {result.passed
          ? 'Your constellation balances coverage, reliability, and cost for this mission type — the same trade-offs real operators negotiate.'
          : 'Adjust orbits, reduce cost, or add satellites in the right places. High instantaneous coverage alone is not enough; missions score time-averaged performance.'}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={onClose} style={primaryBtn(palette, compact)}>
          Keep designing
        </button>
        <button type="button" onClick={() => { onRetry(); onClose(); }} style={secondaryBtn(palette, compact)}>
          Start fresh
        </button>
      </div>
    </Modal>
  );
}

function InstructionsModal({ open, onClose, palette, compact, portrait }) {
  const calloutStyle = {
    background: palette.panel,
    border: palette.border,
    borderRadius: 8,
    padding: compact ? '0.75rem' : '0.9rem',
    marginBottom: '1rem',
  };

  const sectionTitle = {
    fontFamily: palette.titleFont,
    color: palette.accent,
    fontSize: '1rem',
    margin: '0 0 0.5rem',
  };

  return (
    <Modal open={open} onClose={onClose} title="Mission guide" palette={palette} compact={compact} portrait={portrait}>
      <div style={calloutStyle}>
        <strong style={{ color: palette.accent }}>Your job:</strong>
        <p style={{ margin: '0.4rem 0 0', lineHeight: 1.6 }}>
          Build a satellite constellation that meets a <strong>mission brief</strong> — not just flash 100% coverage for a split second.
          Drag the globe to look around, add satellites, tune their orbits, then press <strong>Evaluate mission</strong>.
        </p>
      </div>

      <h3 style={sectionTitle}>How to play</h3>
      <ol style={{ margin: '0 0 1rem', paddingLeft: '1.25rem' }}>
        <li style={{ marginBottom: '0.5rem' }}>Pick a <strong>mission mode</strong> (each mimics a real industry use-case).</li>
        <li style={{ marginBottom: '0.5rem' }}>Add LEO, MEO, or GEO satellites and adjust altitude, inclination, RAAN &amp; phase.</li>
        <li style={{ marginBottom: '0.5rem' }}>Let the sim run a few seconds so <strong>time-averaged</strong> KPIs can build up.</li>
        <li style={{ marginBottom: '0.5rem' }}>Watch the live meters, then submit when you are ready.</li>
      </ol>

      <h3 style={sectionTitle}>Glossary — satellite controls</h3>
      <p style={{ margin: '0 0 0.75rem', color: palette.muted, fontSize: '0.9rem' }}>
        Each satellite you add has five settings. You do not need to memorise the jargon — use this as a quick reference.
      </p>

      <div style={{ ...calloutStyle, marginBottom: '0.65rem' }}>
        <strong style={{ color: palette.accent }}>Type (LEO / MEO / GEO)</strong>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.92rem' }}>
          Which <em>class</em> of orbit the satellite flies in. Lower orbits are closer to Earth and move faster; higher orbits see more of the planet at once.
        </p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: palette.muted }}>
          <strong>LEO</strong> (Low Earth Orbit) — roughly 300–2,000 km. Cheap to launch, low signal delay. Starlink &amp; Iridium use many LEO satellites.
          <br />
          <strong>MEO</strong> (Medium Earth Orbit) — roughly 8,000–20,000 km. Balance of coverage and count. GPS flies here.
          <br />
          <strong>GEO</strong> (Geostationary) — 35,786 km. Stays over one region; great for TV, poor for poles.
        </p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem' }}>
          <strong>In the game:</strong> type sets allowed altitude and cost (LEO cheap, GEO expensive).
        </p>
      </div>

      <div style={{ ...calloutStyle, marginBottom: '0.65rem' }}>
        <strong style={{ color: palette.accent }}>Altitude</strong>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.92rem' }}>
          How high the satellite is above Earth&apos;s surface, in kilometres. Higher altitude = wider view of the ground below,
          but harder and pricier to reach.
        </p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: palette.muted }}>
          Real life: launch rockets must carry fuel to climb higher. GEO altitude is fixed by physics (one orbit per day).
        </p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem' }}>
          <strong>In the game:</strong> drag altitude to grow or shrink each satellite&apos;s ground footprint.
        </p>
      </div>

      <div style={{ ...calloutStyle, marginBottom: '0.65rem' }}>
        <strong style={{ color: palette.accent }}>Inclination</strong>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.92rem' }}>
          The tilt of the orbit relative to the equator, in degrees. 0° = orbit over the equator; 90° = orbit over the poles.
        </p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: palette.muted }}>
          Real life: high-inclination orbits reach northern &amp; southern latitudes; near-equatorial orbits spend most time over the tropics.
        </p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem' }}>
          <strong>In the game:</strong> raise inclination to cover polar regions; GEO is locked to 0° (equatorial).
        </p>
      </div>

      <div style={{ ...calloutStyle, marginBottom: '0.65rem' }}>
        <strong style={{ color: palette.accent }}>RAAN (Right Ascension of the Ascending Node)</strong>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.92rem' }}>
          Which direction the orbit is turned around Earth. Think of it as the compass bearing where the satellite crosses northward through the equator.
        </p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: palette.muted }}>
          Real life: constellations use several RAAN values to create evenly spaced &ldquo;orbital planes&rdquo; — like slices of an orange.
        </p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem' }}>
          <strong>In the game:</strong> change RAAN to spin the orbit around the planet without changing its tilt.
        </p>
      </div>

      <div style={{ ...calloutStyle, marginBottom: '1rem' }}>
        <strong style={{ color: palette.accent }}>Phase</strong>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.92rem' }}>
          Where the satellite starts on its orbital path, in degrees (0–360°). Two satellites on the same orbit but different phases
          are like runners on the same track, spaced apart.
        </p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: palette.muted }}>
          Real life: operators deliberately offset phase so satellites do not bunch up or leave long gaps in coverage.
        </p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem' }}>
          <strong>In the game:</strong> slide phase to stagger satellites along the same ring; combine with RAAN for even global spacing.
        </p>
      </div>

      <h3 style={sectionTitle}>Mission modes</h3>
      {Object.values(MISSION_MODES).map((mission) => (
        <div key={mission.id} style={{ ...calloutStyle, marginBottom: '0.65rem' }}>
          <strong style={{ color: palette.accent }}>{mission.label}</strong>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.92rem' }}>{mission.tagline}</p>
          <p style={{ margin: '0.35rem 0 0', color: palette.muted, fontSize: '0.85rem' }}>
            Real life: {mission.realExample}
          </p>
        </div>
      ))}

      <h3 style={sectionTitle}>KPIs — what they mean</h3>
      <p style={{ margin: '0 0 0.65rem' }}>
        <strong>Instantaneous coverage</strong> — the industry term for who has a satellite overhead <em>at this exact moment</em>.
        Easy to inflate by spamming random satellites; real missions judge performance over time instead.
      </p>
      <p style={{ margin: '0 0 0.65rem' }}>
        <strong>Time-averaged coverage</strong> — the usual industry metric: what fraction of time each region sees a satellite as orbits move.
        Real networks (Iridium, Starlink) are judged on this, not a single instant.
      </p>
      <p style={{ margin: '0 0 0.65rem' }}>
        <strong>Worst-region coverage</strong> — the weakest point on Earth. Emergency comms must not leave dead zones.
      </p>
      <p style={{ margin: '0 0 0.65rem' }}>
        <strong>Dual / 4+ satellite availability</strong> — phones can hand off between satellites; GPS needs 4 in view for a position fix.
      </p>
      <p style={{ margin: '0 0 0.65rem' }}>
        <strong>Polar / equatorial coverage</strong> — GEO TV satellites serve the equator; LEO broadband must reach poles where GEO cannot.
      </p>
      <h3 style={{ ...sectionTitle, marginTop: '0.25rem' }}>Cost — satellites &amp; fleet budget</h3>
      <p style={{ margin: '0 0 0.65rem' }}>
        The game does not use real dollars. It uses <strong>cost points</strong> — a simple score for how expensive each
        satellite class is to launch and operate, based on typical industry trade-offs.
      </p>

      <div style={{ ...calloutStyle, marginBottom: '0.65rem' }}>
        <strong style={{ color: palette.accent }}>Individual satellite cost</strong>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.92rem' }}>
          Each satellite costs points depending only on its <strong>type</strong> (not altitude, inclination, or RAAN):
        </p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: palette.muted }}>
          <strong>LEO</strong> — 1 pt &nbsp;·&nbsp; <strong>MEO</strong> — 5 pts &nbsp;·&nbsp; <strong>GEO</strong> — 14 pts
        </p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: palette.muted }}>
          Real life: LEO spacecraft are smaller and launched on cheaper rockets (often many at once). GEO satellites are
          large, need a heavy lift to ~36,000 km, and hold a scarce orbital slot — so each one costs far more.
        </p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem' }}>
          <strong>In the game:</strong> shown in the <strong>COST</strong> stat as your fleet grows. One GEO equals fourteen LEOs in budget terms.
        </p>
      </div>

      <div style={{ ...calloutStyle, marginBottom: '0.65rem' }}>
        <strong style={{ color: palette.accent }}>Fleet cost</strong>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.92rem' }}>
          The <strong>sum</strong> of every satellite&apos;s cost points. If you have 3 LEO and 1 MEO, fleet cost = 3×1 + 5 = 8 pts.
        </p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: palette.muted }}>
          Real life: programme managers track total constellation cost (build + launch + ground stations + operations).
          A design that works but blows the budget is not viable.
        </p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem' }}>
          <strong>In the game:</strong> each mission sets a <strong>fleet cost target</strong> (e.g. 22 pts). Stay at or under
          it for a strong score; going over budget lowers your mission score. Some missions also cap satellite count.
        </p>
      </div>

      <p style={{ margin: '0 0 1rem', color: palette.muted, fontSize: '0.9rem' }}>
        Coverage only counts above a {MIN_ELEVATION_DEG}° elevation mask (like hills and buildings blocking low satellites).
      </p>

      <h3 style={sectionTitle}>Scoring</h3>
      <p style={{ margin: '0 0 0.65rem' }}>
        Each mission blends several KPIs into one <strong>mission score (0–100)</strong>. You pass by reaching the target shown in the panel
        (typically 68–74 depending on mission difficulty). Efficiency matters: over budget or too many satellites lowers your score.
      </p>
      <p style={{ margin: 0, color: palette.muted, fontSize: '0.9rem' }}>
        Tip: evenly spaced orbital planes (RAAN &amp; phase) often beat a pile of random orbits — that is how real Walker constellations work.
      </p>
    </Modal>
  );
}

export default SatelliteCoverageOptimiser;