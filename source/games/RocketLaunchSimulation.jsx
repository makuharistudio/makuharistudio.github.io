/*
---
title: Rocket Launch Simulation
photo: ./RocketLaunchSimulation.png
desc: Work-In-Progress Rocket ascent physics with an interactive 3D globe.
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
  earth_mosaic_6_clouds_transparent,
} from '../../data/assets.js';
import {
  LAUNCH_SITES,
  launchSitesByCountry,
  MISSION_PROFILES,
  paramsForSiteAndMission,
  missionAltitudeBounds,
  missionParamBounds,
  clampParamsToMissionBounds,
  getMissionClass,
  altitudeRegimeLabel,
  earthLocalRadiusFromAltitudeMeters,
  simulateTrajectory,
  evaluateMission,
  monteCarloSuccess,
  getWeather,
  latLonFromDownrange,
  geographicToTextureLatLon,
  textureToGeographicLatLon,
  recommendedStaging,
  stagingRationale,
  CITY_CALIBRATION_ANCHORS,
  meshPointIdToTextureLatLon,
  DEBUG_MESH_LAT_STEPS,
  DEBUG_MESH_LON_STEPS,
} from './rocketlaunchsimulationPhysics.js';

const SITE_FOOTER_HEIGHT = 'calc(var(--menu-footer-button-width, 15vw) * 2.5)';
const SITE_TOP_INSET_PORTRAIT = 'var(--menu-footer-button-width, 15vw)';
const SITE_TOP_INSET_LANDSCAPE = 'calc(var(--menu-header-height, 5vh) * 1.5)';
const EARTH_RADIUS_SCENE = 1.5225;
const EARTH_RADIUS_KM = 6371;
const SCALE = EARTH_RADIUS_SCENE / EARTH_RADIUS_KM;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const BASE_CAMERA_DISTANCE = 5.5125;
const PORTRAIT_EARTH_SIZE_FACTOR = 1.5;
const PORTRAIT_CAMERA_DISTANCE = 6.1 / PORTRAIT_EARTH_SIZE_FACTOR;
// Portrait + config collapsed: reclaim panel space by moving camera ~50% closer.
const PORTRAIT_CONFIG_COLLAPSED_ZOOM_FACTOR = 1.5;
// Portrait: shift Earth up in frame; camera must orbit this centre (not a decoupled look-at).
const PORTRAIT_EARTH_OFFSET_Y = 0.42;
const CAMERA_FAR_PLANE = 500;
const CAMERA_PULLBACK_LERP = 0.12;
const CAMERA_PLAYBACK_ZOOM_FACTOR = 0.7;
const TRAJECTORY_DISPLAY_MAX_STATES = 6000;
const TRAJECTORY_SEGMENT_SUBDIV = 4;
const ROCKET_NOSE_AXIS = new THREE.Vector3(0, 1, 0);
const EARTH_AXIAL_TILT_DEG = 44.8;

// Set true to render the numbered calibration mesh and enable mesh click-picking.
const troubleshooting = false;

const EARTH_SPIN_BASE_RATE = 0.4;
const EARTH_SPIN_REFERENCE_SCALE = 360;
// bg-space-earth.js: earth map += 0.0072*0.15, clouds -= 0.0075*0.075 per frame
const CLOUD_SPIN_EARTH_RATIO = (0.0075 * 0.075) / (0.0072 * 0.15);
const SITE_MARKER_COLOR = 0xff9900;
const INFO_ICON_GAP = '0.4rem';
const CITY_MARKER_COLOR = 0x000000;
const CITY_MARKER_OPACITY = 0.45;
const SITE_MARKER_SELECTED_COLOR = 0xff6600;
const SITE_MARKER_OPACITY = 0.32;
const SITE_MARKER_SELECTED_OPACITY = 0.55;
const EARTH_GROUP_X_ROT = -90 * Math.PI / 180;
const DRAG_EARTH_SPIN_SENSITIVITY = 0.003;
const DRAG_CAMERA_POLAR_SENSITIVITY = 0.003;

function applyEarthSpinToMeshes(earth, clouds, earthAngle, cloudAngle) {
  if (earth) earth.rotation.y = earthAngle;
  if (clouds) clouds.rotation.y = cloudAngle;
}

function generateDebugMeshMeta() {
  if (!troubleshooting) return [];

  const meta = [];
  const latStep = 180 / DEBUG_MESH_LAT_STEPS;
  const lonStep = 360 / DEBUG_MESH_LON_STEPS;

  for (let lat = -90 + latStep / 2; lat <= 90; lat += latStep) {
    for (let lon = -180 + lonStep / 2; lon < 180; lon += lonStep) {
      meta.push({ id: meta.length, lat, lon });
    }
  }
  return meta;
}

const ATM_LAYERS = [
  { altKm: 12, color: 0x66aaff, opacity: 0.06, label: 'Troposphere' },
  { altKm: 50, color: 0x88ccff, opacity: 0.05, label: 'Stratosphere' },
  { altKm: 85, color: 0xaa88ff, opacity: 0.04, label: 'Mesosphere' },
];
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// Unit-sphere direction in earthGroup local space (texture / mosaic UV frame).
function latLonToEarthLocal(lat, lon) {
  const latRad = THREE.MathUtils.degToRad(lat);
  const lonRad = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(
    Math.cos(latRad) * Math.cos(lonRad),
    Math.cos(latRad) * Math.sin(lonRad),
    Math.sin(latRad)
  );
}

function earthLocalToLatLon(local) {
  const unit = local.clone().normalize();
  return {
    lat: THREE.MathUtils.radToDeg(Math.asin(clamp(unit.z, -1, 1))),
    lon: THREE.MathUtils.radToDeg(Math.atan2(unit.y, unit.x)),
  };
}

function earthLocalToWorld(earthGroup, local) {
  return earthGroup.localToWorld(local.clone());
}

function trajectoryPointLocal(texture, hMeters) {
  const radius = earthLocalRadiusFromAltitudeMeters(hMeters);
  return latLonToEarthLocal(texture.lat, texture.lon).multiplyScalar(radius);
}

function trajectoryPointFromSH(sMeters, hMeters, p) {
  const { lat, lon } = latLonFromDownrange(p.siteLat, p.siteLon, sMeters, p.azimuth);
  const texture = geographicToTextureLatLon(lat, lon);
  return trajectoryPointLocal(texture, hMeters);
}

function surfaceTangentFromAzimuth(textureLat, textureLon, azimuthDeg, target = new THREE.Vector3()) {
  const lat = THREE.MathUtils.degToRad(textureLat);
  const lon = THREE.MathUtils.degToRad(textureLon);
  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);
  const sinLon = Math.sin(lon);
  const cosLon = Math.cos(lon);
  const bearing = THREE.MathUtils.degToRad(azimuthDeg);

  const northX = -sinLat * cosLon;
  const northY = -sinLat * sinLon;
  const northZ = cosLat;
  const eastX = -sinLon;
  const eastY = cosLon;

  return target.set(
    northX * Math.cos(bearing) + eastX * Math.sin(bearing),
    northY * Math.cos(bearing) + eastY * Math.sin(bearing),
    northZ * Math.cos(bearing),
  ).normalize();
}

function flightDirectionLocal(st, p, texture, target = new THREE.Vector3()) {
  const radial = latLonToEarthLocal(texture.lat, texture.lon).normalize();
  const tangent = surfaceTangentFromAzimuth(texture.lat, texture.lon, p.azimuth);
  target.set(0, 0, 0)
    .addScaledVector(tangent, st.vx)
    .addScaledVector(radial, st.vy);

  if (target.lengthSq() < 1) return radial;
  return target.normalize();
}

function flightDirectionWorld(st, p, earthGroup, texture, scratchLocal, scratchOrigin, scratchTip) {
  const flightLocal = flightDirectionLocal(st, p, texture, scratchLocal);
  scratchOrigin.set(0, 0, 0);
  earthGroup.localToWorld(scratchOrigin);
  scratchTip.copy(flightLocal);
  earthGroup.localToWorld(scratchTip);
  return scratchTip.sub(scratchOrigin).normalize();
}

function hermiteScalar(p0, p1, m0, m1, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * p0
    + (t3 - 2 * t2 + t) * m0
    + (-2 * t3 + 3 * t2) * p1
    + (t3 - t2) * m1;
}

function stridedTrajectoryStates(states, maxStates = TRAJECTORY_DISPLAY_MAX_STATES) {
  if (states.length <= maxStates) return states;
  const stride = Math.ceil(states.length / maxStates);
  const picked = [];
  for (let i = 0; i < states.length; i += stride) picked.push(states[i]);
  if (picked[picked.length - 1] !== states[states.length - 1]) {
    picked.push(states[states.length - 1]);
  }
  return picked;
}

/** Smooth flight-path overlay: Hermite spline in downrange/altitude, then map to the globe. */
function buildSmoothTrajectoryPoints(states, p) {
  if (!states.length) return [];
  if (states.length === 1) return [trajectoryPointFromSH(states[0].s, states[0].h, p)];

  const pathStates = stridedTrajectoryStates(states);
  const points = [];

  for (let i = 0; i < pathStates.length - 1; i += 1) {
    const a = pathStates[i];
    const b = pathStates[i + 1];
    const segDt = Math.max(b.t - a.t, p.dt || 0.05);
    const mS0 = a.vx * segDt;
    const mS1 = b.vx * segDt;
    const mH0 = a.vy * segDt;
    const mH1 = b.vy * segDt;

    for (let j = 0; j < TRAJECTORY_SEGMENT_SUBDIV; j += 1) {
      const u = j / TRAJECTORY_SEGMENT_SUBDIV;
      const s = hermiteScalar(a.s, b.s, mS0, mS1, u);
      const h = hermiteScalar(a.h, b.h, mH0, mH1, u);
      points.push(trajectoryPointFromSH(s, h, p));
    }
  }

  const last = pathStates[pathStates.length - 1];
  points.push(trajectoryPointFromSH(last.s, last.h, p));
  return points;
}

function orientRocketAlongFlight(rocket, flightWorld) {
  rocket.quaternion.setFromUnitVectors(ROCKET_NOSE_AXIS, flightWorld);
}

function cameraFrameDistance(camera, earthWorldRadius, rocketWorldPos, earthCenter, baseDistance) {
  const rocketDist = rocketWorldPos.distanceTo(earthCenter);
  const span = rocketDist + earthWorldRadius;
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
  const minFov = Math.min(vFov, hFov);
  const framed = (span / Math.sin(minFov / 2)) * 1.35 * CAMERA_PLAYBACK_ZOOM_FACTOR;
  return Math.max(baseDistance, framed);
}

function useSiteTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute('data-theme') || 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

function useIsCompact() {
  const [compact, setCompact] = useState(() => window.innerWidth < 900);
  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < 900);
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
      font: 'var(--content-font)',
      titleFont: 'var(--title-font)',
      success: isDark ? '#4ade80' : '#15803d',
      error: isDark ? '#f87171' : '#b91c1c',
      warn: isDark ? '#fbbf24' : '#b45309',
      muted: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(20,20,30,0.55)',
      overlay: isDark ? 'rgba(0,0,0,0.72)' : 'rgba(255,255,255,0.82)',
      mono: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace",
    }),
    [isDark]
  );
}

function getSiteLayout() {
  const portrait = window.matchMedia('(max-aspect-ratio: 17/20)').matches;
  const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
  const nearSquare = !portrait && aspect > 0.8 && aspect < 1.25;
  const landscapeTop = nearSquare
    ? 'calc(var(--menu-header-height, 5vh) * 2.5 + var(--content-font-size, 1rem) * 2)'
    : SITE_TOP_INSET_LANDSCAPE;
  return {
    portrait,
    nearSquare,
    top: portrait ? SITE_TOP_INSET_PORTRAIT : landscapeTop,
    bottom: portrait ? SITE_FOOTER_HEIGHT : '0',
    viewportPadTop: nearSquare
      ? 'calc(var(--menu-header-height, 5vh) * 1.2 + var(--content-font-size, 1rem))'
      : '0.5rem',
  };
}

/** Y rotation (rad) for tiltGroup so a launch site faces the default camera. */
function earthRotationYForSite(site) {
  const texture = geographicToTextureLatLon(site.lat, site.lon);
  const local = latLonToEarthLocal(texture.lat, texture.lon);
  const v = local.clone();
  v.applyEuler(new THREE.Euler(EARTH_GROUP_X_ROT, 0, 0, 'XYZ'));
  return -Math.atan2(v.x, v.z);
}

function useSiteLayout() {
  const [layout, setLayout] = useState(getSiteLayout);
  useEffect(() => {
    const mq = window.matchMedia('(max-aspect-ratio: 17/20)');
    const onChange = () => setLayout(getSiteLayout());
    mq.addEventListener('change', onChange);
    window.addEventListener('resize', onChange);
    return () => {
      mq.removeEventListener('change', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, []);
  return layout;
}

function btnStyle(palette, active = false) {
  return {
    background: palette.panel,
    border: active ? `2px solid ${palette.accent}` : palette.border,
    color: active ? palette.accent : palette.button,
    borderRadius: 6,
    cursor: 'pointer',
    padding: '0.45rem 0.7rem',
    fontFamily: palette.titleFont,
    fontSize: '0.82rem',
    fontWeight: 600,
  };
}

function ThemedSelect({ value, onChange, palette, isDark, options, groups, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const flatOptions = useMemo(() => {
    if (options) return options;
    return groups?.flatMap((g) => g.options) ?? [];
  }, [options, groups]);

  const selectedLabel = flatOptions.find((o) => String(o.value) === String(value))?.label ?? 'Select…';

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (next) => {
    onChange(next);
    setOpen(false);
  };

  const triggerStyle = {
    width: '100%',
    textAlign: 'left',
    padding: '0.4rem 0.5rem',
    background: palette.panel,
    color: palette.text,
    border: palette.border,
    borderRadius: 6,
    fontFamily: palette.font,
    fontSize: '0.82rem',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const listStyle = {
    position: 'absolute',
    top: 'calc(100% + 0.2rem)',
    left: 0,
    right: 0,
    maxHeight: 240,
    overflowY: 'auto',
    background: palette.bg,
    border: palette.border,
    borderRadius: 6,
    zIndex: 100,
    boxShadow: isDark ? '0 6px 20px rgba(0,0,0,0.65)' : '0 6px 20px rgba(0,0,0,0.12)',
    margin: 0,
    padding: '0.25rem 0',
    listStyle: 'none',
  };

  const optionStyle = (active) => ({
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '0.4rem 0.55rem',
    border: 'none',
    background: active ? palette.panel : 'transparent',
    color: active ? palette.accent : palette.text,
    fontFamily: palette.font,
    fontSize: '0.82rem',
    cursor: 'pointer',
  });

  const groupLabelStyle = {
    padding: '0.35rem 0.55rem 0.15rem',
    fontFamily: palette.titleFont,
    fontSize: '0.72rem',
    fontWeight: 600,
    color: palette.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={triggerStyle}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedLabel}</span>
        <span aria-hidden="true" style={{ color: palette.muted, flexShrink: 0 }}>{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <ul role="listbox" aria-label={ariaLabel} style={listStyle}>
          {groups?.map((group) => (
            <li key={group.label}>
              <div style={groupLabelStyle}>{group.label}</div>
              {group.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={String(opt.value) === String(value)}
                  onClick={() => pick(opt.value)}
                  style={optionStyle(String(opt.value) === String(value))}
                >
                  {opt.label}
                </button>
              ))}
            </li>
          ))}
          {options?.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                role="option"
                aria-selected={String(opt.value) === String(value)}
                onClick={() => pick(opt.value)}
                style={optionStyle(String(opt.value) === String(value))}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const PARAM_INFO = {
  stage1Fuel: {
    title: 'Stage 1 propellant mass',
    realLife: 'The first stage carries the bulk of propellant to punch through the dense lower atmosphere. More fuel means more delta-v, but also more weight to lift — there is an optimum for each mission.',
    inGame: 'Directly sets stage 1 fuel mass (kg). Burn rate follows thrust and Isp. Empty tanks trigger staging when a second stage is enabled.',
  },
  stage2Fuel: {
    title: 'Stage 2 propellant mass',
    realLife: 'The upper stage fires in thinner air with a smaller, optimised engine. Its fuel budget finishes the orbit insertion or transfer burn after the booster separates.',
    inGame: 'Only used when two-stage mode is on. Stage 2 ignites automatically when stage 1 fuel reaches zero.',
  },
  thrust1: {
    title: 'Stage 1 thrust',
    realLife: 'Sea-level thrust (kilonewtons) determines acceleration off the pad and through max-q. Too little thrust and gravity losses dominate; too much can exceed structural limits.',
    inGame: 'Constant thrust in newtons for stage 1. Combined with mass and drag to produce acceleration each RK4 step.',
  },
  thrust2: {
    title: 'Stage 2 thrust',
    realLife: 'Upper-stage engines are smaller but often higher Isp, operating in vacuum or near-vacuum to circularise or transfer the payload.',
    inGame: 'Constant thrust for stage 2 after separation. Typically lower than stage 1 in the defaults.',
  },
  isp1: {
    title: 'Stage 1 specific impulse (Isp)',
    realLife: 'Specific impulse measures exhaust efficiency in seconds. Higher Isp means less propellant per unit of delta-v. Kerolox boosters are ~280–310 s; hydrolox upper stages reach ~450 s.',
    inGame: 'Sets mass flow ṁ = thrust / (Isp · g₀). Higher Isp stretches the same fuel tank farther.',
  },
  isp2: {
    title: 'Stage 2 specific impulse (Isp)',
    realLife: 'Upper stages almost always beat the booster on Isp because they use vacuum-optimised nozzles and lighter fuels (e.g. hydrolox, solid upper stages).',
    inGame: 'Applies to stage 2 only. Default values are higher than stage 1 to reflect vacuum efficiency.',
  },
  cd: {
    title: 'Drag coefficient (Cd)',
    realLife: 'A dimensionless factor describing how streamlined the vehicle is. Fairings, grid fins, and staging events change Cd. Rockets aim for low Cd during ascent to limit drag losses.',
    inGame: 'Single constant Cd multiplied by reference area and dynamic pressure. No Mach-dependent drag table.',
  },
  azimuth: {
    title: 'Launch azimuth',
    realLife: 'Compass heading of the ground track at liftoff. Eastward launches (≈90°) gain Earth-rotation speed; polar missions use north/south azimuths from coastal pads.',
    inGame: 'Sets downrange direction for mapping the trajectory onto the globe and for the gravity-turn plane.',
  },
  targetAltKm: {
    title: 'Target altitude',
    realLife: 'Mission target — Kármán line (~100 km) for suborbital, ~400 km for ISS, 35 786 km for geostationary. Each regime demands a different delta-v budget. Flying higher than needed burns extra propellant; flying too low fails the mission.',
    inGame: 'Selecting a mission profile sets the slider to that mission\'s nominal altitude and limits the range to its success window. Below the minimum is a mission failure; modest overshoot within the maximum still succeeds but costs fuel-margin score.',
  },
  turnEndAlt: {
    title: 'Gravity-turn end altitude',
    realLife: 'The altitude by which the vehicle finishes pitching from vertical toward the horizon. Ending the turn too early fights gravity; too late wastes energy in the thick air.',
    inGame: 'Upper bound of the smooth pitch programme between turn start (1 km default) and this altitude.',
  },
  finalPitch: {
    title: 'Final flight-path pitch',
    realLife: 'Pitch angle at the end of the gravity turn — how horizontal the velocity vector becomes. Steeper (more vertical) fights gravity longer; shallower builds downrange speed earlier.',
    inGame: 'Target pitch in radians at turn-end altitude. Lower values push more velocity horizontal for orbital missions; suborbital hops use a steeper final pitch.',
  },
  staging: {
    title: 'Multi-stage vehicle',
    realLife: 'Staging sheds empty tanks and engines so remaining stages operate at better mass ratios. Suborbital hops may use one stage; every orbital class needs at least two, and heavy GTO/GEO missions sometimes add a third.',
    inGame: 'When enabled, the sim discards stage 1 at burnout and continues on stage 2 parameters. Suborbital missions default to single-stage; orbital missions default to two-stage.',
  },
};

const HUD_INFO = {
  ALT: {
    title: 'Altitude',
    body: 'Height above the launch-site elevation in kilometres. Expect ~0 at liftoff, 1–2 km when the gravity turn begins, 50–80 km at main-engine cutoff for LEO-class flights, and 100 km+ to cross the Kármán line.',
  },
  VEL: {
    title: 'Velocity',
    body: 'Total speed (m/s) combining horizontal and vertical components. Orbital insertion needs ~7.8 km/s at ~400 km altitude; suborbital hops peak around 1–2 km/s.',
  },
  Q: {
    title: 'Dynamic pressure (max-q)',
    body: 'q = ½ρv² — aerodynamic load in kilopascals. Peaks in the transonic regime around 10–15 km. Orbital missions fail above ~40 kPa; suborbital hops allow ~52 kPa. Exceeding the limit triggers a structural-risk failure.',
  },
  MACH: {
    title: 'Mach number',
    body: 'Speed divided by local speed of sound. Transonic drag rises near Mach 0.8–1.2. Expect Mach 1 shortly after max-q on a typical ascent.',
  },
  MASS: {
    title: 'Vehicle mass',
    body: 'Total mass in tonnes including propellant. Drops steadily during burn and steps down at staging when empty hardware is discarded.',
  },
  PITCH: {
    title: 'Flight-path pitch angle',
    body: 'Angle from horizontal in degrees. Starts near 90° (vertical) and eases toward the horizon during the programmed gravity turn.',
  },
  STG: {
    title: 'Active stage',
    body: 'Which propulsion stage is firing — 1 for the booster, 2 for the upper stage after separation.',
  },
  T: {
    title: 'Mission elapsed time (T+)',
    body: 'Seconds since liftoff (T+0). Countdowns use T− before ignition; flight timelines and telemetry are referenced as T+ after liftoff, as in NASA mission audio.',
  },
};

function InfoButton({ onClick, palette, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Learn about ${label}`}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        margin: 0,
        cursor: 'pointer',
        color: palette.muted,
        fontFamily: palette.font,
        fontSize: '0.82rem',
        lineHeight: 1,
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      ⓘ
    </button>
  );
}

function InfoModal({ open, onClose, palette, compact, info }) {
  if (!open || !info) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: palette.overlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: compact ? '0.75rem' : '1.5rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 480,
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          background: palette.bg,
          border: palette.border,
          borderRadius: 8,
          padding: compact ? '1rem' : '1.25rem',
          color: palette.text,
          fontFamily: palette.font,
          lineHeight: 1.65,
          fontSize: '0.92rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <h2 style={{ margin: 0, fontFamily: palette.titleFont, color: palette.accent, fontSize: '1rem' }}>{info.title}</h2>
          <button type="button" onClick={onClose} style={btnStyle(palette)} aria-label="Close">✕</button>
        </div>
        {info.body && <p style={{ margin: '0 0 0.75rem' }}>{info.body}</p>}
        {info.realLife && (
          <>
            <h3 style={{ margin: '0 0 0.35rem', fontFamily: palette.titleFont, color: palette.accent, fontSize: '0.88rem' }}>In real life</h3>
            <p style={{ margin: '0 0 0.75rem' }}>{info.realLife}</p>
          </>
        )}
        {info.inGame && (
          <>
            <h3 style={{ margin: '0 0 0.35rem', fontFamily: palette.titleFont, color: palette.accent, fontSize: '0.88rem' }}>In this simulation</h3>
            <p style={{ margin: 0 }}>{info.inGame}</p>
          </>
        )}
      </div>
    </div>
  );
}

function EducationModal({ open, onClose, palette, compact }) {
  const [tab, setTab] = useState('rocket');
  if (!open) return null;

  const tabs = [
    { id: 'rocket', label: 'Rocket equation' },
    { id: 'turn', label: 'Gravity turn' },
    { id: 'atmo', label: 'Atmosphere' },
    { id: 'realism', label: 'Realism notes' },
    { id: 'glossary', label: 'Glossary' },
  ];

  const content = {
    rocket: (
      <>
        <p>The Tsiolkovsky rocket equation links delta-v to mass ratio and specific impulse (Isp). Staging discards empty tanks so each stage operates at a better mass ratio.</p>
        <p><strong>Δv = Isp · g₀ · ln(m₀ / m₁)</strong> — higher Isp or lighter dry mass yields more velocity per kilogram of propellant.</p>
      </>
    ),
    turn: (
      <>
        <p>A gravity turn gradually tilts the thrust vector from vertical toward the horizon so gravity bends the trajectory instead of fighting it with steering alone.</p>
        <p>Falcon 9-class vehicles typically begin the turn around 1–2 km and continue through the upper atmosphere, targeting a shallow flight-path angle before main-engine cutoff.</p>
      </>
    ),
    atmo: (
      <>
        <p>Drag scales with dynamic pressure q = ½ρv². Density ρ falls rapidly with altitude, so most drag and heating occur below ~15 km (troposphere).</p>
        <p>This sim uses the US Standard Atmosphere piecewise model for temperature, pressure, and density up to 86 km, then an exponential tail above.</p>
      </>
    ),
    realism: (
      <>
        <p><strong>Simplifications in this build:</strong></p>
        <ul style={{ paddingLeft: '1.2rem', lineHeight: 1.6 }}>
          <li>2D point-mass trajectory in a local tangent plane (no full 6-DOF attitude dynamics).</li>
          <li>Constant drag coefficient and reference area (no Mach-dependent Cd).</li>
          <li>Simplified wind — surface direction with mild altitude scaling, no shear profile.</li>
          <li>Instantaneous staging with no separation dynamics or ullage.</li>
          <li>Thrust treated as constant per stage (no throttle buckets or vacuum thrust rise).</li>
          <li>Orbit success is a velocity + altitude heuristic, not full orbital insertion mechanics.</li>
        </ul>
      </>
    ),
    glossary: (
      <dl style={{ lineHeight: 1.65 }}>
        <dt><strong>Isp</strong></dt><dd>Specific impulse — exhaust efficiency in seconds.</dd>
        <dt><strong>q (max-q)</strong></dt><dd>Dynamic pressure — aerodynamic load indicator.</dd>
        <dt><strong>Azimuth</strong></dt><dd>Compass heading of the ground track at launch.</dd>
        <dt><strong>Delta-v</strong></dt><dd>Change in velocity budget required for the mission.</dd>
      </dl>
    ),
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: palette.overlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: compact ? '0.75rem' : '1.5rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 560,
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          background: palette.bg,
          border: palette.border,
          borderRadius: 8,
          padding: compact ? '1rem' : '1.4rem',
          color: palette.text,
          fontFamily: palette.font,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontFamily: palette.titleFont, color: palette.accent }}>Learn</h2>
          <button type="button" onClick={onClose} style={btnStyle(palette)} aria-label="Close">✕</button>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', margin: '0.75rem 0' }}>
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} style={btnStyle(palette, tab === t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ lineHeight: 1.65, fontSize: '0.92rem' }}>{content[tab]}</div>
      </div>
    </div>
  );
}

const RocketLaunchSimulation = () => {
  const isDark = useSiteTheme() === 'dark';
  const palette = useThemePalette(isDark);
  const compact = useIsCompact();
  const siteLayout = useSiteLayout();

  const [siteId, setSiteId] = useState('spacex_lc39a');
  const [month, setMonth] = useState(6);
  const [missionId, setMissionId] = useState('leo_iss');
  const [params, setParams] = useState(() => paramsForSiteAndMission('spacex_lc39a', 'leo_iss'));
  const [trajectory, setTrajectory] = useState([]);
  const [result, setResult] = useState(null);
  const [mcSuccess, setMcSuccess] = useState(null);
  const [showConfig, setShowConfig] = useState(!compact);
  const [showEducation, setShowEducation] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [simulating, setSimulating] = useState(false);
  const [hasSimulated, setHasSimulated] = useState(false);
  const [selectedMeshPoint, setSelectedMeshPoint] = useState(null);
  const [timeScale, setTimeScale] = useState(60);
  const [earthSpinPaused, setEarthSpinPaused] = useState(false);
  const [infoModal, setInfoModal] = useState(null);

  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const earthRef = useRef(null);
  const earthGroupRef = useRef(null);
  const cloudsRef = useRef(null);
  const rocketRef = useRef(null);
  const trajLineRef = useRef(null);
  const siteMarkersRef = useRef([]);
  const cityMarkersRef = useRef([]);
  const debugMeshPointsRef = useRef(null);
  const debugMeshMetaRef = useRef([]);
  const exhaustRef = useRef(null);
  const cameraAzimuthRef = useRef(Math.PI / 2);
  const cameraPolarRef = useRef(2 * Math.PI / 3);
  const cameraDistanceRef = useRef(BASE_CAMERA_DISTANCE);
  const isPortraitRef = useRef(window.innerHeight > window.innerWidth);
  const clockRef = useRef(null);
  const animRef = useRef(null);
  const playRef = useRef({ playing: false, index: 0, speed: 1 });
  const trajectoryRef = useRef([]);
  const paramsRef = useRef(params);
  const timeScaleRef = useRef(timeScale);
  const playbackFramingRef = useRef(false);
  const earthCenterRef = useRef(new THREE.Vector3());
  const orbitTargetRef = useRef(new THREE.Vector3());
  const rocketFlightLocalRef = useRef(new THREE.Vector3());
  const rocketFlightOriginRef = useRef(new THREE.Vector3());
  const rocketFlightTipRef = useRef(new THREE.Vector3());
  const earthSpinPausedRef = useRef(false);
  const earthSpinAngleRef = useRef(0);
  const earthSpinTimeOffsetRef = useRef(0);
  const cloudSpinAngleRef = useRef(0);
  const cloudSpinTimeOffsetRef = useRef(0);
  const selectSiteRef = useRef(null);
  const compactRef = useRef(compact);
  const showConfigRef = useRef(showConfig);
  const baseCameraDistanceRef = useRef(() => BASE_CAMERA_DISTANCE);
  const recalibrateEarthSpinOffsetsRef = useRef(() => {});
  const draggingRef = useRef(false);
  const earthSpinWasActiveRef = useRef(false);
  compactRef.current = compact;
  showConfigRef.current = showConfig;

  const selectedSite = LAUNCH_SITES.find((s) => s.id === siteId) || LAUNCH_SITES[0];
  const selectedMission = MISSION_PROFILES.find((m) => m.id === missionId) || MISSION_PROFILES[1];
  const weather = getWeather(selectedSite.country, month);
  const altitudeBounds = useMemo(() => missionAltitudeBounds(missionId), [missionId]);
  const paramBounds = useMemo(() => missionParamBounds(missionId), [missionId]);
  const altitudeRegime = altitudeRegimeLabel(params.targetAltKm);
  const altitudeStep = altitudeBounds.max - altitudeBounds.min > 5000 ? 50 : 10;

  const updateParam = (key, value) => {
    setParams((p) => ({ ...p, [key]: value }));
  };

  const clearSimulation = useCallback(() => {
    setHasSimulated(false);
    setTrajectory([]);
    setResult(null);
    setMcSuccess(null);
    setPlaying(false);
    setPlayIndex(0);
    playRef.current = { playing: false, index: 0, speed: playSpeed };
    trajectoryRef.current = [];
  }, [playSpeed]);

  const selectMission = useCallback((id) => {
    setMissionId(id);
    clearSimulation();
    const next = paramsForSiteAndMission(siteId, id);
    setParams(next);
  }, [siteId, clearSimulation]);

  useEffect(() => {
    setParams((p) => {
      if (p.missionId === missionId) {
        const clamped = clampParamsToMissionBounds(p, missionId);
        const unchanged = Object.keys(clamped).every((k) => clamped[k] === p[k]);
        return unchanged ? p : clamped;
      }
      return paramsForSiteAndMission(p.siteId || siteId, missionId);
    });
  }, [missionId, siteId]);

  const runSimulation = useCallback(() => {
    setSimulating(true);
    setPlaying(false);
    setPlayIndex(0);
    const p = {
      ...params,
      siteId,
      siteCountry: selectedSite.country,
      month,
      siteLat: selectedSite.lat,
      siteLon: selectedSite.lon,
      siteElevation: selectedSite.elevation,
    };
    const states = simulateTrajectory(p);
    const evalResult = evaluateMission(p, states);
    const mc = monteCarloSuccess(p, 5);
    setTrajectory(states);
    setResult(evalResult);
    setMcSuccess(mc);
    setHasSimulated(true);
    setSimulating(false);
  }, [params, siteId, month, selectedSite]);

  const getFresnelMat = useCallback((rimHex, facingHex) => {
    const uniforms = {
      color1: { value: new THREE.Color(rimHex) },
      color2: { value: new THREE.Color(facingHex) },
      fresnelBias: { value: 0.08 },
      fresnelScale: { value: 1.1 },
      fresnelPower: { value: 3.8 },
    };
    const vs = `uniform float fresnelBias; uniform float fresnelScale; uniform float fresnelPower; varying float vReflectionFactor; void main(){ vec4 wp=modelMatrix*vec4(position,1.0); vec3 wn=normalize(mat3(modelMatrix)*normal); vec3 I=wp.xyz-cameraPosition; vReflectionFactor=fresnelBias+fresnelScale*pow(1.0+dot(normalize(I),wn),fresnelPower); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
    const fs = `uniform vec3 color1; uniform vec3 color2; varying float vReflectionFactor; void main(){ float f=clamp(vReflectionFactor,0.0,1.0); gl_FragColor=vec4(mix(color2,color1,f),f*0.85); }`;
    return new THREE.ShaderMaterial({ uniforms, vertexShader: vs, fragmentShader: fs, transparent: true, blending: THREE.AdditiveBlending });
  }, []);

  const updateTrajectoryLine = useCallback((states, p) => {
    if (!earthGroupRef.current) return;
    if (trajLineRef.current) {
      earthGroupRef.current.remove(trajLineRef.current);
      trajLineRef.current.geometry.dispose();
      trajLineRef.current = null;
    }
    if (!states.length) return;

    const points = buildSmoothTrajectoryPoints(states, p);

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.92 }),
    );
    trajLineRef.current = line;
    earthGroupRef.current.add(line);
  }, []);

  const baseCameraDistance = useCallback(() => {
    let dist = isPortraitRef.current ? PORTRAIT_CAMERA_DISTANCE : BASE_CAMERA_DISTANCE;
    if (isPortraitRef.current && compactRef.current && !showConfigRef.current) {
      dist *= PORTRAIT_CONFIG_COLLAPSED_ZOOM_FACTOR;
    }
    return dist;
  }, []);
  baseCameraDistanceRef.current = baseCameraDistance;

  const applyEarthFrameOffset = useCallback(() => {
    if (!earthRef.current) return;
    earthRef.current.position.y = isPortraitRef.current ? PORTRAIT_EARTH_OFFSET_Y : 0;
  }, []);

  const updateCameraFromOrbit = useCallback(() => {
    if (!cameraRef.current) return;
    applyEarthFrameOffset();
    const dist = cameraDistanceRef.current;
    const target = earthRef.current
      ? earthRef.current.getWorldPosition(orbitTargetRef.current)
      : orbitTargetRef.current.set(0, 0, 0);

    const x = dist * Math.sin(cameraPolarRef.current) * Math.cos(cameraAzimuthRef.current);
    const z = dist * Math.sin(cameraPolarRef.current) * Math.sin(cameraAzimuthRef.current);
    const y = dist * Math.cos(cameraPolarRef.current);
    cameraRef.current.position.set(target.x + x, target.y + y, target.z + z);
    cameraRef.current.lookAt(target);
  }, [applyEarthFrameOffset]);

  const recalibrateEarthSpinOffsets = useCallback(() => {
    const elapsed = clockRef.current?.getElapsedTime() ?? 0;
    const spinScale = timeScaleRef.current / EARTH_SPIN_REFERENCE_SCALE;
    const spinRate = EARTH_SPIN_BASE_RATE * spinScale;
    const cloudSpinRate = spinRate * CLOUD_SPIN_EARTH_RATIO;

    earthSpinAngleRef.current = earthRef.current?.rotation.y ?? earthSpinAngleRef.current;
    cloudSpinAngleRef.current = cloudsRef.current?.rotation.y ?? cloudSpinAngleRef.current;

    // angle = elapsed * spinRate - offset  =>  offset = elapsed * spinRate - angle
    earthSpinTimeOffsetRef.current = elapsed * spinRate - earthSpinAngleRef.current;
    // cloudAngle = -(elapsed * cloudSpinRate) + offset  =>  offset = elapsed * cloudSpinRate + cloudAngle
    cloudSpinTimeOffsetRef.current = elapsed * cloudSpinRate + cloudSpinAngleRef.current;
  }, []);
  recalibrateEarthSpinOffsetsRef.current = recalibrateEarthSpinOffsets;

  const orientEarthToSite = useCallback((site, { recalibrate = true } = {}) => {
    if (!earthRef.current) return;
    const targetY = earthRotationYForSite(site);
    earthSpinAngleRef.current = targetY;
    earthRef.current.rotation.y = targetY;
    const cloudY = -targetY * CLOUD_SPIN_EARTH_RATIO;
    cloudSpinAngleRef.current = cloudY;
    if (cloudsRef.current) cloudsRef.current.rotation.y = cloudY;
    if (recalibrate) recalibrateEarthSpinOffsets();
  }, [recalibrateEarthSpinOffsets]);

  const selectSite = useCallback((id, lat, lon, { orientEarth = false } = {}) => {
    setSiteId(id);
    clearSimulation();
    const site = LAUNCH_SITES.find((s) => s.id === id);
    if (site) {
      setParams((p) => {
        const next = paramsForSiteAndMission(site.id, p.missionId || missionId);
        return {
          ...next,
          siteLat: lat ?? site.lat,
          siteLon: lon ?? site.lon,
        };
      });
      if (orientEarth) orientEarthToSite(site);
    }
  }, [missionId, clearSimulation, orientEarthToSite]);

  useEffect(() => {
    selectSiteRef.current = selectSite;
  }, [selectSite]);

  const toggleEarthSpin = useCallback(() => {
    if (!earthSpinPausedRef.current) {
      earthSpinAngleRef.current = earthRef.current?.rotation.y ?? 0;
      cloudSpinAngleRef.current = cloudsRef.current?.rotation.y ?? 0;
      earthSpinPausedRef.current = true;
      setEarthSpinPaused(true);
      return;
    }

    recalibrateEarthSpinOffsets();
    earthSpinPausedRef.current = false;
    setEarthSpinPaused(false);
  }, [recalibrateEarthSpinOffsets]);

  const resetCamera = useCallback(() => {
    cameraAzimuthRef.current = Math.PI / 2;
    cameraPolarRef.current = 2 * Math.PI / 3;
    cameraDistanceRef.current = baseCameraDistance();
    playbackFramingRef.current = false;
    playRef.current.playing = false;
    playRef.current.index = 0;
    setPlaying(false);
    setPlayIndex(0);
    clockRef.current = new THREE.Clock();
    orientEarthToSite(selectedSite);
    updateCameraFromOrbit();
  }, [baseCameraDistance, orientEarthToSite, selectedSite, updateCameraFromOrbit]);

  const focusOnLaunchSite = useCallback(() => {
    orientEarthToSite(selectedSite);
  }, [orientEarthToSite, selectedSite]);

  const highlightDebugMeshPoint = useCallback((id) => {
    if (!troubleshooting) return;
    const mesh = debugMeshPointsRef.current;
    if (!mesh) return;
    const colors = mesh.geometry.getAttribute('color');
    for (let i = 0; i < colors.count; i++) {
      const selected = i === id;
      colors.setXYZ(i, selected ? 1 : 0.95, selected ? 0.55 : 0.15, selected ? 0.1 : 0.15);
    }
    colors.needsUpdate = true;
  }, []);

  const updateCityMarkers = useCallback(() => {
    cityMarkersRef.current.forEach((m) => {
      if (m.parent) m.parent.remove(m);
      m.geometry.dispose();
      m.material.dispose();
    });
    cityMarkersRef.current = [];
    if (!troubleshooting || !earthGroupRef.current) return;

    CITY_CALIBRATION_ANCHORS.forEach((city) => {
      const texture = meshPointIdToTextureLatLon(city.meshPoint);
      const pos = latLonToEarthLocal(texture.lat, texture.lon).multiplyScalar(1.012);
      const geo = new THREE.SphereGeometry(0.014, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: CITY_MARKER_COLOR,
        transparent: true,
        opacity: CITY_MARKER_OPACITY,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.userData.isCityAnchor = true;
      earthGroupRef.current.add(mesh);
      cityMarkersRef.current.push(mesh);
    });
  }, []);

  const updateSiteMarkers = useCallback((activeId) => {
    siteMarkersRef.current.forEach((m) => {
      if (m.parent) m.parent.remove(m);
      m.geometry.dispose();
      m.material.dispose();
    });
    siteMarkersRef.current = [];
    if (!earthGroupRef.current) return;

    LAUNCH_SITES.forEach((site) => {
      const texture = geographicToTextureLatLon(site.lat, site.lon);
      const pos = latLonToEarthLocal(texture.lat, texture.lon).multiplyScalar(1.015);
      const geo = new THREE.SphereGeometry(site.id === activeId ? 0.035 : 0.022, 12, 12);
      const isSelected = site.id === activeId;
      const mat = troubleshooting
        ? new THREE.MeshBasicMaterial({
          color: isSelected ? SITE_MARKER_SELECTED_COLOR : SITE_MARKER_COLOR,
          transparent: true,
          opacity: isSelected ? SITE_MARKER_SELECTED_OPACITY : SITE_MARKER_OPACITY,
          depthWrite: false,
        })
        : new THREE.MeshBasicMaterial({
          color: isSelected ? SITE_MARKER_SELECTED_COLOR : SITE_MARKER_COLOR,
          transparent: true,
          opacity: isSelected ? SITE_MARKER_SELECTED_OPACITY : SITE_MARKER_OPACITY,
          depthWrite: false,
        });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.userData = { siteId: site.id };
      earthGroupRef.current.add(mesh);
      siteMarkersRef.current.push(mesh);
    });
  }, []);

  const initThree = useCallback(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const mount = mountRef.current;
    const w = mount.clientWidth || 800;
    const h = mount.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, CAMERA_FAR_PLANE);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0x334466, 0.08));
    const sunTarget = new THREE.Object3D();
    scene.add(sunTarget);
    const sun = new THREE.DirectionalLight(0xffffff, 0.72);
    sun.target = sunTarget;
    scene.add(sun);
    const sceneCenter = new THREE.Vector3();

    const loader = new THREE.TextureLoader();
    const earthGeo = new THREE.IcosahedronGeometry(1, 22);

    const earthMat = new THREE.MeshPhongMaterial({
      map: loader.load(earth_mosaic_1),
      specularMap: loader.load(earth_mosaic_2_specular),
      bumpMap: loader.load(earth_mosaic_3_bump),
      bumpScale: 0.035,
      shininess: 12,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.rotation.x = Math.PI / 2;

    const nightMesh = new THREE.Mesh(earthGeo, new THREE.MeshBasicMaterial({
      map: loader.load(earth_mosaic_4_lights),
      blending: THREE.AdditiveBlending,
    }));
    nightMesh.rotation.x = Math.PI / 2;

    const clouds = new THREE.Mesh(earthGeo, new THREE.MeshStandardMaterial({
      map: loader.load(earth_mosaic_5_clouds),
      transparent: true,
      opacity: 0.6,
      alphaMap: loader.load(earth_mosaic_6_clouds_transparent),
      blending: THREE.AdditiveBlending,
    }));
    clouds.rotation.x = Math.PI / 2;
    clouds.scale.setScalar(1.004);
    cloudsRef.current = clouds;

    const glow = new THREE.Mesh(earthGeo, getFresnelMat(isDark ? 0x88ccff : 0x006ed2, 0x000000));
    glow.rotation.x = Math.PI / 2;
    glow.scale.setScalar(1.012);

    const earthCore = new THREE.Group();
    earthCore.add(earthMesh, nightMesh, glow);

    const earthGroup = new THREE.Group();
    earthGroup.add(earthCore, clouds);
    earthGroup.rotation.z = 0;
    earthGroup.rotation.x = -90 * Math.PI / 180;
    earthGroup.scale.setScalar(EARTH_RADIUS_SCENE);

    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.x = EARTH_AXIAL_TILT_DEG * Math.PI / 180;
    tiltGroup.add(earthGroup);
    scene.add(tiltGroup);
    earthRef.current = tiltGroup;
    earthGroupRef.current = earthGroup;

    if (troubleshooting) {
      const debugMeta = generateDebugMeshMeta();
      debugMeshMetaRef.current = debugMeta;
      const debugPositions = new Float32Array(debugMeta.length * 3);
      const debugColors = new Float32Array(debugMeta.length * 3);
      debugMeta.forEach((point, i) => {
        const pos = latLonToEarthLocal(point.lat, point.lon).multiplyScalar(1.02);
        debugPositions[i * 3] = pos.x;
        debugPositions[i * 3 + 1] = pos.y;
        debugPositions[i * 3 + 2] = pos.z;
        debugColors[i * 3] = 0.95;
        debugColors[i * 3 + 1] = 0.15;
        debugColors[i * 3 + 2] = 0.15;
      });
      const debugGeo = new THREE.BufferGeometry();
      debugGeo.setAttribute('position', new THREE.BufferAttribute(debugPositions, 3));
      debugGeo.setAttribute('color', new THREE.BufferAttribute(debugColors, 3));
      const debugMesh = new THREE.Points(
        debugGeo,
        new THREE.PointsMaterial({
          size: 4.0,
          vertexColors: true,
          transparent: true,
          opacity: 0.85,
          sizeAttenuation: false,
        })
      );
      debugMesh.userData.isDebugMesh = true;
      earthGroup.add(debugMesh);
      debugMeshPointsRef.current = debugMesh;
    } else {
      debugMeshMetaRef.current = [];
      debugMeshPointsRef.current = null;
    }

    ATM_LAYERS.forEach((layer) => {
      const r = EARTH_RADIUS_SCENE + layer.altKm * SCALE;
      const shell = new THREE.Mesh(
        new THREE.SphereGeometry(r, 32, 32),
        new THREE.MeshBasicMaterial({ color: layer.color, transparent: true, opacity: layer.opacity, side: THREE.BackSide })
      );
      scene.add(shell);
    });

    const rocket = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.12, 12), new THREE.MeshPhongMaterial({ color: 0xdddddd }));
    body.position.y = 0.06;
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.05, 12), new THREE.MeshPhongMaterial({ color: 0xcccccc }));
    nose.position.y = 0.145;
    const finMat = new THREE.MeshPhongMaterial({ color: 0x888888 });
    [-1, 1].forEach((s) => {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.04, 0.03), finMat);
      fin.position.set(s * 0.028, 0.02, 0);
      rocket.add(fin);
    });
    rocket.add(body, nose);
    rocket.visible = false;
    scene.add(rocket);
    rocketRef.current = rocket;

    const exhaustGeo = new THREE.BufferGeometry();
    const exhaustCount = 40;
    const positions = new Float32Array(exhaustCount * 3);
    exhaustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const exhaust = new THREE.Points(exhaustGeo, new THREE.PointsMaterial({ color: 0xffaa33, size: 0.02, transparent: true, opacity: 0.8 }));
    exhaust.visible = false;
    scene.add(exhaust);
    exhaustRef.current = exhaust;

    isPortraitRef.current = window.innerHeight > window.innerWidth;
    cameraDistanceRef.current = baseCameraDistanceRef.current();
    updateCameraFromOrbit();
    clockRef.current = new THREE.Clock();

    let dragging = false;
    let px = 0;
    let py = 0;
    const canvas = renderer.domElement;

    const onDown = (e) => {
      dragging = true;
      draggingRef.current = true;
      px = e.clientX ?? e.touches?.[0]?.clientX;
      py = e.clientY ?? e.touches?.[0]?.clientY;

      earthSpinWasActiveRef.current = !earthSpinPausedRef.current;
      earthSpinAngleRef.current = earthRef.current?.rotation.y ?? earthSpinAngleRef.current;
      cloudSpinAngleRef.current = cloudsRef.current?.rotation.y ?? cloudSpinAngleRef.current;
      if (earthSpinWasActiveRef.current) {
        earthSpinPausedRef.current = true;
      }
    };
    const onMove = (e) => {
      if (!dragging) return;
      const cx = e.clientX ?? e.touches?.[0]?.clientX;
      const cy = e.clientY ?? e.touches?.[0]?.clientY;

      // Spin Earth on its own (tilted) axis — not camera azimuth around world Y.
      earthSpinAngleRef.current += (cx - px) * DRAG_EARTH_SPIN_SENSITIVITY;
      cloudSpinAngleRef.current = -earthSpinAngleRef.current * CLOUD_SPIN_EARTH_RATIO;
      applyEarthSpinToMeshes(
        earthRef.current,
        cloudsRef.current,
        earthSpinAngleRef.current,
        cloudSpinAngleRef.current,
      );

      cameraPolarRef.current = Math.max(
        0.2,
        Math.min(
          Math.PI - 0.2,
          cameraPolarRef.current + (cy - py) * DRAG_CAMERA_POLAR_SENSITIVITY,
        ),
      );
      updateCameraFromOrbit();
      px = cx;
      py = cy;
    };
    const onUp = () => {
      dragging = false;
      draggingRef.current = false;
      if (earthSpinWasActiveRef.current) {
        recalibrateEarthSpinOffsetsRef.current();
        earthSpinPausedRef.current = false;
        earthSpinWasActiveRef.current = false;
      }
    };

    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onUp);
    canvas.addEventListener('touchstart', onDown);
    canvas.addEventListener('touchmove', onMove);
    canvas.addEventListener('touchend', onUp);

    const raycaster = new THREE.Raycaster();
    if (troubleshooting) raycaster.params.Points.threshold = 0.12;
    const mouse = new THREE.Vector2();
    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      if (troubleshooting && debugMeshPointsRef.current) {
        const meshHits = raycaster.intersectObject(debugMeshPointsRef.current);
        if (meshHits.length && meshHits[0].index != null) {
          const id = meshHits[0].index;
          const meta = debugMeshMetaRef.current[id];
          if (meta) {
            setSelectedMeshPoint({ id: meta.id, lat: meta.lat, lon: meta.lon });
            highlightDebugMeshPoint(id);
            console.log(
              `[debug mesh] point #${meta.id} — lat ${meta.lat.toFixed(2)}°, lon ${meta.lon.toFixed(2)}°`
            );
          }
          return;
        }
      }
      const hits = raycaster.intersectObjects(siteMarkersRef.current);
      if (hits.length) {
        selectSiteRef.current?.(hits[0].object.userData.siteId);
        return;
      }
      const earthHits = raycaster.intersectObject(earthGroup, true);
      if (earthHits.length) {
        const local = earthGroup.worldToLocal(earthHits[0].point.clone());
        const texture = earthLocalToLatLon(local);
        const { lat, lon } = textureToGeographicLatLon(texture.lat, texture.lon);
        let best = LAUNCH_SITES[0];
        let bestD = Infinity;
        LAUNCH_SITES.forEach((s) => {
          const d = (s.lat - lat) ** 2 + (s.lon - lon) ** 2;
          if (d < bestD) { bestD = d; best = s; }
        });
        if (bestD < 400) selectSiteRef.current?.(best.id);
      }
    };
    canvas.addEventListener('click', onClick);

    const tick = () => {
      animRef.current = requestAnimationFrame(tick);
      const elapsed = clockRef.current?.getElapsedTime() ?? 0;
      if (earthRef.current) {
        if (earthSpinPausedRef.current) {
          earthRef.current.rotation.y = earthSpinAngleRef.current;
          if (cloudsRef.current) cloudsRef.current.rotation.y = cloudSpinAngleRef.current;
        } else {
          const spinScale = timeScaleRef.current / EARTH_SPIN_REFERENCE_SCALE;
          const spinRate = EARTH_SPIN_BASE_RATE * spinScale;
          const angle = elapsed * spinRate - earthSpinTimeOffsetRef.current;
          earthSpinAngleRef.current = angle;
          earthRef.current.rotation.y = angle;

          const cloudSpinRate = spinRate * CLOUD_SPIN_EARTH_RATIO;
          const cloudAngle = -(elapsed * cloudSpinRate) + cloudSpinTimeOffsetRef.current;
          cloudSpinAngleRef.current = cloudAngle;
          if (cloudsRef.current) cloudsRef.current.rotation.y = cloudAngle;
        }
      }

      const traj = trajectoryRef.current;
      const { playing: isPlaying, index, speed } = playRef.current;
      if (isPlaying && traj.length > 1) {
        const next = Math.min(traj.length - 1, index + speed);
        playRef.current.index = next;
        setPlayIndex(next);
        if (next >= traj.length - 1) {
          playRef.current.playing = false;
          setPlaying(false);
        }
      }

      const p = paramsRef.current;
      const st = traj[Math.floor(playRef.current.index)];
      const baseDist = baseCameraDistanceRef.current();
      let shouldFrame = false;
      let rocketWorldPos = null;

      if (st && rocketRef.current && earthGroupRef.current) {
        const { lat, lon } = latLonFromDownrange(p.siteLat, p.siteLon, st.s, p.azimuth);
        const texture = geographicToTextureLatLon(lat, lon);
        const posLocal = trajectoryPointLocal(texture, st.h);
        rocketWorldPos = earthLocalToWorld(earthGroupRef.current, posLocal);
        const flightWorld = flightDirectionWorld(
          st,
          p,
          earthGroupRef.current,
          texture,
          rocketFlightLocalRef.current,
          rocketFlightOriginRef.current,
          rocketFlightTipRef.current,
        );
        rocketRef.current.position.copy(rocketWorldPos);
        orientRocketAlongFlight(rocketRef.current, flightWorld);
        rocketRef.current.visible = true;
        shouldFrame = traj.length > 1 && (playRef.current.playing || playRef.current.index > 0);

        if (exhaustRef.current && st.ay > 0) {
          exhaustRef.current.visible = true;
          exhaustRef.current.position.copy(rocketRef.current.position);
        } else if (exhaustRef.current) {
          exhaustRef.current.visible = false;
        }
      } else if (rocketRef.current) {
        rocketRef.current.visible = false;
        if (exhaustRef.current) exhaustRef.current.visible = false;
      }

      playbackFramingRef.current = shouldFrame;
      if (shouldFrame && rocketWorldPos && earthGroupRef.current) {
        const earthCenter = earthGroupRef.current.getWorldPosition(earthCenterRef.current);
        const targetDist = cameraFrameDistance(
          camera,
          EARTH_RADIUS_SCENE,
          rocketWorldPos,
          earthCenter,
          baseDist,
        );
        cameraDistanceRef.current += (targetDist - cameraDistanceRef.current) * CAMERA_PULLBACK_LERP;
      } else {
        cameraDistanceRef.current += (baseDist - cameraDistanceRef.current) * CAMERA_PULLBACK_LERP;
      }
      updateCameraFromOrbit();

      if (earthRef.current) {
        earthRef.current.getWorldPosition(sceneCenter);
      } else {
        sceneCenter.set(0, 0, 0);
      }
      const viewDir = camera.position.clone().sub(sceneCenter).normalize();
      sun.position.copy(viewDir.multiplyScalar(12));
      sunTarget.position.copy(sceneCenter);

      renderer.render(scene, camera);
    };
    tick();

    updateCityMarkers();

    return () => {
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('touchstart', onDown);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('touchend', onUp);
      canvas.removeEventListener('click', onClick);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, [getFresnelMat, highlightDebugMeshPoint, isDark, updateCameraFromOrbit, updateCityMarkers]);

  useEffect(() => {
    const cleanup = initThree();
    return cleanup;
  }, [initThree]);

  useEffect(() => {
    updateSiteMarkers(siteId);
  }, [siteId, updateSiteMarkers]);

  useEffect(() => {
    if (trajectory.length) {
      updateTrajectoryLine(trajectory, { ...params, siteLat: selectedSite.lat, siteLon: selectedSite.lon });
    } else if (trajLineRef.current && earthGroupRef.current) {
      earthGroupRef.current.remove(trajLineRef.current);
      trajLineRef.current.geometry.dispose();
      trajLineRef.current = null;
    }
  }, [trajectory, params, selectedSite, updateTrajectoryLine]);

  useEffect(() => {
    playRef.current = { playing, index: playIndex, speed: playSpeed };
  }, [playing, playIndex, playSpeed]);

  useEffect(() => {
    trajectoryRef.current = trajectory;
  }, [trajectory]);

  useEffect(() => {
    paramsRef.current = { ...params, siteLat: selectedSite.lat, siteLon: selectedSite.lon };
  }, [params, selectedSite]);

  useEffect(() => {
    timeScaleRef.current = timeScale;
    if (!earthSpinPausedRef.current) {
      recalibrateEarthSpinOffsets();
    }
  }, [timeScale, recalibrateEarthSpinOffsets]);

  useEffect(() => {
    earthSpinPausedRef.current = earthSpinPaused;
  }, [earthSpinPaused]);

  const updateViewportSize = useCallback(() => {
    const mount = mountRef.current;
    if (!mount || !cameraRef.current || !rendererRef.current) return;

    isPortraitRef.current = window.innerHeight > window.innerWidth;
    const cw = mount.clientWidth;
    const ch = mount.clientHeight;
    if (!cw || !ch) return;

    cameraRef.current.aspect = cw / ch;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(cw, ch);
    updateCameraFromOrbit();
  }, [updateCameraFromOrbit]);

  useEffect(() => {
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, [updateViewportSize]);

  const hudState = trajectory[playIndex] || trajectory[trajectory.length - 1];

  const shellStyle = {
    position: 'fixed',
    top: siteLayout.top,
    left: 0,
    right: 0,
    bottom: siteLayout.bottom,
    display: 'flex',
    flexDirection: compact ? 'column' : 'row',
    background: palette.bg,
    color: palette.text,
    fontFamily: palette.font,
    overflow: 'hidden',
  };

  const sliderRow = (label, key, fmt = (v) => v) => {
    const bounds = paramBounds[key];
    if (!bounds) return null;
    const value = clamp(params[key], bounds.min, bounds.max);
    return (
      <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: INFO_ICON_GAP, color: palette.accent, fontFamily: palette.titleFont }}>
          <InfoButton onClick={() => setInfoModal(PARAM_INFO[key])} palette={palette} label={label} />
          <span>{label}: {fmt(value)}</span>
        </span>
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          value={value}
          onChange={(e) => updateParam(key, Number(e.target.value))}
          style={{ width: '100%', accentColor: palette.accent }}
        />
      </label>
    );
  };

  return (
    <div style={shellStyle}>
      {(showConfig || !compact) && (
        <aside
          style={{
            width: compact ? '100%' : 300,
            maxHeight: compact ? '42vh' : '100%',
            overflowY: 'auto',
            borderRight: compact ? 'none' : palette.border,
            borderBottom: compact ? palette.border : 'none',
            padding: '0.75rem',
            boxSizing: 'border-box',
            flexShrink: 0,
          }}
        >
          <h1 style={{ margin: '0 0 0.5rem', fontFamily: palette.titleFont, color: palette.accent, fontSize: '1.1rem' }}>
            Rocket Launch Simulator
          </h1>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.82rem', marginBottom: '0.65rem' }}>
            <span style={{ color: palette.accent, fontFamily: palette.titleFont }}>Launch site</span>
            <ThemedSelect
              value={siteId}
              onChange={(id) => selectSite(id, undefined, undefined, { orientEarth: true })}
              palette={palette}
              isDark={isDark}
              ariaLabel="Launch site"
              groups={launchSitesByCountry().map((group) => ({
                label: group.country,
                options: group.sites.map((s) => ({ value: s.id, label: s.name })),
              }))}
            />
          </label>

          <p style={{ margin: '0 0 0.65rem', fontSize: '0.78rem', color: palette.muted, lineHeight: 1.45 }}>
            {selectedSite.lat.toFixed(2)}° {selectedSite.lat >= 0 ? 'N' : 'S'}, {Math.abs(selectedSite.lon).toFixed(2)}° {selectedSite.lon >= 0 ? 'E' : 'W'} · {selectedSite.elevation} m elev
            <br />
            {selectedSite.summary}
          </p>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.82rem', marginBottom: '0.65rem' }}>
            <span style={{ color: palette.accent, fontFamily: palette.titleFont }}>Mission profile</span>
            <ThemedSelect
              value={missionId}
              onChange={selectMission}
              palette={palette}
              isDark={isDark}
              ariaLabel="Mission profile"
              options={MISSION_PROFILES.map((m) => ({ value: m.id, label: m.name }))}
            />
          </label>
          <p style={{ margin: '0 0 0.65rem', fontSize: '0.78rem', color: palette.muted, lineHeight: 1.45 }}>
            {selectedMission.summary}
          </p>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.82rem', marginBottom: '0.65rem' }}>
            <span style={{ color: palette.accent, fontFamily: palette.titleFont }}>Month</span>
            <ThemedSelect
              value={month}
              onChange={(v) => setMonth(Number(v))}
              palette={palette}
              isDark={isDark}
              ariaLabel="Month"
              options={MONTHS.map((m, i) => ({ value: i + 1, label: m }))}
            />
          </label>
          <p style={{ fontSize: '0.78rem', color: palette.muted, margin: '0 0 0.65rem' }}>
            Wind {weather.speed.toFixed(1)} m/s from {weather.dir.toFixed(0)}°
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: INFO_ICON_GAP, marginBottom: '0.35rem', fontSize: '0.82rem' }}>
            <InfoButton onClick={() => setInfoModal(PARAM_INFO.staging)} palette={palette} label="Two-stage vehicle" />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flex: 1 }}>
              <input type="checkbox" checked={params.stagingEnabled} onChange={(e) => updateParam('stagingEnabled', e.target.checked)} />
              Two-stage vehicle
            </label>
          </div>
          <p style={{ margin: '0 0 0.55rem', fontSize: '0.75rem', color: palette.muted, lineHeight: 1.4 }}>
            {stagingRationale(missionId)}
            {!recommendedStaging(missionId) && params.stagingEnabled && ' You have overridden the single-stage default for this mission.'}
            {recommendedStaging(missionId) && !params.stagingEnabled && ' Orbital missions typically need staging — consider enabling two-stage mode.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <div style={{ color: palette.muted, fontFamily: palette.titleFont, fontSize: '0.75rem' }}>Stage 1</div>
            {sliderRow('Stage 1 fuel (kg)', 'stage1Fuel', (v) => `${(v / 1000).toFixed(0)}k`)}
            {sliderRow('Thrust stage 1 (kN)', 'thrust1', (v) => `${(v / 1000).toFixed(0)}`)}
            {sliderRow('Isp stage 1 (s)', 'isp1')}
            {params.stagingEnabled && (
              <>
                <div style={{ color: palette.muted, fontFamily: palette.titleFont, fontSize: '0.75rem', marginTop: '0.15rem' }}>Stage 2</div>
                {sliderRow('Stage 2 fuel (kg)', 'stage2Fuel', (v) => `${(v / 1000).toFixed(0)}k`)}
                {sliderRow('Thrust stage 2 (kN)', 'thrust2', (v) => `${(v / 1000).toFixed(0)}`)}
                {sliderRow('Isp stage 2 (s)', 'isp2')}
              </>
            )}
            {sliderRow('Cd', 'cd', (v) => v.toFixed(2))}
            {sliderRow('Azimuth (°)', 'azimuth')}
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: INFO_ICON_GAP, color: palette.accent, fontFamily: palette.titleFont }}>
                <InfoButton onClick={() => setInfoModal(PARAM_INFO.targetAltKm)} palette={palette} label="Target altitude" />
                <span>Target altitude (km): {params.targetAltKm.toLocaleString()}</span>
              </span>
              <span style={{ color: palette.muted, fontFamily: palette.font, fontSize: '0.75rem', lineHeight: 1.35 }}>
                {altitudeRegime}
                <br />
                Mission window: {altitudeBounds.min.toLocaleString()}–{altitudeBounds.max.toLocaleString()} km
                {' '}(nominal {altitudeBounds.nominal.toLocaleString()} km)
              </span>
              <input
                type="range"
                min={altitudeBounds.min}
                max={altitudeBounds.max}
                step={altitudeStep}
                value={clamp(params.targetAltKm, altitudeBounds.min, altitudeBounds.max)}
                onChange={(e) => updateParam('targetAltKm', Number(e.target.value))}
                style={{ width: '100%', accentColor: palette.accent }}
              />
            </label>
            {sliderRow('Turn end alt (km)', 'turnEndAlt', (v) => `${(v / 1000).toFixed(0)}`)}
            {sliderRow('Final pitch (°)', 'finalPitch', (v) => `${(v * 180 / Math.PI).toFixed(0)}`)}
          </div>

          <div
            style={{
              marginTop: '0.65rem',
              padding: '0.65rem',
              background: palette.panel,
              border: palette.border,
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
            }}
          >
            <div style={{ color: palette.accent, fontFamily: palette.titleFont, fontSize: '0.82rem' }}>Earth</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <button type="button" onClick={toggleEarthSpin} style={btnStyle(palette, earthSpinPaused)}>
                {earthSpinPaused ? 'Resume spin' : 'Pause spin'}
              </button>
              <button type="button" onClick={focusOnLaunchSite} style={btnStyle(palette)}>
                Focus on launch
              </button>
              <button type="button" onClick={resetCamera} style={btnStyle(palette)}>
                Reset camera
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            <button type="button" onClick={runSimulation} disabled={simulating} style={btnStyle(palette)}>
              {simulating ? 'Simulating…' : 'Simulate'}
            </button>
            <button type="button" onClick={() => setShowEducation(true)} style={btnStyle(palette)}>Learn</button>
          </div>

          {hasSimulated && (
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.65rem',
                background: palette.panel,
                border: palette.border,
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
              }}
            >
              <div style={{ color: palette.accent, fontFamily: palette.titleFont, fontSize: '0.82rem' }}>Launch simulation</div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button type="button" onClick={() => setPlaying((p) => !p)} style={btnStyle(palette, playing)} disabled={!trajectory.length}>
                  {playing ? 'Pause' : 'Play'}
                </button>
              </div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8rem' }}>
                <span style={{ color: palette.muted, fontFamily: palette.titleFont }}>
                  SIM speed: <span style={{ color: palette.accent }}>{timeScale}×</span>
                </span>
                <input
                  type="range"
                  min="30"
                  max="600"
                  step="30"
                  value={timeScale}
                  onChange={(e) => setTimeScale(Number(e.target.value))}
                  style={{ width: '100%', accentColor: palette.warn }}
                />
              </label>
              {trajectory.length > 1 && (
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8rem' }}>
                  <span style={{ color: palette.muted, fontFamily: palette.titleFont }}>
                    Flight timeline (T+): {trajectory[playIndex]?.t.toFixed(0) ?? 0}s
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={trajectory.length - 1}
                    value={playIndex}
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      setPlayIndex(idx);
                      playRef.current.index = idx;
                    }}
                    style={{ width: '100%', accentColor: palette.accent }}
                  />
                </label>
              )}
            </div>
          )}

          {result && hasSimulated && (
            <div style={{ marginTop: '0.75rem', padding: '0.65rem', background: palette.panel, border: palette.border, borderRadius: 8, fontSize: '0.82rem' }}>
              <div style={{ color: palette.accent, fontFamily: palette.titleFont }}>Mission assessment</div>
              <div style={{ marginTop: '0.35rem' }}>{result.rating}</div>
              <div style={{ marginTop: '0.25rem' }}>
                Mission score {result.success}%
                {mcSuccess != null && ` · Monte Carlo weather success ${mcSuccess}%`}
              </div>
              {result.failed && (
                <div style={{ color: palette.error }}>
                  Failure: {
                    result.failed === 'max_q' ? 'dynamic pressure exceeded safe limits'
                      : result.failed === 'insufficient_dv' ? 'insufficient delta-v'
                        : result.failed === 'altitude_too_low'
                          ? `${getMissionClass(missionId) === 'orbital' ? 'Orbit' : 'Apogee'} below mission minimum (${result.altitudeBounds?.min?.toLocaleString() ?? '?'} km)`
                          : result.failed === 'altitude_overshoot'
                            ? `${getMissionClass(missionId) === 'orbital' ? 'Orbit' : 'Apogee'} above mission maximum (${result.altitudeBounds?.max?.toLocaleString() ?? '?'} km)`
                            : result.failed
                  }
                </div>
              )}
              {result.finalAltKm != null && (
                <div style={{ color: palette.muted, fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  {getMissionClass(missionId) === 'suborbital' || getMissionClass(missionId) === 'transfer' || getMissionClass(missionId) === 'deep'
                    ? 'Apogee'
                    : result.insertionAchieved
                      ? 'Insertion altitude'
                      : 'Peak altitude'}{' '}
                  {(result.finalAltKm).toFixed(0)} km
                  {result.fuelMarginNote === 'overshoot' ? ' · overshoot reduced fuel-margin score' : ''}
                </div>
              )}
            </div>
          )}
        </aside>
      )}

      <div style={{ flex: 1, position: 'relative', minHeight: 0, paddingTop: siteLayout.viewportPadTop, boxSizing: 'border-box' }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

        {compact && (
          <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', zIndex: 2 }}>
            <button type="button" onClick={() => setShowConfig((v) => !v)} style={btnStyle(palette)}>
              {showConfig ? 'Hide config' : 'Config'}
            </button>
          </div>
        )}

        {troubleshooting && selectedMeshPoint && (
          <div
            style={{
              position: 'absolute',
              top: '0.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: palette.panel,
              border: palette.border,
              borderRadius: 8,
              padding: '0.45rem 0.75rem',
              fontSize: '0.82rem',
              fontFamily: palette.titleFont,
              color: palette.accent,
              pointerEvents: 'none',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            Mesh point #{selectedMeshPoint.id}
            <div style={{ fontFamily: palette.font, color: palette.text, fontSize: '0.75rem' }}>
              {selectedMeshPoint.lat.toFixed(2)}° {selectedMeshPoint.lat >= 0 ? 'N' : 'S'},{' '}
              {Math.abs(selectedMeshPoint.lon).toFixed(2)}° {selectedMeshPoint.lon >= 0 ? 'E' : 'W'}
            </div>
          </div>
        )}

        {hudState && hasSimulated && (
          <div
            style={{
              position: 'absolute',
              top: '0.5rem',
              left: compact ? '5.5rem' : '0.75rem',
              zIndex: 2,
              right: '0.75rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.65rem 1.1rem',
              fontFamily: palette.mono,
              fontSize: '0.72rem',
              letterSpacing: '0.03em',
              lineHeight: 1.35,
              textTransform: 'uppercase',
            }}
          >
            {[
              { l: 'ALT', v: `${(hudState.h / 1000).toFixed(1)} KM` },
              { l: 'VEL', v: `${Math.hypot(hudState.vx, hudState.vy).toFixed(0)} M/S` },
              { l: 'Q', v: `${(hudState.q / 1000).toFixed(1)} KPA` },
              { l: 'MACH', v: hudState.mach.toFixed(2) },
              { l: 'MASS', v: `${(hudState.mass / 1000).toFixed(1)} T` },
              { l: 'PITCH', v: `${THREE.MathUtils.radToDeg(hudState.pitch).toFixed(1)}°` },
              { l: 'STG', v: `${hudState.stage}` },
              { l: 'T', v: `${hudState.t.toFixed(0)} S` },
            ].map((item) => (
              <span
                key={item.l}
                role="button"
                tabIndex={0}
                onClick={() => setInfoModal(HUD_INFO[item.l])}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setInfoModal(HUD_INFO[item.l]); }}
                style={{ cursor: 'pointer' }}
              >
                <span style={{ color: palette.muted }}>{item.l} </span>
                <span style={{ color: palette.accent }}>{item.v}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <InfoModal open={!!infoModal} onClose={() => setInfoModal(null)} palette={palette} compact={compact} info={infoModal} />
      <EducationModal open={showEducation} onClose={() => setShowEducation(false)} palette={palette} compact={compact} />
    </div>
  );
};

export default RocketLaunchSimulation;