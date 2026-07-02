// Rocket Launch Simulator — physics engine & hardcoded data (offline)

import { WEATHER } from './rocketlaunchsimulationWeather.js';

export { WEATHER } from './rocketlaunchsimulationWeather.js';

export const G0 = 9.80665;
export const R_EARTH = 6371000;
export const MU = 3.986004418e14;
export const R_AIR = 287.05287;
export const GAMMA_AIR = 1.4;
export const MAX_Q_PA = 40000;
export const MAX_Q_SUBORBITAL_PA = 52000;
export const MISSION_SUCCESS_THRESHOLD = 55;

// Ordered west → east; grouped by country in the UI via `country` field.
export const LAUNCH_SITES = [
  {
    id: 'kodiak',
    name: 'Pacific Spaceport Complex – Alaska',
    country: 'United States',
    lat: 57.435,
    lon: -152.337,
    elevation: 12,
    summary: 'Kodiak Island commercial spaceport on the Gulf of Alaska; polar and high-inclination orbital missions away from CONUS ranges.',
  },
  {
    id: 'spacex_slc4e',
    name: 'Vandenberg SFB SLC-4E (SpaceX)',
    country: 'United States',
    lat: 34.6321,
    lon: -120.611,
    elevation: 112,
    summary: 'West-coast Falcon 9 pad for polar and sun-synchronous orbits over the Pacific.',
  },
  {
    id: 'spacex_starbase',
    name: 'Starbase, Boca Chica (SpaceX)',
    country: 'United States',
    lat: 25.9974,
    lon: -97.1554,
    elevation: 2,
    summary: 'SpaceX Starship and Super Heavy development and launch site on the Gulf of Mexico.',
  },
  {
    id: 'spacex_lc39a',
    name: 'Kennedy Space Center LC-39A (SpaceX)',
    country: 'United States',
    lat: 28.6083,
    lon: -80.6041,
    elevation: 3,
    summary: 'Historic Apollo/Shuttle pad now leased by SpaceX for Falcon 9, Falcon Heavy, and planned Starship operations.',
  },
  {
    id: 'wallops',
    name: 'Wallops Flight Facility',
    country: 'United States',
    lat: 37.8338,
    lon: -75.4883,
    elevation: 12,
    summary: 'Mid-Atlantic NASA range for smaller orbital and suborbital missions.',
  },
  {
    id: 'canso',
    name: 'Spaceport Nova Scotia (Canso)',
    country: 'Canada',
    lat: 45.338,
    lon: -60.974,
    elevation: 35,
    summary: 'Canada\'s Atlantic commercial spaceport near Canso; national sovereign launch site with suborbital flights and planned orbital operations.',
  },
  {
    id: 'kourou',
    name: 'Guiana Space Centre',
    country: 'France',
    lat: 5.239,
    lon: -52.768,
    elevation: 7,
    summary: 'Near-equatorial French Guiana pad; boosts eastward launches with Earth rotation.',
  },
  {
    id: 'alcantara',
    name: 'Alcântara Launch Center',
    country: 'Brazil',
    lat: -2.373,
    lon: -44.396,
    elevation: 25,
    summary: 'Brazilian equatorial Atlantic spaceport; one of the best natural launch locations for eastward satellite missions in the Southern Hemisphere.',
  },
  {
    id: 'saxavord',
    name: 'SaxaVord Spaceport',
    country: 'United Kingdom',
    lat: 60.816,
    lon: -0.857,
    elevation: 30,
    summary: 'UK vertical-launch spaceport on Unst, Shetland; polar and sun-synchronous missions for European small-lift vehicles.',
  },
  {
    id: 'andoya',
    name: 'Andøya Space Center',
    country: 'Norway',
    lat: 69.2945,
    lon: 15.7286,
    elevation: 3,
    summary: 'Arctic Norwegian range for sounding rockets, suborbital research, and small-satellite launches.',
  },
  {
    id: 'esrange',
    name: 'Esrange Space Center',
    country: 'Sweden',
    lat: 67.8931,
    lon: 21.0664,
    elevation: 320,
    summary: 'Swedish Space Corporation facility above the Arctic Circle for suborbital and stratospheric missions.',
  },
  {
    id: 'palmachim',
    name: 'Palmachim Spaceport',
    country: 'Israel',
    lat: 31.884,
    lon: 34.675,
    elevation: 8,
    summary: 'Israel\'s Mediterranean launch base south of Tel Aviv; Shavit and Ofeq satellite missions into retrograde orbits over the sea.',
  },
  {
    id: 'plesetsk',
    name: 'Plesetsk Cosmodrome',
    country: 'Russia',
    lat: 62.928,
    lon: 40.577,
    elevation: 200,
    summary: 'Northern Russian cosmodrome in Arkhangelsk Oblast; long-running Soyuz and Angara launches to polar and high-inclination orbits.',
  },
  {
    id: 'semnan',
    name: 'Imam Khomeini Spaceport',
    country: 'Iran',
    lat: 35.234,
    lon: 53.949,
    elevation: 900,
    summary: 'Iran\'s primary satellite launch complex in Semnan Province; Simorgh and Qaem-class orbital launch campaigns.',
  },
  {
    id: 'baikonur',
    name: 'Baikonur Cosmodrome',
    country: 'Kazakhstan',
    lat: 45.965,
    lon: 63.305,
    elevation: 90,
    summary: 'Historic steppe launch site in Kazakhstan; Soyuz and Proton heritage with continental climate.',
  },
  {
    id: 'sriharikota',
    name: 'Sriharikota (SDSC)',
    country: 'India',
    lat: 13.7199,
    lon: 80.2304,
    elevation: 7,
    summary: 'ISRO island spaceport on India\'s east coast; tropical monsoon seasons.',
  },
  {
    id: 'jiuquan',
    name: 'Jiuquan Satellite Launch Center',
    country: 'China',
    lat: 40.9608,
    lon: 100.2983,
    elevation: 1000,
    summary: 'China\'s oldest launch complex in the Gobi fringe; crewed Shenzhou and Long March missions.',
  },
  {
    id: 'xichang',
    name: 'Xichang Satellite Launch Center',
    country: 'China',
    lat: 28.2469,
    lon: 102.0269,
    elevation: 1500,
    summary: 'Mountain-ringed Sichuan site for geostationary satellites and Beidou constellation launches.',
  },
  {
    id: 'wenchang',
    name: 'Wenchang Spacecraft Launch Site',
    country: 'China',
    lat: 19.6145,
    lon: 110.951,
    elevation: 5,
    summary: 'Coastal Hainan spaceport for Long March 5/7 heavy-lift and space-station cargo flights.',
  },
  {
    id: 'taiyuan',
    name: 'Taiyuan Satellite Launch Center',
    country: 'China',
    lat: 38.8491,
    lon: 111.6083,
    elevation: 1500,
    summary: 'Northern China range for sun-synchronous and reconnaissance satellite launches.',
  },
  {
    id: 'naro',
    name: 'Naro Space Center',
    country: 'South Korea',
    lat: 34.4314,
    lon: 127.535,
    elevation: 8,
    summary: 'ROK spaceport on Goheung Peninsula; home of Nuri (KSLV-II) orbital launch attempts.',
  },
  {
    id: 'vostochny',
    name: 'Vostochny Cosmodrome',
    country: 'Russia',
    lat: 51.883,
    lon: 128.334,
    elevation: 600,
    summary: 'Russia\'s Far East spaceport in Amur Oblast; domestic alternative to Baikonur for Soyuz-2 and Angara missions.',
  },
  {
    id: 'tanegashima',
    name: 'Tanegashima Space Center',
    country: 'Japan',
    lat: 30.4,
    lon: 130.97,
    elevation: 12,
    summary: 'JAXA\'s main launch facility on Tanegashima Island for H-IIA/ H3 missions.',
  },
  {
    id: 'hokkaido',
    name: 'Hokkaido Spaceport',
    country: 'Japan',
    lat: 42.65,
    lon: 143.12,
    elevation: 45,
    summary: 'Taiki-based commercial spaceport on Hokkaido for suborbital and small-launcher development.',
  },
  {
    id: 'wa_spaceport',
    name: 'WA Spaceport',
    country: 'Australia',
    lat: -35.0275,
    lon: 117.884,
    elevation: 50,
    summary: 'Proposed Western Australian spaceport near Albany for small-satellite and responsive launch.',
  },
  {
    id: 'koonibba',
    name: 'Koonibba Test Range',
    country: 'Australia',
    lat: -31.8856,
    lon: 133.4487,
    elevation: 120,
    summary: 'Southern Launch suborbital range on the Eyre Peninsula; privately operated test flights over outback corridors.',
  },
  {
    id: 'arnhem',
    name: 'Arnhem Space Centre',
    country: 'Australia',
    lat: -12.3711,
    lon: 136.8172,
    elevation: 18,
    summary: 'Equatorial Launch Australia facility near Nhulunbuy; NASA suborbital campaigns from the Top End.',
  },
  {
    id: 'bowen',
    name: 'Bowen Orbital Spaceport (Gilmour Space)',
    country: 'Australia',
    lat: -19.9581,
    lon: 148.1136,
    elevation: 8,
    summary: 'Australia\'s first commercial orbital spaceport at Abbot Point, Queensland; home of Gilmour Space Eris launches.',
  },
  {
    id: 'spacex_omelek',
    name: 'Omelek Island (SpaceX, historical)',
    country: 'Marshall Islands',
    lat: 9.0471,
    lon: 167.7439,
    elevation: 1,
    summary: 'Kwajalein Atoll site used for early Falcon 1 test flights (2006–2009); no longer active.',
  },
  {
    id: 'mahia',
    name: 'Rocket Lab Launch Complex 1, Mahia',
    country: 'New Zealand',
    lat: -39.261,
    lon: 177.864,
    elevation: 28,
    summary: 'Rocket Lab\'s Electron launch pad on the Mahia Peninsula; one of the most active small-satellite orbital launch sites worldwide.',
  },
];

export function launchSitesByCountry() {
  const byCountry = new Map();
  LAUNCH_SITES.forEach((site) => {
    if (!byCountry.has(site.country)) byCountry.set(site.country, []);
    byCountry.get(site.country).push(site);
  });
  return [...byCountry.keys()]
    .sort((a, b) => a.localeCompare(b))
    .map((country) => ({
      country,
      sites: byCountry.get(country).sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

// Slider bounds shared across missions unless a profile overrides them.
const SHARED_PARAM_BOUNDS = {
  azimuth: { min: 0, max: 359, step: 1 },
  cd: { min: 0.2, max: 0.8, step: 0.05 },
  isp1: { min: 250, max: 320, step: 2 },
  isp2: { min: 300, max: 380, step: 2 },
  finalPitch: { min: 0.22, max: 0.62, step: 0.01 },
};

/** Liftoff mass (kg) from vehicle params. */
export function liftoffMass(params) {
  const stage2 = params.stagingEnabled ? params.stage2Dry + params.stage2Fuel : 0;
  return params.stage1Dry + params.stage1Fuel + stage2;
}

/** Minimum stage-1 thrust (N) for roughly 1.05 TWR at liftoff. */
export function minimumThrust1(params) {
  return liftoffMass(params) * G0 * 1.05;
}

// Real mission classes with typical target altitudes (offline reference data).
// successAltitudeKm: { min, max, nominal } — acceptable orbit window stored per mission.
// paramBounds: per-mission slider min/max so defaults and tuning ranges stay realistic.
export const MISSION_PROFILES = [
  {
    id: 'suborbital',
    name: 'Suborbital — space tourism (~100 km)',
    successAltitudeKm: { min: 80, max: 140, nominal: 105 },
    summary: 'Blue Origin New Shepard, Virgin Galactic: crosses the Kármán line without orbital velocity.',
    paramOverrides: {
      maxSimTime: 520,
      turnStartAlt: 1500,
      turnEndAlt: 18000,
      finalPitch: 0.82,
      stage1Fuel: 18000,
      stage1Dry: 9000,
      thrust1: 700000,
      isp1: 292,
      cd: 0.62,
      area: 9,
      stagingEnabled: false,
    },
    paramBounds: {
      stage1Fuel: { min: 14000, max: 32000, step: 1000 },
      stage2Fuel: { min: 5000, max: 60000, step: 5000 },
      thrust1: { min: 650000, max: 1300000, step: 50000 },
      thrust2: { min: 100000, max: 600000, step: 50000 },
      turnEndAlt: { min: 12000, max: 28000, step: 1000 },
      finalPitch: { min: 0.72, max: 0.95, step: 0.01 },
      cd: { min: 0.55, max: 0.85, step: 0.02 },
    },
  },
  {
    id: 'leo_iss',
    name: 'LEO — International Space Station (~408 km)',
    successAltitudeKm: { min: 350, max: 480, nominal: 408 },
    summary: 'Crew Dragon, Soyuz, Progress: sustained low orbit for stations and crew transfer.',
    paramOverrides: {
      maxSimTime: 1500,
      turnStartAlt: 800,
      turnEndAlt: 46000,
      finalPitch: 0.38,
      stage1Fuel: 318000,
      stage2Fuel: 82000,
      thrust1: 6200000,
      thrust2: 880000,
      cd: 0.48,
    },
    paramBounds: {
      stage1Fuel: { min: 220000, max: 480000, step: 5000 },
      stage2Fuel: { min: 50000, max: 150000, step: 5000 },
      thrust1: { min: 6200000, max: 9000000, step: 100000 },
      thrust2: { min: 500000, max: 1400000, step: 50000 },
      turnEndAlt: { min: 38000, max: 68000, step: 1000 },
      finalPitch: { min: 0.32, max: 0.52, step: 0.01 },
    },
  },
  {
    id: 'leo_starlink',
    name: 'LEO — Starlink deployment (~550 km)',
    successAltitudeKm: { min: 500, max: 600, nominal: 550 },
    summary: 'Falcon 9 Starlink shell: mid-inclination broadband constellation altitude.',
    paramOverrides: {
      maxSimTime: 1500,
      turnEndAlt: 54000,
      finalPitch: 0.42,
      stage1Fuel: 360000,
      stage2Fuel: 95000,
      thrust1: 7500000,
      thrust2: 950000,
    },
    paramBounds: {
      stage1Fuel: { min: 240000, max: 500000, step: 5000 },
      stage2Fuel: { min: 55000, max: 160000, step: 5000 },
      thrust1: { min: 6400000, max: 9200000, step: 100000 },
      thrust2: { min: 520000, max: 1450000, step: 50000 },
      turnEndAlt: { min: 40000, max: 70000, step: 1000 },
      finalPitch: { min: 0.32, max: 0.52, step: 0.01 },
    },
  },
  {
    id: 'leo_sso',
    name: 'LEO — Sun-synchronous (~700 km)',
    successAltitudeKm: { min: 650, max: 750, nominal: 700 },
    summary: 'Sentinel, Landsat, WorldView: dawn-dusk SSO for Earth observation.',
    paramOverrides: {
      maxSimTime: 1600,
      turnEndAlt: 54000,
      finalPitch: 0.35,
      stage1Fuel: 372000,
      stage2Fuel: 120000,
      thrust1: 6600000,
      thrust2: 960000,
      cd: 0.47,
    },
    paramBounds: {
      stage1Fuel: { min: 260000, max: 520000, step: 5000 },
      stage2Fuel: { min: 60000, max: 170000, step: 5000 },
      thrust1: { min: 6600000, max: 9400000, step: 100000 },
      thrust2: { min: 540000, max: 1500000, step: 50000 },
      turnEndAlt: { min: 42000, max: 72000, step: 1000 },
      finalPitch: { min: 0.3, max: 0.5, step: 0.01 },
    },
  },
  {
    id: 'meo_gps',
    name: 'MEO — GPS / navigation (~20,200 km)',
    // Wider upper bound: the 2D ascent model builds more apogee than real MEO insertion for a given fuel load.
    successAltitudeKm: { min: 19000, max: 26000, nominal: 20200 },
    summary: 'GPS, Galileo, BeiDou MEO: global navigation constellations above the radiation belts.',
    paramOverrides: {
      maxSimTime: 4200,
      turnEndAlt: 65000,
      finalPitch: 0.4,
      stage1Fuel: 480000,
      stage2Fuel: 140000,
      thrust1: 10200000,
      thrust2: 1250000,
      cd: 0.52,
    },
    paramBounds: {
      stage1Fuel: { min: 480000, max: 720000, step: 5000 },
      stage2Fuel: { min: 140000, max: 280000, step: 5000 },
      thrust1: { min: 9200000, max: 11500000, step: 100000 },
      thrust2: { min: 900000, max: 1800000, step: 50000 },
      turnEndAlt: { min: 60000, max: 100000, step: 1000 },
      finalPitch: { min: 0.24, max: 0.4, step: 0.01 },
    },
  },
  {
    id: 'gto',
    name: 'GTO — Geostationary transfer (~35,786 km apogee)',
    successAltitudeKm: { min: 35000, max: 36000, nominal: 35786 },
    summary: 'Ariane 5/6, Falcon 9, Long March: elliptical transfer with apogee at GEO altitude.',
    paramOverrides: {
      maxSimTime: 9600,
      turnEndAlt: 88000,
      finalPitch: 0.27,
      stage1Fuel: 650000,
      stage2Fuel: 255000,
      thrust1: 11400000,
      thrust2: 1380000,
    },
    paramBounds: {
      stage1Fuel: { min: 520000, max: 820000, step: 5000 },
      stage2Fuel: { min: 170000, max: 300000, step: 5000 },
      thrust1: { min: 10000000, max: 12000000, step: 100000 },
      thrust2: { min: 950000, max: 2000000, step: 50000 },
      turnEndAlt: { min: 70000, max: 110000, step: 1000 },
      finalPitch: { min: 0.22, max: 0.36, step: 0.01 },
    },
  },
  {
    id: 'geo',
    name: 'GEO — Geostationary orbit (~35,786 km)',
    successAltitudeKm: { min: 35600, max: 35900, nominal: 35786 },
    summary: 'Comms, weather, broadcast satellites: circular equatorial orbit fixed over one longitude.',
    paramOverrides: {
      maxSimTime: 9600,
      turnEndAlt: 88000,
      finalPitch: 0.27,
      stage1Fuel: 650000,
      stage2Fuel: 255000,
      thrust1: 11400000,
      thrust2: 1380000,
    },
    paramBounds: {
      stage1Fuel: { min: 560000, max: 860000, step: 5000 },
      stage2Fuel: { min: 190000, max: 330000, step: 5000 },
      thrust1: { min: 10200000, max: 12500000, step: 100000 },
      thrust2: { min: 1000000, max: 2200000, step: 50000 },
      turnEndAlt: { min: 72000, max: 110000, step: 1000 },
      finalPitch: { min: 0.22, max: 0.36, step: 0.01 },
    },
  },
];

/** Acceptable altitude window for a mission profile (km). */
export function missionAltitudeBounds(missionId) {
  const mission = MISSION_PROFILES.find((m) => m.id === missionId);
  if (!mission) return MISSION_PROFILES[1].successAltitudeKm;
  return mission.successAltitudeKm;
}

/** Slider bounds for vehicle / trajectory parameters, merged with shared defaults. */
export function missionParamBounds(missionId) {
  const mission = missionById(missionId);
  return { ...SHARED_PARAM_BOUNDS, ...mission.paramBounds };
}

function clampToBounds(value, bounds) {
  if (bounds == null || value == null) return value;
  return Math.max(bounds.min, Math.min(bounds.max, value));
}

/** Clamp tunable params to the active mission's slider ranges. */
export function clampParamsToMissionBounds(params, missionId = params.missionId) {
  const bounds = missionParamBounds(missionId);
  const altBounds = missionAltitudeBounds(missionId);
  const clamped = { ...params };
  Object.keys(bounds).forEach((key) => {
    if (typeof clamped[key] === 'number') {
      clamped[key] = clampToBounds(clamped[key], bounds[key]);
    }
  });
  if (typeof clamped.targetAltKm === 'number') {
    clamped.targetAltKm = clampToBounds(clamped.targetAltKm, altBounds);
  }
  const minThrust = minimumThrust1(clamped);
  if (typeof clamped.thrust1 === 'number' && clamped.thrust1 < minThrust) {
    clamped.thrust1 = minThrust;
  }
  return clamped;
}

export function missionById(missionId) {
  return MISSION_PROFILES.find((m) => m.id === missionId) || MISSION_PROFILES[1];
}

/** Mission assessment / termination class. */
export function getMissionClass(missionId) {
  if (missionId === 'suborbital') return 'suborbital';
  if (missionId === 'gto') return 'transfer';
  if (missionId === 'meo_gps' || missionId === 'geo') return 'deep';
  return 'orbital';
}

function missionMaxQ(missionId) {
  return missionId === 'suborbital' ? MAX_Q_SUBORBITAL_PA : MAX_Q_PA;
}

/**
 * Reference speed (m/s) for scoring — the 2D ascent model builds less horizontal
 * velocity than a full 3D insertion, so thresholds are calibrated to the sim.
 */
export function referenceMissionVelocity(missionClass, targetAltKm) {
  const vCirc = circularOrbitVelocity(targetAltKm);
  if (missionClass === 'suborbital') return 1200;
  if (missionClass === 'orbital') return vCirc * 0.36;
  if (missionClass === 'transfer') return vCirc * 0.52;
  return vCirc * 0.34;
}

function isApogee(prev, state, minAltM = 5000) {
  return prev && prev.vy > 0 && state.vy <= 0 && state.h >= minAltM;
}

function isOrbitalInsertion(state, params, bounds) {
  const altKm = state.h / 1000;
  const v = Math.hypot(state.vx, state.vy);
  if (v < 100) return false;
  const vRef = referenceMissionVelocity('orbital', params.targetAltKm);
  const flightPath = Math.abs(state.vy) / v;
  return (
    altKm >= bounds.min
    && altKm <= bounds.max
    && v >= vRef * 0.92
    && flightPath <= 0.92
  );
}

function isMissionComplete(prev, state, states, params) {
  const missionClass = getMissionClass(params.missionId);
  const bounds = missionAltitudeBounds(params.missionId);
  const altKm = state.h / 1000;

  if (missionClass === 'suborbital') {
    return isApogee(prev, state) || (altKm >= bounds.min * 0.9 && state.vy <= 0 && state.h > 8000);
  }
  if (missionClass === 'orbital') {
    return isOrbitalInsertion(state, params, bounds);
  }
  if (missionClass === 'transfer' || missionClass === 'deep') {
    return isApogee(prev, state, 50000) && altKm >= bounds.min && altKm <= bounds.max * 1.02;
  }
  return false;
}

/** Aggregate trajectory metrics used for mission assessment. */
export function summarizeTrajectory(states, params) {
  const bounds = missionAltitudeBounds(params.missionId);
  const missionClass = getMissionClass(params.missionId);
  let apogeeState = states[0];
  let insertionState = null;
  let bestOrbitalScore = -Infinity;

  states.forEach((s) => {
    if (s.h > apogeeState.h) apogeeState = s;

    if (missionClass === 'orbital') {
      const altKm = s.h / 1000;
      const v = Math.hypot(s.vx, s.vy);
      if (!isOrbitalInsertion(s, params, bounds)) return;
      const vRef = referenceMissionVelocity('orbital', params.targetAltKm);
      const windowSpan = Math.max(bounds.max - bounds.min, 1);
      const altScore = 1 - Math.abs(altKm - params.targetAltKm) / windowSpan;
      const velScore = 1 - Math.abs(v - vRef) / vRef;
      const pathScore = 1 - Math.abs(s.vy) / Math.max(v, 1);
      const score = altScore * 0.45 + velScore * 0.45 + pathScore * 0.1;
      if (score > bestOrbitalScore) {
        bestOrbitalScore = score;
        insertionState = s;
      }
    }
  });

  const last = states[states.length - 1];
  return {
    missionClass,
    bounds,
    apogeeState,
    apogeeKm: apogeeState.h / 1000,
    insertionState,
    last,
    failed: last.failed,
    maxQ: states.reduce((m, s) => Math.max(m, s.maxQ ?? 0), 0),
  };
}

/** US Standard Atmosphere layer names + orbital regimes for the altitude slider label. */
export function altitudeRegimeLabel(altKm) {
  if (altKm >= 35786) return 'Geostationary orbit (GEO)';
  if (altKm >= 2000) return 'Medium Earth orbit (MEO)';
  if (altKm >= 160) return 'Low Earth orbit (LEO)';
  if (altKm >= 100) return 'Thermosphere — Kármán line (100 km)';
  if (altKm >= 85) return 'Thermosphere';
  if (altKm >= 50) return 'Mesosphere';
  if (altKm >= 12) return 'Stratosphere';
  return 'Troposphere';
}

/** Earth-group unit-sphere radius (1 = surface) from altitude in metres — true scale vs Earth mesh. */
export function earthLocalRadiusFromAltitudeMeters(hMeters) {
  return 1 + hMeters / R_EARTH;
}

export function paramsForSiteAndMission(siteId, missionId = 'leo_iss') {
  const base = defaultParams(siteId);
  const mission = missionById(missionId);
  const { nominal } = mission.successAltitudeKm;
  return clampParamsToMissionBounds({
    ...base,
    ...mission.paramOverrides,
    missionId: mission.id,
    targetAltKm: nominal,
    stagingEnabled: recommendedStaging(mission.id),
  }, mission.id);
}

/** Whether a realistic vehicle for this mission class typically uses staging. */
export function recommendedStaging(missionId) {
  const mission = MISSION_PROFILES.find((m) => m.id === missionId);
  if (!mission) return true;
  // Suborbital hops (e.g. New Shepard) often fly single-stage; orbit-class missions need staging.
  if (mission.id === 'suborbital') return false;
  return true;
}

export function stagingRationale(missionId) {
  const mission = MISSION_PROFILES.find((m) => m.id === missionId);
  if (!mission) return '';
  if (mission.id === 'suborbital') {
    return 'Suborbital missions only need enough delta-v to reach ~100 km and fall back — a single stage is typical (e.g. New Shepard).';
  }
  if (mission.successAltitudeKm.nominal >= 20000) {
    return 'MEO and GEO missions need far more delta-v than a single stage can efficiently provide; two (or more) stages are standard.';
  }
  return 'LEO and similar orbital missions discard the heavy first stage after the atmosphere and boost with an upper stage — two stages are the norm.';
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DEFAULT_MONTHLY_WEATHER = { speed: 5, dir: 90 };

export const WEATHER_DATA = Object.entries(WEATHER.countries).flatMap(([country, rows]) =>
  rows.map((row) => ({ country, month: row.month, speed: row.speed, dir: row.dir })),
);

export function getWeather(country, month) {
  const rows = WEATHER.countries[country];
  if (!rows) return { ...DEFAULT_MONTHLY_WEATHER };
  const row = rows.find((r) => r.month === month);
  if (!row) return { ...DEFAULT_MONTHLY_WEATHER };
  return { speed: row.speed, dir: row.dir };
}

function resolveSiteCountry(params) {
  if (params.siteCountry) return params.siteCountry;
  const site = LAUNCH_SITES.find((s) => s.id === params.siteId);
  return site?.country ?? 'United States';
}

export function getAtmosphere(h) {
  const layers = [
    { hBase: 0, tBase: 288.15, pBase: 101325, lapse: -0.0065 },
    { hBase: 11000, tBase: 216.65, pBase: 22632.1, lapse: 0 },
    { hBase: 20000, tBase: 216.65, pBase: 5474.89, lapse: 0.001 },
    { hBase: 32000, tBase: 228.65, pBase: 868.02, lapse: 0.0028 },
    { hBase: 47000, tBase: 270.65, pBase: 110.91, lapse: 0 },
    { hBase: 51000, tBase: 270.65, pBase: 66.939, lapse: -0.0028 },
    { hBase: 71000, tBase: 214.65, pBase: 3.95642, lapse: -0.002 },
    { hBase: 86000, tBase: 186.95, pBase: 0.3734, lapse: 0 },
  ];

  if (h > 86000) {
    const T = 186.95;
    const P = 0.3734 * Math.exp(-G0 * (h - 86000) / (R_AIR * T));
    return { T, P, rho: P / (R_AIR * T) };
  }

  let layer = layers[0];
  for (let i = layers.length - 1; i >= 0; i -= 1) {
    if (h >= layers[i].hBase) {
      layer = layers[i];
      break;
    }
  }

  const dh = h - layer.hBase;
  let T;
  let P;
  if (layer.lapse === 0) {
    T = layer.tBase;
    P = layer.pBase * Math.exp((-G0 * dh) / (R_AIR * layer.tBase));
  } else {
    T = layer.tBase + layer.lapse * dh;
    P = layer.pBase * (T / layer.tBase) ** (-G0 / (layer.lapse * R_AIR));
  }
  const rho = P / (R_AIR * T);
  return { T, P, rho };
}

function windAtAltitude(h, surface) {
  const factor = Math.min(2, 1 + h / 15000);
  return { speed: surface.speed * factor, dir: surface.dir };
}

function pitchAngle(h, p) {
  if (h < p.turnStartAlt) return 0;
  if (h >= p.turnEndAlt) return p.finalPitch;
  const f = (h - p.turnStartAlt) / (p.turnEndAlt - p.turnStartAlt);
  return p.finalPitch * (3 * f * f - 2 * f * f * f);
}

function stageProps(state, p) {
  if (!p.stagingEnabled || state.stage === 1) {
    return {
      thrust: p.thrust1,
      isp: p.isp1,
      dry: p.stage1Dry,
      fuel: p.stage1Fuel,
    };
  }
  return {
    thrust: p.thrust2,
    isp: p.isp2,
    dry: p.stage2Dry,
    fuel: p.stage2Fuel,
  };
}

function createState(p, wind) {
  return {
    t: 0,
    s: 0,
    h: p.siteElevation,
    vx: 0,
    vy: 0,
    mass: p.stage1Dry + p.stage1Fuel + (p.stagingEnabled ? p.stage2Dry + p.stage2Fuel : 0),
    stage: 1,
    fuel1: p.stage1Fuel,
    fuel2: p.stage2Fuel,
    pitch: 0,
    q: 0,
    mach: 0,
    ax: 0,
    ay: 0,
    wind,
    maxQ: 0,
    failed: null,
  };
}

function derivatives(state, p) {
  const atm = getAtmosphere(Math.max(0, state.h));
  const g = G0 * (R_EARTH / (R_EARTH + state.h)) ** 2;
  const gamma = pitchAngle(state.h, p);
  const st = stageProps(state, p);

  let thrust = 0;
  let mdot = 0;
  const fuel = state.stage === 1 ? state.fuel1 : state.fuel2;
  if (fuel > 0) {
    thrust = st.thrust;
    mdot = thrust / (st.isp * G0);
  }

  const wind = windAtAltitude(state.h, state.wind);
  const windRad = (wind.dir * Math.PI) / 180;
  const windVx = wind.speed * Math.sin(windRad);
  const windVy = 0;

  const vRelX = state.vx - windVx;
  const vRelY = state.vy - windVy;
  const vRel = Math.hypot(vRelX, vRelY);

  const q = 0.5 * atm.rho * vRel * vRel;
  const drag = q * p.cd * p.area;
  const dragX = vRel > 0.1 ? (drag * vRelX) / vRel : 0;
  const dragY = vRel > 0.1 ? (drag * vRelY) / vRel : 0;

  const thrustX = thrust * Math.sin(gamma);
  const thrustY = thrust * Math.cos(gamma);

  const ax = (thrustX - dragX) / state.mass;
  const ay = (thrustY - dragY) / state.mass - g;

  const aSound = Math.sqrt(GAMMA_AIR * R_AIR * atm.T);

  return {
    ds: state.vx,
    dh: state.vy,
    dvx: ax,
    dvy: ay,
    dm: -mdot,
    pitch: gamma,
    q,
    mach: vRel / aSound,
    ax,
    ay,
  };
}

function rk4Step(state, p, dt) {
  const k1 = derivatives(state, p);
  const s2 = {
    ...state,
    s: state.s + k1.ds * dt * 0.5,
    h: state.h + k1.dh * dt * 0.5,
    vx: state.vx + k1.dvx * dt * 0.5,
    vy: state.vy + k1.dvy * dt * 0.5,
    mass: Math.max(state.mass + k1.dm * dt * 0.5, 1),
  };
  const k2 = derivatives(s2, p);
  const s3 = {
    ...state,
    s: state.s + k2.ds * dt * 0.5,
    h: state.h + k2.dh * dt * 0.5,
    vx: state.vx + k2.dvx * dt * 0.5,
    vy: state.vy + k2.dvy * dt * 0.5,
    mass: Math.max(state.mass + k2.dm * dt * 0.5, 1),
  };
  const k3 = derivatives(s3, p);
  const s4 = {
    ...state,
    s: state.s + k3.ds * dt,
    h: state.h + k3.dh * dt,
    vx: state.vx + k3.dvx * dt,
    vy: state.vy + k3.dvy * dt,
    mass: Math.max(state.mass + k3.dm * dt, 1),
  };
  const k4 = derivatives(s4, p);

  const next = {
    ...state,
    t: state.t + dt,
    s: state.s + (dt / 6) * (k1.ds + 2 * k2.ds + 2 * k3.ds + k4.ds),
    h: state.h + (dt / 6) * (k1.dh + 2 * k2.dh + 2 * k3.dh + k4.dh),
    vx: state.vx + (dt / 6) * (k1.dvx + 2 * k2.dvx + 2 * k3.dvx + k4.dvx),
    vy: state.vy + (dt / 6) * (k1.dvy + 2 * k2.dvy + 2 * k3.dvy + k4.dvy),
    mass: Math.max(state.mass + (dt / 6) * (k1.dm + 2 * k2.dm + 2 * k3.dm + k4.dm), 1),
    pitch: k4.pitch,
    q: k4.q,
    mach: k4.mach,
    ax: k4.ax,
    ay: k4.ay,
  };

  const st = stageProps(next, p);
  if (next.stage === 1 && next.fuel1 <= 0 && p.stagingEnabled && next.fuel2 > 0) {
    next.stage = 2;
    next.mass = p.stage2Dry + next.fuel2;
  }

  const fuelKey = next.stage === 1 ? 'fuel1' : 'fuel2';
  const burned = st.thrust > 0 ? (st.thrust / (st.isp * G0)) * dt : 0;
  next[fuelKey] = Math.max(0, next[fuelKey] - burned);

  if (next.stage === 1) {
    next.mass = p.stage1Dry + next.fuel1 + (p.stagingEnabled ? p.stage2Dry + next.fuel2 : 0);
  } else {
    next.mass = p.stage2Dry + next.fuel2;
  }

  next.maxQ = Math.max(state.maxQ, next.q);
  return next;
}

export function defaultParams(siteId = LAUNCH_SITES[0].id) {
  const site = LAUNCH_SITES.find((s) => s.id === siteId) || LAUNCH_SITES[0];
  return {
    siteId: site.id,
    siteCountry: site.country,
    siteLat: site.lat,
    siteLon: site.lon,
    siteElevation: site.elevation,
    month: 6,
    azimuth: 90,
    stagingEnabled: true,
    stage1Dry: 25000,
    stage1Fuel: 400000,
    stage2Dry: 5000,
    stage2Fuel: 100000,
    thrust1: 7600000,
    thrust2: 980000,
    isp1: 282,
    isp2: 348,
    area: 12,
    cd: 0.5,
    turnStartAlt: 800,
    turnEndAlt: 45000,
    finalPitch: 0.42,
    missionId: 'leo_iss',
    targetAltKm: 408,
    maxSimTime: 1200,
    dt: 0.05,
  };
}

export function simulateTrajectory(params, windOverride = null) {
  const wind = windOverride || getWeather(resolveSiteCountry(params), params.month);
  const maxQLimit = missionMaxQ(params.missionId);
  const states = [];
  let state = createState(params, wind);
  states.push({ ...state });

  const maxSteps = Math.ceil(params.maxSimTime / params.dt);
  for (let i = 0; i < maxSteps; i += 1) {
    if (state.failed) break;
    if (state.q > maxQLimit && !state.failed) {
      state.failed = 'max_q';
      states.push({ ...state });
      break;
    }
    if (state.h < params.siteElevation - 500) {
      state.failed = 'crash';
      states.push({ ...state });
      break;
    }

    const prev = state;
    state = rk4Step(state, params, params.dt);
    states.push({ ...state });

    if (isMissionComplete(prev, state, states, params)) {
      break;
    }

    const v = Math.hypot(state.vx, state.vy);
    if (state.fuel1 <= 0 && state.fuel2 <= 0 && v < 1000) {
      state.failed = 'insufficient_dv';
      break;
    }
  }
  return states;
}

export function circularOrbitVelocity(altKm) {
  return Math.sqrt(MU / (R_EARTH + altKm * 1000));
}

export function evaluateMission(params, states) {
  const summary = summarizeTrajectory(states, params);
  const { bounds, missionClass, apogeeState, insertionState, last, maxQ } = summary;
  const targetAltKm = params.targetAltKm;
  const vCirc = circularOrbitVelocity(targetAltKm);
  const vRef = referenceMissionVelocity(missionClass, targetAltKm);
  const windowSpan = Math.max(bounds.max - bounds.min, 1);

  if (last.failed === 'max_q') {
    return {
      success: 5,
      rating: 'Structural risk — dynamic pressure exceeded safe limits',
      failed: last.failed,
      maxQ,
      altitudeBounds: bounds,
    };
  }
  if (last.failed === 'crash') {
    return {
      success: 0,
      rating: 'Trajectory failure — vehicle lost (check thrust vs liftoff mass)',
      failed: last.failed,
      maxQ,
      altitudeBounds: bounds,
    };
  }

  let assessState = last;
  let actualAltKm = last.h / 1000;

  if (missionClass === 'suborbital' || missionClass === 'transfer' || missionClass === 'deep') {
    assessState = apogeeState;
    actualAltKm = summary.apogeeKm;
  } else if (insertionState) {
    assessState = insertionState;
    actualAltKm = insertionState.h / 1000;
  } else {
    assessState = apogeeState;
    actualAltKm = summary.apogeeKm;
  }

  const v = Math.hypot(assessState.vx, assessState.vy);

  if (last.failed === 'insufficient_dv') {
    const progress = Math.max(0, Math.min(1, actualAltKm / Math.max(bounds.nominal, 1)));
    return {
      success: Math.round(8 + progress * 35),
      rating: progress >= 0.75
        ? 'Near target — ran out of delta-v close to mission altitude'
        : 'Insufficient delta-v before reaching mission altitude',
      failed: last.failed,
      maxQ,
      finalAltKm: actualAltKm,
      altitudeBounds: bounds,
    };
  }

  if (actualAltKm < bounds.min) {
    const progress = Math.max(0, actualAltKm / Math.max(bounds.min, 1));
    const pct = Math.round(progress * 100);
    const lowRating = missionClass === 'suborbital'
      ? `Apogee too low — below ${bounds.min.toLocaleString()} km mission minimum`
      : missionClass === 'deep' || missionClass === 'transfer'
        ? `Apogee too low — reached ${actualAltKm.toFixed(0)} km (${pct}% of ${bounds.min.toLocaleString()} km minimum; add stage-2 fuel or extend the gravity turn)`
        : `Orbit too low — below ${bounds.min.toLocaleString()} km mission minimum`;
    return {
      success: Math.round(12 + progress * 48),
      rating: lowRating,
      failed: 'altitude_too_low',
      maxQ,
      finalAltKm: actualAltKm,
      altitudeBounds: bounds,
    };
  }
  if (actualAltKm > bounds.max) {
    return {
      success: Math.max(12, Math.round(55 - 30 * (actualAltKm - bounds.max) / windowSpan)),
      rating: `Altitude overshoot — above ${bounds.max.toLocaleString()} km mission maximum`,
      failed: 'altitude_overshoot',
      maxQ,
      finalAltKm: actualAltKm,
      altitudeBounds: bounds,
    };
  }

  const altScore = Math.max(0, 1 - Math.abs(actualAltKm - targetAltKm) / windowSpan);
  let velScore = 0;
  let pathScore = 1;

  if (missionClass === 'suborbital') {
    velScore = Math.max(0, 1 - Math.abs(v - vRef) / vRef);
    pathScore = assessState.vy <= 0 ? 1 : 0.65;
  } else if (missionClass === 'transfer') {
    velScore = Math.max(0, 1 - Math.abs(v - vRef) / vRef);
    pathScore = Math.abs(assessState.vy) / Math.max(v, 1) < 0.35 ? 1 : 0.75;
  } else if (missionClass === 'deep') {
    const progress = actualAltKm / Math.max(bounds.nominal, 1);
    velScore = Math.max(0, Math.min(1, progress * 1.05));
    pathScore = Math.abs(assessState.vy) / Math.max(v, 1) < 0.4 ? 1 : 0.75;
  } else {
    velScore = Math.max(0, 1 - Math.abs(v - vRef) / vRef);
    pathScore = v > 0 ? Math.max(0, 1 - Math.abs(assessState.vy) / v) : 0.5;
    if (!insertionState) {
      velScore *= 0.82;
      pathScore *= 0.85;
    }
  }

  let success = Math.round(100 * (0.5 * altScore + 0.4 * velScore + 0.1 * pathScore));
  let rating = 'Low chance — adjust vehicle or launch conditions';

  const overshootNominal = actualAltKm > bounds.nominal + windowSpan * 0.12;
  const undershootTarget = actualAltKm < targetAltKm - windowSpan * 0.08;

  if (success >= 80) {
    rating = missionClass === 'suborbital'
      ? 'High chance of reaching target apogee'
      : missionClass === 'transfer'
        ? 'High chance of reaching transfer apogee'
        : 'High chance of reaching target orbit';
  } else if (success >= MISSION_SUCCESS_THRESHOLD) {
    rating = 'Moderate chance — tune thrust, fuel, or gravity turn';
  }

  if (overshootNominal && success >= MISSION_SUCCESS_THRESHOLD) {
    rating += ' — extra altitude consumed propellant margin';
    success = Math.max(MISSION_SUCCESS_THRESHOLD, success - Math.round(8 * (actualAltKm - bounds.nominal) / windowSpan));
  } else if (undershootTarget && success >= MISSION_SUCCESS_THRESHOLD) {
    rating += ' — below chosen target altitude';
  }

  return {
    success,
    rating,
    failed: last.failed,
    maxQ,
    finalV: v,
    vCirc,
    finalAltKm: actualAltKm,
    altitudeBounds: bounds,
    fuelMarginNote: overshootNominal ? 'overshoot' : null,
    insertionAchieved: Boolean(insertionState),
  };
}

export function monteCarloSuccess(params, runs = 5) {
  const base = getWeather(resolveSiteCountry(params), params.month);
  let successes = 0;
  for (let i = 0; i < runs; i += 1) {
    const perturb = {
      speed: base.speed * (0.8 + Math.random() * 0.4),
      dir: base.dir + (Math.random() - 0.5) * 30,
    };
    const states = simulateTrajectory(params, perturb);
    if (evaluateMission(params, states).success >= MISSION_SUCCESS_THRESHOLD) {
      successes += 1;
    }
  }
  return Math.round((100 * successes) / runs);
}

// Planetary mosaic UV frame — geographic WGS84 must be mapped before globe placement.
export const DEBUG_MESH_LAT_STEPS = 50;
export const DEBUG_MESH_LON_STEPS = 64;

function wrapLongitudeDeg(lon) {
  let wrapped = lon;
  while (wrapped > 180) wrapped -= 360;
  while (wrapped < -180) wrapped += 360;
  return wrapped;
}

function longitudeDeltaDeg(to, from) {
  return wrapLongitudeDeg(to - from);
}

/** Mosaic texture lat/lon for a numbered debug-mesh anchor (fixed city placement). */
export function meshPointIdToTextureLatLon(meshPointId) {
  const latStep = 180 / DEBUG_MESH_LAT_STEPS;
  const lonStep = 360 / DEBUG_MESH_LON_STEPS;
  const latIndex = Math.floor(meshPointId / DEBUG_MESH_LON_STEPS);
  const lonIndex = meshPointId % DEBUG_MESH_LON_STEPS;
  return {
    lat: -90 + latStep / 2 + latIndex * latStep,
    lon: -180 + lonStep / 2 + lonIndex * lonStep,
  };
}

// City calibration anchors — WGS84 coords (Google Maps) paired with fixed mesh points.
// More cities can be appended; each entry extends the Delaunay calibration network.
export const CITY_CALIBRATION_ANCHORS = [
  { name: 'Sydney', country: 'Australia', geoLat: -33.8688, geoLon: 151.2093, meshPoint: 986 },
  { name: 'Melbourne', country: 'Australia', geoLat: -37.8136, geoLon: 144.9631, meshPoint: 921 },
  { name: 'Adelaide', country: 'Australia', geoLat: -34.9285, geoLon: 138.6007, meshPoint: 984 },
  { name: 'Perth', country: 'Australia', geoLat: -31.9505, geoLon: 115.8605, meshPoint: 1044 },
  { name: 'Darwin', country: 'Australia', geoLat: -12.4634, geoLon: 130.8418, meshPoint: 1367 },
  { name: 'Honolulu', country: 'Hawaii', geoLat: 21.3069, geoLon: -157.8583, meshPoint: 1956 },

  { name: 'Fiji', country: 'Fiji', geoLat: -18.1416, geoLon: 178.4419, meshPoint: 1311 },
  { name: 'Bandar Seri Begawan', country: 'Brunei', geoLat: 4.9031, geoLon: 114.9398, meshPoint: 1684 },
  { name: 'Hamamatsu', country: 'Japan', geoLat: 34.7108, geoLon: 137.7261, meshPoint: 2200 },
  { name: 'Haikou', country: 'China', geoLat: 20.044, geoLon: 110.199, meshPoint: 1939 },
  { name: 'Wenzhou', country: 'China', geoLat: 28.0006, geoLon: 120.6994, meshPoint: 2069 },
  { name: 'Hiroshima', country: 'Japan', geoLat: 34.3853, geoLon: 132.4553, meshPoint: 2199 },
  { name: 'Niigata', country: 'Japan', geoLat: 37.9161, geoLon: 139.0364, meshPoint: 2264 },
  { name: 'Seoul', country: 'South Korea', geoLat: 37.5665, geoLon: 126.978, meshPoint: 2262 },
  { name: 'Chongqing', country: 'China', geoLat: 29.563, geoLon: 106.5516, meshPoint: 2130 },
  { name: 'Palembang', country: 'Indonesia', geoLat: -2.9761, geoLon: 104.7754, meshPoint: 1554 },
  { name: 'Lhokseumawe', country: 'Indonesia', geoLat: 5.1801, geoLon: 97.1508, meshPoint: 1681 },
  { name: 'Mawlamyine', country: 'Myanmar', geoLat: 16.4914, geoLon: 97.6281, meshPoint: 1873 },
  { name: 'Rajkot', country: 'India', geoLat: 22.3039, geoLon: 70.8022, meshPoint: 1996 },
  { name: 'Phnom Penh', country: 'Cambodia', geoLat: 11.5564, geoLon: 104.9282, meshPoint: 1810 },
  { name: 'Chattogram', country: 'Bangladesh', geoLat: 22.3569, geoLon: 91.7832, meshPoint: 2000 },
  { name: 'Ulaanbaatar', country: 'Mongolia', geoLat: 47.8864, geoLon: 106.9057, meshPoint: 2451 },
  { name: 'Ashgabat', country: 'Turkmenistan', geoLat: 37.9601, geoLon: 58.3261, meshPoint: 2250 },
  { name: 'Atyrau', country: 'Kazakhstan', geoLat: 47.1067, geoLon: 51.9167, meshPoint: 2441 },
  { name: 'Kathmandu', country: 'Nepal', geoLat: 27.7172, geoLon: 85.324, meshPoint: 2063 },
  { name: 'Kozhikode', country: 'India', geoLat: 11.2588, geoLon: 75.7804, meshPoint: 1805 },
  { name: 'Indore', country: 'India', geoLat: 22.7196, geoLon: 75.8577, meshPoint: 1997 },
  { name: 'New Delhi', country: 'India', geoLat: 28.6139, geoLon: 77.209, meshPoint: 2061 },
  { name: 'Basrah', country: 'Iraq', geoLat: 30.5085, geoLon: 47.7804, meshPoint: 2120 },
  { name: 'Muscat', country: 'Oman', geoLat: 23.588, geoLon: 58.3829, meshPoint: 1994 },
  { name: 'Abha', country: 'Saudi Arabia', geoLat: 18.2164, geoLon: 42.5053, meshPoint: 1927 },
  { name: 'Beirut', country: 'Lebanon', geoLat: 33.8938, geoLon: 35.5018, meshPoint: 2182 },
  { name: 'Batumi', country: 'Georgia', geoLat: 41.6168, geoLon: 41.6367, meshPoint: 2311 },
  { name: 'Odesa', country: 'Ukraine', geoLat: 46.4825, geoLon: 30.7233, meshPoint: 2373 },
  { name: 'Palermo', country: 'Italy', geoLat: 38.1157, geoLon: 13.3615, meshPoint: 2242 },
  { name: 'Lisbon', country: 'Portugal', geoLat: 38.7223, geoLon: -9.1393, meshPoint: 2302 },
  { name: 'Brest', country: 'France', geoLat: 48.3904, geoLon: -4.4861, meshPoint: 2495 },
  { name: 'Ipswich', country: 'United Kingdom', geoLat: 52.0567, geoLon: 1.1482, meshPoint: 2492 },
  { name: 'Glasgow', country: 'United Kingdom', geoLat: 55.8642, geoLon: -4.2518, meshPoint: 2623 },
  { name: 'Madrid', country: 'Spain', geoLat: 40.4168, geoLon: -3.7038, meshPoint: 2367 },
  { name: 'Rome', country: 'Italy', geoLat: 41.9028, geoLon: 12.4964, meshPoint: 2306 },
  { name: 'Paris', country: 'Italy', geoLat: 48.8566, geoLon: 2.3522, meshPoint: 2432 },
  { name: 'Milan', country: 'France', geoLat: 45.4642, geoLon: 9.19, meshPoint: 2369 },
  { name: 'Prague', country: 'Czechia', geoLat: 50.0755, geoLon: 14.4378, meshPoint: 2434 },
  { name: 'Thyboron', country: 'Denmark', geoLat: 56.6967, geoLon: 8.2108, meshPoint: 2561 },
  { name: 'Copenhagen', country: 'Denmark', geoLat: 55.6761, geoLon: 12.5683, meshPoint: 2562 },
  { name: 'Glomfjord', country: 'Norway', geoLat: 66.8167, geoLon: 13.95, meshPoint: 2754 },
  { name: 'Kiberg', country: 'Norway', geoLat: 70.345, geoLon: 31.075, meshPoint: 2821 },
  { name: 'Moscow', country: 'Russia', geoLat: 55.7558, geoLon: 37.6173, meshPoint: 2566 },
  { name: 'Vaygach', country: 'Russia', geoLat: 70.0, geoLon: 59.0, meshPoint: 2826 },
  { name: 'Oma', country: 'Russia', geoLat: 66.5, geoLon: 52.5, meshPoint: 2760 },
  { name: 'Kazan', country: 'Russia', geoLat: 55.8304, geoLon: 49.0661, meshPoint: 2568 },
  { name: 'Syndassko', country: 'Russia', geoLat: 67.4, geoLon: 130.3, meshPoint: 2899 },
  { name: 'Khayyr', country: 'Russia', geoLat: 54.6, geoLon: 110.3, meshPoint: 2839 },
  { name: 'Kichera', country: 'Russia', geoLat: 55.9167, geoLon: 109.9167, meshPoint: 2579 },
  { name: 'Kliuchi', country: 'Russia', geoLat: 52.25, geoLon: 158.4167, meshPoint: 2588 },
  { name: 'Lesnaya', country: 'Russia', geoLat: 58.2833, geoLon: 58.45, meshPoint: 2652 },
  { name: 'Alkatvaam', country: 'Russia', geoLat: 64.7833, geoLon: -174.7333, meshPoint: 2719 },
  { name: 'Bratsk', country: 'Russia', geoLat: 56.1514, geoLon: 101.6342, meshPoint: 2578 },
  { name: 'Selfoss', country: 'Iceland', geoLat: 63.9331, geoLon: -20.9972, meshPoint: 2748 },
  { name: 'Kulusuk', country: 'Greenland', geoLat: 65.5667, geoLon: -37.1833, meshPoint: 2876 },
  { name: 'Nugssuaq', country: 'Greenland', geoLat: 71.5, geoLon: -53.0, meshPoint: 2870 },
  { name: 'Barentsburg', country: 'Svalbard', geoLat: 78.0667, geoLon: 14.2167, meshPoint: 2946 },
  { name: 'Vangaindrano', country: 'Madagascar', geoLat: -23.35, geoLon: 47.6, meshPoint: 1160 },
  { name: 'Ambohimanatrika', country: 'Madagascar', geoLat: -19.85, geoLon: 47.05, meshPoint: 1224 },
  { name: 'Cape Town', country: 'South Africa', geoLat: -33.9249, geoLon: 18.4241, meshPoint: 963 },
  { name: 'Torra Bay', country: 'Namibia', geoLat: -19.8833, geoLon: 13.0833, meshPoint: 1218 },
  { name: 'Benguela', country: 'Angola', geoLat: -12.5763, geoLon: 13.4055, meshPoint: 1346 },
  { name: 'Luanda', country: 'Angola', geoLat: -8.8399, geoLon: 13.2894, meshPoint: 1410 },
  { name: 'Port-Gentil', country: 'Gabon', geoLat: -0.7167, geoLon: 8.7833, meshPoint: 1537 },
  { name: 'Monrovia', country: 'Liberia', geoLat: 6.3156, geoLon: -10.8074, meshPoint: 1726 },
  { name: 'Touba', country: 'Senegal', geoLat: 14.8667, geoLon: -15.8833, meshPoint: 1917 },
  { name: 'Kerewan', country: 'The Gambia', geoLat: 13.4833, geoLon: -16.0333, meshPoint: 1853 },
  { name: 'Awsard', country: 'Western Sahara', geoLat: 26.1167, geoLon: -11.7, meshPoint: 2045 },
  { name: 'Agadir', country: 'Morocco', geoLat: 30.4278, geoLon: -9.5981, meshPoint: 2174 },
  { name: 'Midar', country: 'Morocco', geoLat: 34.94, geoLon: -3.58, meshPoint: 2239 },
  { name: 'Tiaret', country: 'Algeria', geoLat: 35.3711, geoLon: 1.317, meshPoint: 2176 },
  { name: 'Negrine', country: 'Algeria', geoLat: 35.517, geoLon: 8.483, meshPoint: 2177 },
  { name: 'Qaryat', country: 'Libya', geoLat: 30.0, geoLon: 18.0, meshPoint: 2114 },
  { name: 'Marsa al Brega', country: 'Libya', geoLat: 30.4167, geoLon: 19.5667, meshPoint: 2115 },
  { name: 'Cairo', country: 'Egypt', geoLat: 30.0444, geoLon: 31.2357, meshPoint: 2117 },
  { name: 'Asyut', country: 'Egypt', geoLat: 27.1783, geoLon: 31.1859, meshPoint: 2053 },
  { name: 'Al-Disah', country: 'Saudi Arabia', geoLat: 28.0, geoLon: 35.6, meshPoint: 2054 },
  { name: 'Gebeit', country: 'Sudan', geoLat: 21.0, geoLon: 36.6, meshPoint: 1926 },
  { name: 'Karkabet', country: 'Eritrea', geoLat: 15.0, geoLon: 38.0, meshPoint: 1862 },
  { name: 'Rehayto', country: 'Eritrea', geoLat: 14.0, geoLon: 39.0, meshPoint: 1799 },
  { name: 'Jirdan', country: 'Yemen', geoLat: 15.0, geoLon: 45.0, meshPoint: 1863 },
  { name: 'Hisn al Abr', country: 'Yemen', geoLat: 14.5, geoLon: 45.0, meshPoint: 1864 },
  { name: 'Abu Dhabi', country: 'Abu Dhabi', geoLat: 24.4539, geoLon: 54.3773, meshPoint: 1993 },
  { name: 'Thabhloten', country: 'Saudi Arabia', geoLat: 17.5, geoLon: 43.5, meshPoint: 1929 },
  { name: 'Al Niqirah', country: 'Saudi Arabia', geoLat: 17.0, geoLon: 47.0, meshPoint: 2056 },
  { name: 'Arar', country: 'Saudi Arabia', geoLat: 30.9753, geoLon: 41.0381, meshPoint: 2119 },
  { name: 'Hail', country: 'Saudi Arabia', geoLat: 27.5114, geoLon: 41.7208, meshPoint: 2055 },
  { name: 'Rayda', country: 'Saudi Arabia', geoLat: 18.43, geoLon: 43.2, meshPoint: 1928 },
  { name: 'McMurdo Station', country: 'Antarctica', geoLat: -77.8463, geoLon: 166.6682, meshPoint: 221 },
  { name: 'Casey Station', country: 'Antarctica', geoLat: -66.2825, geoLon: 110.5266, meshPoint: 403 },
  { name: 'Dumont d\'Urville Station', country: 'Antarctica', geoLat: -66.6628, geoLon: 140.0011, meshPoint: 408 },
  { name: 'Concordia Station', country: 'Antarctica', geoLat: -75.0998, geoLon: 123.3322, meshPoint: 277 },
  { name: 'Belgrano II Base', country: 'Antarctica', geoLat: -77.8737, geoLon: -34.6276, meshPoint: 250 },
  { name: 'Davis Station', country: 'Antarctica', geoLat: -68.5767, geoLon: 77.9675, meshPoint: 333 },
  { name: 'Alice Springs', country: 'Australia', geoLat: -23.6984, geoLon: 133.8813, meshPoint: 1175 },
  { name: 'Lyndon', country: 'Australia', geoLat: -23.295, geoLon: 114.2131, meshPoint: 1172 },
  { name: 'Eighty Mile Beach', country: 'Australia', geoLat: -19.5133, geoLon: 121.134, meshPoint: 1237 },
  { name: 'Gibb', country: 'Australia', geoLat: -16.2101, geoLon: 126.3822, meshPoint: 1302 },
  { name: 'Pellew Islands', country: 'Australia', geoLat: -15.6792, geoLon: 136.8165, meshPoint: 1304 },
  { name: 'Woolgar', country: 'Australia', geoLat: -19.9935, geoLon: 143.4833, meshPoint: 1241 },
  { name: 'Gamboola', country: 'Australia', geoLat: -16.4247, geoLon: 143.491, meshPoint: 1305 },
  { name: 'Rockhampton City', country: 'Australia', geoLat: -23.3792, geoLon: 150.5103, meshPoint: 1178 },
  { name: 'Meandarra', country: 'Australia', geoLat: -27.3107, geoLon: 149.8621, meshPoint: 1114 },
  { name: 'Boggabri', country: 'Australia', geoLat: -30.7045, geoLon: 150.0444, meshPoint: 1050 },
  { name: 'Nullarbor', country: 'Australia', geoLat: -31.35, geoLon: 128.9, meshPoint: 1047 },
  { name: 'Zanthus', country: 'Australia', geoLat: -30.733, geoLon: 123.9924, meshPoint: 1046 },
  { name: 'Albany', country: 'Australia', geoLat: -35.0248, geoLon: 117.8836, meshPoint: 980 },
  { name: 'Lake Mackay', country: 'Australia', geoLat: -22.3318, geoLon: 128.7183, meshPoint: 1174 },
  { name: 'French Southern and Antarctic Lands', country: 'French Southern and Antarctic Lands', geoLat: -49.3498, geoLon: 70.22, meshPoint: 716 },
  { name: 'Oamaru', country: 'New Zealand', geoLat: -45.1, geoLon: 170.9698, meshPoint: 798 },
  { name: 'Granity', country: 'New Zealand', geoLat: -41.6302, geoLon: 171.855, meshPoint: 862 },
  { name: 'Waiotahe', country: 'New Zealand', geoLat: -37.9936, geoLon: 177.2461, meshPoint: 927 },
  { name: 'Cape Reinga', country: 'New Zealand', geoLat: -34.4266, geoLon: 172.6775, meshPoint: 990 },
  { name: 'Bicheno', country: 'Australia', geoLat: -41.8749, geoLon: 148.3038, meshPoint: 858 },
  { name: 'Ouvea', country: 'New Caledonia', geoLat: -20.4084, geoLon: 166.5364, meshPoint: 1245 },
  { name: 'Honiara', country: 'Solomon Islands', geoLat: -9.4311, geoLon: 159.9553, meshPoint: 1436 },
  { name: 'Suhin', country: 'Papua New Guinea', geoLat: -5.2378, geoLon: 154.7062, meshPoint: 1499 },
  { name: 'Kandoka', country: 'Papua New Guinea', geoLat: -5.5033, geoLon: 149.84, meshPoint: 1498 },
  { name: 'Umbukul', country: 'Papua New Guinea', geoLat: -2.5075, geoLon: 149.989, meshPoint: 1562 },
  { name: 'Popondetta', country: 'Papua New Guinea', geoLat: -8.7667, geoLon: 148.2375, meshPoint: 1434 },
  { name: 'Timika', country: 'Indonesia', geoLat: -4.5481, geoLon: 136.8899, meshPoint: 1496 },
  { name: 'Beaco', country: 'Timor-Leste', geoLat: -8.945, geoLon: 126.4484, meshPoint: 1430 },
  { name: 'Ende', country: 'Indonesia', geoLat: -8.6729, geoLon: 121.6929, meshPoint: 1429 },
  { name: 'Denpasar', country: 'Indonesia', geoLat: -8.6653, geoLon: 115.2176, meshPoint: 1428 },
  { name: 'Kota Agung', country: 'Indonesia', geoLat: -5.4912, geoLon: 104.6599, meshPoint: 1490 },
  { name: 'Sibolga', country: 'Indonesia', geoLat: 1.737, geoLon: 98.7846, meshPoint: 1617 },
  { name: 'Sabagalet', country: 'Indonesia', geoLat: -1.6, geoLon: 99.0833, meshPoint: 1553 },
  { name: 'Tanjung Sedeli', country: 'Malaysia', geoLat: 1.9283, geoLon: 104.1113, meshPoint: 1618 },
  { name: 'Macumba', country: 'Australia', geoLat: -27.2241, geoLon: 136.0901, meshPoint: 1112 },
  { name: 'Iron Range', country: 'Australia', geoLat: -12.683, geoLon: 143.3298, meshPoint: 1369 },
  { name: 'Daru', country: 'Papua New Guinea', geoLat: -9.0699, geoLon: 143.21, meshPoint: 1433 },
  { name: 'Tari', country: 'Papua New Guinea', geoLat: -5.8452, geoLon: 142.9466, meshPoint: 1497 },
  { name: 'Teba', country: 'Indonesia', geoLat: -5.5057, geoLon: 104.6616, meshPoint: 1560 },
  { name: 'Kasim', country: 'Indonesia', geoLat: -1.3036, geoLon: 131.0223, meshPoint: 1559 },
  { name: 'Capalulu', country: 'Indonesia', geoLat: -1.9101, geoLon: 125.875, meshPoint: 1558 },
  { name: 'Bukaan', country: 'Indonesia', geoLat: 1.2326, geoLon: 121.2739, meshPoint: 1621 },
  { name: 'Taripa', country: 'Indonesia', geoLat: -2.5268, geoLon: 120.9205, meshPoint: 1557 },
  { name: 'Pesaguan', country: 'Indonesia', geoLat: 0.0674, geoLon: 102.0972, meshPoint: 1555 },
  { name: 'Bukit Sawit', country: 'Indonesia', geoLat: -1.1372, geoLon: 114.953, meshPoint: 1556 },
  { name: 'Kuala Terengganu', country: 'Malaysia', geoLat: 5.3296, geoLon: 103.1383, meshPoint: 1682 },
  { name: 'Phuket', country: 'Thailand', geoLat: 7.9366, geoLon: 98.3529, meshPoint: 1745 },
  { name: 'Palaw', country: 'Myanmar', geoLat: 12.9746, geoLon: 98.6469, meshPoint: 1809 },
  { name: 'Duc Pho', country: 'Vietnam', geoLat: 14.8087, geoLon: 108.9572, meshPoint: 1811 },
  { name: 'Anh Son', country: 'Vietnam', geoLat: 18.9673, geoLon: 105.1052, meshPoint: 1938 },
  { name: 'Natividad', country: 'Philippines', geoLat: 16.0427, geoLon: 120.7947, meshPoint: 1877 },
  { name: 'Poblacion', country: 'Philippines', geoLat: 14.5662, geoLon: 121.0314, meshPoint: 1813 },
  { name: 'Cantilan', country: 'Philippines', geoLat: 9.3358, geoLon: 125.977, meshPoint: 1750 },
  { name: 'Tainan', country: 'Taiwan', geoLat: 22.9912, geoLon: 120.185, meshPoint: 2005 },
  { name: 'Jindo', country: 'South Korea', geoLat: 34.4868, geoLon: 126.2629, meshPoint: 2198 },
  { name: 'Naha', country: 'Japan', geoLat: 26.2122, geoLon: 127.6791, meshPoint: 2070 },
  { name: 'Erima', country: 'Japan', geoLat: 42.0163, geoLon: 143.1487, meshPoint: 2329 },
  { name: 'Hamatombetsu', country: 'Japan', geoLat: 45.1237, geoLon: 142.3596, meshPoint: 2393 },
  { name: 'Gastello', country: 'Russia', geoLat: 49.1014, geoLon: 142.9424, meshPoint: 2457 },
  { name: 'Neftegorsk', country: 'Russia', geoLat: 52.9975, geoLon: 142.9443, meshPoint: 2521 },
  { name: 'Terney', country: 'Russia', geoLat: 45.0504, geoLon: 136.6137, meshPoint: 2392 },
  { name: 'Shenzhen', country: 'China', geoLat: 22.5446, geoLon: 114.0545, meshPoint: 2004 },
  { name: 'Nizampatnam', country: 'India', geoLat: 15.9046, geoLon: 80.6668, meshPoint: 1870 },
  { name: 'Trincomalee', country: 'Sri Lanka', geoLat: 8.5764, geoLon: 81.2345, meshPoint: 1742 },
  { name: 'Paradeep', country: 'India', geoLat: 20.2797, geoLon: 86.6123, meshPoint: 1935 },
  { name: 'Harardhere', country: 'Somalia', geoLat: 4.7169, geoLon: 47.9358, meshPoint: 1672 },
  { name: 'Buhodle', country: 'Somalia', geoLat: 8.2369, geoLon: 46.3258, meshPoint: 1736 },
  { name: 'Mutukula', country: 'Tanzania', geoLat: -1.0007, geoLon: 31.4157, meshPoint: 1541 },
  { name: 'Inhambane', country: 'Mozambique', geoLat: -22.7791, geoLon: 34.5662, meshPoint: 1158 },
  { name: 'Lugela', country: 'Mozambique', geoLat: -16.3287, geoLon: 36.6991, meshPoint: 1286 },
  { name: 'Maua', country: 'Mozambique', geoLat: -13.8052, geoLon: 36.9262, meshPoint: 1350 },
  { name: 'Ifakara', country: 'Tanzania', geoLat: -8.1321, geoLon: 36.6848, meshPoint: 1414 },
  { name: 'Mpulungu', country: 'Zambia', geoLat: -8.7662, geoLon: 31.1196, meshPoint: 1413 },
  { name: 'Rutana', country: 'Burundi', geoLat: -3.8619, geoLon: 30.0677, meshPoint: 1477 },
  { name: 'Doro Gowon', country: 'Nigeria', geoLat: 13.1173, geoLon: 13.8604, meshPoint: 1794 },
  { name: 'Ikang', country: 'Nigeria', geoLat: 4.7913, geoLon: 8.5312, meshPoint: 1665 },
  { name: 'Abidjan', country: 'Côte d\'Ivoire', geoLat: 5.3204, geoLon: -4.0161, meshPoint: 1727 },
  { name: 'Bozoy', country: 'Kazakhstan', geoLat: 46.2181, geoLon: 58.8206, meshPoint: 2378 },
  { name: 'Gorgan', country: 'Iran', geoLat: 36.8377, geoLon: 54.4394, meshPoint: 2249 },
  { name: 'Miyaneh', country: 'Iran', geoLat: 37.4284, geoLon: 47.7058, meshPoint: 2248 },
  { name: 'Astrakhan', country: 'Russia', geoLat: 46.3498, geoLon: 48.0326, meshPoint: 2440 },
  { name: 'Okhotsk', country: 'Russia', geoLat: 59.362, geoLon: 143.2147, meshPoint: 2649 },
  { name: 'Yamsk', country: 'Russia', geoLat: 59.583, geoLon: 154.133, meshPoint: 2651 },
  { name: 'Razreznoy', country: 'Russia', geoLat: 56.1556, geoLon: 137.4101, meshPoint: 2584 },
  { name: 'Irkutsk', country: 'Russia', geoLat: 52.2891, geoLon: 104.2798, meshPoint: 2514 },
  { name: 'Astana', country: 'Kazakhstan', geoLat: 51.116, geoLon: 71.4677, meshPoint: 2508 },
  { name: 'Yantai', country: 'China', geoLat: 37.4619, geoLon: 121.4425, meshPoint: 2261 },
  { name: 'Shijiazhuang', country: 'China', geoLat: 38.043, geoLon: 114.5088, meshPoint: 2260 },
  { name: 'Turbat', country: 'Pakistan', geoLat: 26.0028, geoLon: 63.0506, meshPoint: 2059 },
  { name: 'Jiuquan', country: 'China', geoLat: 40.2774, geoLon: 96.456, meshPoint: 2321 },
  { name: 'Islamabad', country: 'Pakistan', geoLat: 33.6938, geoLon: 73.0652, meshPoint: 2252 },
  { name: 'Kerman', country: 'Iran', geoLat: 29.5719, geoLon: 57.301, meshPoint: 2122 },
  { name: 'Zonguldak', country: 'Türkiye', geoLat: 41.2503, geoLon: 31.839, meshPoint: 2309 },
  { name: 'Kristiansund', country: 'Norway', geoLat: 63.1118, geoLon: 7.7324, meshPoint: 2689 },
  { name: 'Salekhard', country: 'Russia', geoLat: 66.5299, geoLon: 66.6146, meshPoint: 2764 },
  { name: 'Dikson', country: 'Russia', geoLat: 73.5085, geoLon: 80.5228, meshPoint: 2894 },
  { name: 'Krasnoarmeyskiy', country: 'Russia', geoLat: 49.9692, geoLon: 42.4262, meshPoint: 2846 },
  { name: 'Garissa', country: 'Kenya', geoLat: -0.5236, geoLon: 40.3564, meshPoint: 1607 },
  { name: 'Omorate', country: 'Ethiopia', geoLat: 4.8032, geoLon: 36.0504, meshPoint: 1670 },
  { name: 'Sallum', country: 'Egypt', geoLat: 31.4573, geoLon: 25.2837, meshPoint: 2116 },
  { name: 'Dakar', country: 'Senegal', geoLat: 14.6934, geoLon: -17.4479, meshPoint: 1789 },
  { name: 'Buta', country: 'Democratic Republic of Congo', geoLat: 2.7933, geoLon: 24.7287, meshPoint: 1668 },
  { name: 'Andilana', country: 'Madagascar', geoLat: -13.2544, geoLon: 48.1888, meshPoint: 1352 },
  { name: 'Central Flacq', country: 'Mauritius', geoLat: -20.1949, geoLon: 57.723, meshPoint: 1226 },
  { name: 'Bangui', country: 'Central African Republic', geoLat: 4.3635, geoLon: 18.5836, meshPoint: 1667 },
  { name: 'Timiaouine', country: 'Algeria', geoLat: 20.434, geoLon: 1.8101, meshPoint: 1920 },
  { name: 'Bamako', country: 'Mali', geoLat: 12.6133, geoLon: -7.9847, meshPoint: 1855 },
  { name: 'Morokweng', country: 'South Africa', geoLat: -26.1237, geoLon: 23.7783, meshPoint: 1284 },
  { name: 'Cartagena', country: 'Colombia', geoLat: 10.4266, geoLon: -75.5442, meshPoint: 1778 },
  { name: 'Oranjestad', country: 'Aruba', geoLat: 12.5201, geoLon: -70.0371, meshPoint: 1843 },
  { name: 'Puerto La Cruz', country: 'Venezuela', geoLat: 10.2029, geoLon: -64.6308, meshPoint: 1780 },
  { name: 'Cayenne', country: 'French Guiana', geoLat: 4.9372, geoLon: -52.3259, meshPoint: 1718 },
  { name: 'Marambaia', country: 'Brazil', geoLat: -23.0611, geoLon: -43.9508, meshPoint: 1591 },
  { name: 'Macau', country: 'Brazil', geoLat: -5.1131, geoLon: -36.6351, meshPoint: 1529 },
  { name: 'Arapiraca', country: 'Brazil', geoLat: -9.7549, geoLon: -36.6615, meshPoint: 1465 },
  { name: 'Seabra', country: 'Brazil', geoLat: -12.4172, geoLon: -41.7721, meshPoint: 1400 },
  { name: 'Cabo Frio', country: 'Brazil', geoLat: -22.7378, geoLon: -42.0241, meshPoint: 1208 },
  { name: 'Itapeva', country: 'Brazil', geoLat: -22.7691, geoLon: -46.2219, meshPoint: 1207 },
  { name: 'Florianópolis', country: 'Brazil', geoLat: -27.5973, geoLon: -48.5496, meshPoint: 1143 },
  { name: 'Buenos Aires', country: 'Argentina', geoLat: -34.6096, geoLon: -58.3888, meshPoint: 1013 },
  { name: 'Viedma', country: 'Argentina', geoLat: -40.8084, geoLon: -62.9947, meshPoint: 949 },
  { name: 'Puerto Rawson', country: 'Argentina', geoLat: -43.3385, geoLon: -65.0579, meshPoint: 884 },
  { name: 'Punta Arenas', country: 'Chile', geoLat: -53.1626, geoLon: -70.9078, meshPoint: 691 },
  { name: 'Tres Lagos', country: 'Argentina', geoLat: -49.599, geoLon: -71.4467, meshPoint: 948 },
  { name: 'Puerto Montt', country: 'Chile', geoLat: -41.4718, geoLon: -72.9396, meshPoint: 1011 },
  { name: 'Caldera', country: 'Chile', geoLat: -27.0676, geoLon: -70.8222, meshPoint: 1139 },
  { name: 'Iquique', country: 'Chile', geoLat: -20.2141, geoLon: -70.1525, meshPoint: 1267 },
  { name: 'Puno', country: 'Peru', geoLat: -15.8406, geoLon: -70.028, meshPoint: 1331 },
  { name: 'Ica', country: 'Peru', geoLat: -14.3325, geoLon: -75.4997, meshPoint: 1394 },
  { name: 'Paita', country: 'Peru', geoLat: -5.01, geoLon: -80.9734, meshPoint: 1521 },
  { name: 'Pereira', country: 'Colombia', geoLat: 4.7855, geoLon: -75.7883, meshPoint: 1714 },
  { name: 'Brasilia', country: 'Brazil', geoLat: -15.794, geoLon: -47.8828, meshPoint: 1335 },
  { name: 'Cáceres', country: 'Brazil', geoLat: -16.0644, geoLon: -57.6879, meshPoint: 1333 },
  { name: 'Manaus', country: 'Brazil', geoLat: -3.1316, geoLon: -59.9825, meshPoint: 1589 },
  { name: 'Havana', country: 'Cuba', geoLat: 23.1353, geoLon: -82.359, meshPoint: 2033 },
  { name: 'Santiago de los Caballeros', country: 'Dominican Republic', geoLat: 19.4508, geoLon: -70.6947, meshPoint: 1971 },
  { name: 'Santiago de Cuba', country: 'Cuba', geoLat: 20.0214, geoLon: -75.8295, meshPoint: 1970 },
  { name: 'Rum Point', country: 'Cayman Islands', geoLat: 19.3728, geoLon: -81.2714, meshPoint: 1969 },
  { name: 'San José', country: 'Costa Rica', geoLat: 9.9328, geoLon: -84.0796, meshPoint: 1777 },
  { name: 'Mechapa', country: 'Nicaragua', geoLat: 12.8366, geoLon: -87.5824, meshPoint: 1840 },
  { name: 'La Ceiba', country: 'Honduras', geoLat: 15.7834, geoLon: -86.7918, meshPoint: 1904 },
  { name: 'Chetumal', country: 'Mexico', geoLat: 18.5024, geoLon: -88.2958, meshPoint: 1968 },
  { name: 'Arriaga', country: 'Mexico', geoLat: 16.255, geoLon: -93.895, meshPoint: 1903 },
  { name: 'Acapulco', country: 'Mexico', geoLat: 16.868, geoLon: -99.894, meshPoint: 1902 },
  { name: 'Mexico City', country: 'Mexico', geoLat: 19.3208, geoLon: -99.1515, meshPoint: 1966 },
  { name: 'Puerto Vallarta', country: 'Mexico', geoLat: 20.6407, geoLon: -105.2203, meshPoint: 1965 },
  { name: 'Mazatlán', country: 'Mexico', geoLat: 23.2036, geoLon: -106.4208, meshPoint: 2029 },
  { name: 'La Paz', country: 'Mexico', geoLat: 24.162, geoLon: -110.3159, meshPoint: 2028 },
  { name: 'Ensenada', country: 'Mexico', geoLat: 31.8659, geoLon: -116.603, meshPoint: 2155 },
  { name: 'Sebring', country: 'United States', geoLat: 27.4957, geoLon: -81.441, meshPoint: 2097 },
  { name: 'Jacksonville', country: 'United States', geoLat: 30.3262, geoLon: -81.6579, meshPoint: 2161 },
  { name: 'Houston', country: 'United States', geoLat: 29.7589, geoLon: -95.3677, meshPoint: 2159 },
  { name: 'Morehead City', country: 'United States', geoLat: 34.7229, geoLon: -76.726, meshPoint: 2226 },
  { name: 'Ocean City', country: 'United States', geoLat: 39.2789, geoLon: -74.5763, meshPoint: 2290 },
  { name: 'Nantucket', country: 'United States', geoLat: 41.2844, geoLon: -70.0984, meshPoint: 2355 },
  { name: 'Narrowsburg', country: 'United States', geoLat: 41.6027, geoLon: -75.0593, meshPoint: 2354 },
  { name: 'Dover-Foxcroft', country: 'United States', geoLat: 45.1835, geoLon: -69.2276, meshPoint: 2419 },
  { name: 'Halifax', country: 'United States', geoLat: 36.2494, geoLon: -77.6683, meshPoint: 2420 },
  { name: 'Vandenberg Space Force Base', country: 'United States', geoLat: 34.7088, geoLon: -120.5447, meshPoint: 2218 },
  { name: 'Palm Springs', country: 'United States', geoLat: 34.8246, geoLon: -116.5403, meshPoint: 2219 },
  { name: 'San Jose', country: 'United States', geoLat: 37.3362, geoLon: -121.8906, meshPoint: 2282 },
  { name: 'Duluth', country: 'United States', geoLat: 46.7838, geoLon: -92.1053, meshPoint: 2415 },
  { name: 'Escanaba', country: 'United States', geoLat: 45.7456, geoLon: -87.0647, meshPoint: 2416 },
  { name: 'Chicago', country: 'United States', geoLat: 41.8756, geoLon: -87.6244, meshPoint: 2352 },
  { name: 'Sudbury', country: 'United States', geoLat: 42.3834, geoLon: -71.4162, meshPoint: 2417 },
  { name: 'Oklahoma City', country: 'United States', geoLat: 35.473, geoLon: -97.5171, meshPoint: 2222 },
  { name: 'Mt Shasta', country: 'United States', geoLat: 41.4092, geoLon: -122.1949, meshPoint: 2346 },
  { name: 'Colorado', country: 'United States', geoLat: 38.7252, geoLon: -105.6077, meshPoint: 2285 },
  { name: 'Kansas City', country: 'United States', geoLat: 39.1001, geoLon: -94.5781, meshPoint: 2287 },
  { name: 'Portland', country: 'United States', geoLat: 45.5202, geoLon: -122.6742, meshPoint: 2410 },
  { name: 'Helena Valley West Central', country: 'United States', geoLat: 46.6572, geoLon: -112.064, meshPoint: 2412 },
  { name: 'Attu Station', country: 'United States', geoLat: 52.8316, geoLon: 173.1763, meshPoint: 2527 },
  { name: 'Adak', country: 'United States', geoLat: 51.8736, geoLon: -176.639, meshPoint: 2528 },
  { name: 'Akutan', country: 'United States', geoLat: 54.1345, geoLon: -165.778, meshPoint: 2530 },
  { name: 'Ninstints', country: 'Canada', geoLat: 52.1318, geoLon: -131.2074, meshPoint: 2536 },
  { name: 'Bella Coola', country: 'Canada', geoLat: 52.3723, geoLon: -126.7557, meshPoint: 2537 },
  { name: 'Grand Rapids', country: 'Canada', geoLat: 53.1748, geoLon: -99.2697, meshPoint: 2542 },
  { name: 'Akimiski Island', country: 'Canada', geoLat: 52.9398, geoLon: -81.31, meshPoint: 2545 },
  { name: 'Baie-James', country: 'Canada', geoLat: 53.1557, geoLon: -80.4846, meshPoint: 2546 },
  { name: 'Ketchikan', country: 'United States', geoLat: 55.3431, geoLon: -131.6467, meshPoint: 2600 },
  { name: 'Port Heiden', country: 'United States', geoLat: 56.9496, geoLon: -158.6269, meshPoint: 2595 },
  { name: 'Tugidak Island', country: 'United States', geoLat: 56.5019, geoLon: -154.6256, meshPoint: 2596 },
  { name: 'Sundance', country: 'Canada', geoLat: 56.592, geoLon: -94.0964, meshPoint: 2607 },
  { name: 'Fort Severn', country: 'Canada', geoLat: 56.0193, geoLon: -87.6659, meshPoint: 2608 },
  { name: 'Belcher Islands', country: 'Canada', geoLat: 56.203, geoLon: -79.3063, meshPoint: 2609 },
  { name: 'Kuujjuarapik', country: 'Canada', geoLat: 55.2821, geoLon: -77.7563, meshPoint: 2610 },
  { name: 'Fort Mackenzie', country: 'Canada', geoLat: 56.8302, geoLon: -68.9524, meshPoint: 2611 },
  { name: 'Kamishetshistatshuna', country: 'Canada', geoLat: 53.5123, geoLon: -60.1396, meshPoint: 2612 },
  { name: 'Hopedale', country: 'Canada', geoLat: 55.4604, geoLon: -60.2214, meshPoint: 2613 },
  { name: 'Katmai National Park and Preserve', country: 'United States', geoLat: 58.7505, geoLon: -156.5218, meshPoint: 2660 },
  { name: 'Seward', country: 'United States', geoLat: 60.1014, geoLon: -149.4404, meshPoint: 2661 },
  { name: 'Mekoryuk', country: 'United States', geoLat: 60.3743, geoLon: -166.2637, meshPoint: 2658 },
  { name: 'Nanortalik', country: 'Greenland', geoLat: 60.14, geoLon: -45.2429, meshPoint: 2680 },
  { name: 'Nunalik', country: 'Canada', geoLat: 60.6422, geoLon: -69.9575, meshPoint: 2675 },
  { name: 'Killiniq', country: 'Canada', geoLat: 60.388, geoLon: -64.648, meshPoint: 2676 },
  { name: 'Corner Brook', country: 'Canada', geoLat: 48.9532, geoLon: -57.9474, meshPoint: 2485 },
  { name: 'Vancouver', country: 'Canada', geoLat: 49.2609, geoLon: -123.114, meshPoint: 2474 },
  { name: 'Gambell', country: 'United States', geoLat: 63.778, geoLon: -171.7279, meshPoint: 2721 },
  { name: 'Baker Lake', country: 'Canada', geoLat: 64.3189, geoLon: -96.0214, meshPoint: 2735 },
  { name: 'Fullerton', country: 'Canada', geoLat: 63.3399, geoLon: -90.7101, meshPoint: 2736 },
  { name: 'Qaqsauqtuuq Migratory Bird Sanctuary', country: 'Canada', geoLat: 63.9518, geoLon: -82.0323, meshPoint: 2737 },
  { name: 'Kinngait', country: 'Canada', geoLat: 64.2323, geoLon: -76.5432, meshPoint: 2738 },
  { name: 'Iqaluit', country: 'Canada', geoLat: 63.7493, geoLon: -68.5214, meshPoint: 2739 },
  { name: 'Gjoa Haven', country: 'Canada', geoLat: 68.6425, geoLon: -95.8783, meshPoint: 2797 },
  { name: 'Nedlung', country: 'Canada', geoLat: 66.5634, geoLon: -71.4447, meshPoint: 2803 },
  { name: 'Raufarhöfn', country: 'Iceland', geoLat: 66.453, geoLon: -15.9509, meshPoint: 2813 },
  { name: 'Neshkan', country: 'Russia', geoLat: 67.0258, geoLon: -172.9926, meshPoint: 2785 },
  { name: 'Shishmaref', country: 'United States', geoLat: 66.2564, geoLon: -166.0629, meshPoint: 2786 },
  { name: 'Letty Harbour', country: 'Canada', geoLat: 69.85, geoLon: -124.4333, meshPoint: 2857 },
  { name: 'Wainwright', country: 'United States', geoLat: 70.6369, geoLon: -160.0383, meshPoint: 2851 },
  { name: 'Fort Collinson', country: 'Canada', geoLat: 71.6196, geoLon: -117.8781, meshPoint: 2859 },
  { name: 'Pond Inlet', country: 'Canada', geoLat: 72.6977, geoLon: -77.9574, meshPoint: 2868 },
  { name: 'Olonkinbyen', country: 'Svalbard', geoLat: 70.9224, geoLon: -8.716, meshPoint: 2878 },
  { name: 'Chukochya', country: 'Russia', geoLat: 70.1081, geoLon: 159.6939, meshPoint: 2844 },
  { name: 'Grise Fiord', country: 'Canada', geoLat: 76.4188, geoLon: -82.9015, meshPoint: 2929 },
  { name: 'Etah', country: 'Greenland', geoLat: 78.3132, geoLon: -72.6013, meshPoint: 2995 },
  { name: 'Station Nord', country: 'Greenland', geoLat: 81.6011, geoLon: -16.6583, meshPoint: 3068 },

  { name: 'Margate', country: 'South Africa', geoLat: -30.8642, geoLon: 30.3686, meshPoint: 1029 },
  { name: 'De Aar', country: 'South Africa', geoLat: -30.6506, geoLon: 24.0075, meshPoint: 1028 },
  { name: 'Mashishing', country: 'South Africa', geoLat: -25.0994, geoLon: 30.4589, meshPoint: 1221 },
  { name: 'Anichab', country: 'Namibia', geoLat: -20.9486, geoLon: 14.8343, meshPoint: 1154 },
  { name: 'Leliefontein', country: 'South Africa', geoLat: -30.3142, geoLon: 18.0825, meshPoint: 1027 },
  { name: 'Bompombo', country: 'Democratic Republic of Congo', geoLat: -1.5532, geoLon: 19.9788, meshPoint: 1539 },
  { name: 'Hamrat ash Shaykh', country: 'Sudan', geoLat: 14.6324, geoLon: 27.9761, meshPoint: 1860 },
  { name: 'Touzougou', country: 'Libya', geoLat: 22.367, geoLon: 19.533, meshPoint: 1987 },
  { name: 'Beterou', country: 'Benin', geoLat: 9.2022, geoLon: 2.2737, meshPoint: 1728 },
  { name: 'Maduda', country: 'Democratic Republic of Congo', geoLat: -4.9167, geoLon: 13.078, meshPoint: 1474 },
  { name: 'Letlhakeng', country: 'Botswana', geoLat: -24.1, geoLon: 25.0295, meshPoint: 1156 },
  { name: 'Enneri Geli', country: 'Chad', geoLat: 19.8044, geoLon: 16.9455, meshPoint: 1923 },
  { name: 'Aguilal', country: 'Mauritania', geoLat: 17.6929, geoLon: -6.8295, meshPoint: 1982 },
  { name: 'Maspalomas', country: 'Spain', geoLat: 27.7528, geoLon: -15.5971, meshPoint: 2109 },
  { name: 'In Ghar', country: 'Algeria', geoLat: 27.1018, geoLon: 1.9065, meshPoint: 2048 },
  { name: 'Viana do Castelo', country: 'Portugal', geoLat: 41.6935, geoLon: -8.8283, meshPoint: 2366 },
  { name: 'Puertollano', country: 'Spain', geoLat: 38.6852, geoLon: -4.1112, meshPoint: 2303 },
  { name: 'Norwich', country: 'United Kingdom', geoLat: 52.6286, geoLon: 1.2924, meshPoint: 2496 },
  { name: 'Ennis', country: 'Ireland', geoLat: 52.8435, geoLon: -8.9837, meshPoint: 2558 },
  { name: 'Twatt', country: 'United Kingdom', geoLat: 59.1007, geoLon: -3.2781, meshPoint: 2687 },
  { name: 'Mariehamn', country: 'Åland', geoLat: 60.1024, geoLon: 19.9413, meshPoint: 2627 },
  { name: 'Durrës', country: 'Albania', geoLat: 41.3133, geoLon: 19.4462, meshPoint: 2307 },
  { name: 'Trieste', country: 'Italy', geoLat: 45.6496, geoLon: 13.7773, meshPoint: 2370 },
  { name: 'Andros', country: 'Greece', geoLat: 37.8408, geoLon: 24.8624, meshPoint: 2244 },
  { name: 'Gönen', country: 'Türkiye', geoLat: 40.1044, geoLon: 27.6564, meshPoint: 2245 },
  { name: 'Samsun', country: 'Türkiye', geoLat: 41.2304, geoLon: 35.9683, meshPoint: 2310 },
  { name: 'Taman', country: 'Russia', geoLat: 45.2159, geoLon: 36.7191, meshPoint: 2374 },
  { name: 'Jelgava', country: 'Latvia', geoLat: 56.6522, geoLon: 23.7292, meshPoint: 2564 },
  { name: 'Szeged', country: 'Hungary', geoLat: 46.2546, geoLon: 20.1486, meshPoint: 2371 },
  { name: 'Gniew', country: 'Poland', geoLat: 53.8342, geoLon: 18.8252, meshPoint: 2499 },
  { name: 'Ovgort', country: 'Russia', geoLat: 64.8273, geoLon: 63.9762, meshPoint: 2634 },
  { name: 'Farkovo', country: 'Russia', geoLat: 65.7184, geoLon: 86.9782, meshPoint: 2639 },
  { name: 'Hulunbuir', country: 'China', geoLat: 49.2125, geoLon: 119.737, meshPoint: 2453 },
  { name: 'Shanghai', country: 'China', geoLat: 31.2313, geoLon: 121.47, meshPoint: 2133 },
  { name: 'Hotan', country: 'China', geoLat: 37.111, geoLon: 79.9209, meshPoint: 2190 },
  { name: 'Mitú', country: 'Colombia', geoLat: 1.2587, geoLon: -70.2366, meshPoint: 1651 },
  { name: 'Abunã', country: 'Brazil', geoLat: -9.627, geoLon: -65.2604, meshPoint: 1460 },
  { name: 'La Paloma', country: 'Uruguay', geoLat: -34.6632, geoLon: -54.1551, meshPoint: 1014 },
  { name: 'Guaraí', country: 'Brazil', geoLat: -8.8354, geoLon: -48.5114, meshPoint: 1463 },
  { name: 'Kakisa', country: 'Canada', geoLat: 60.9407, geoLon: -117.4139, meshPoint: 2667 },
  { name: 'La Ronge', country: 'Canada', geoLat: 55.1005, geoLon: -105.29, meshPoint: 2604 },
  { name: 'Huntsville', country: 'United States', geoLat: 34.7298, geoLon: -86.5859, meshPoint: 2224 },
  { name: 'McDonald Observatory', country: 'United States', geoLat: 30.6758, geoLon: -104.0206, meshPoint: 2157 },
  { name: 'Ciudad Obregón', country: 'Mexico', geoLat: 27.4847, geoLon: -109.9338, meshPoint: 2092 },
  { name: 'Tombstone Territorial Park', country: 'Canada', geoLat: 64.5734, geoLon: -138.4138, meshPoint: 2727 },
  { name: 'Chandalar', country: 'United States', geoLat: 67.5053, geoLon: -148.4936, meshPoint: 2790 },
  { name: 'Behchokǫ̀', country: 'Canada', geoLat: 62.7902, geoLon: -115.9784, meshPoint: 2731 },
];

// City-anchor calibration: map WGS84 ↔ mosaic texture via scattered city anchors.
// One entry per mesh point (duplicates would contradict the fixed texture grid).
const TEXTURE_CALIBRATION_ANCHORS = (() => {
  const seen = new Set();
  const anchors = [];
  CITY_CALIBRATION_ANCHORS.forEach((city) => {
    if (seen.has(city.meshPoint)) return;
    seen.add(city.meshPoint);
    const tex = meshPointIdToTextureLatLon(city.meshPoint);
    anchors.push({
      name: city.name,
      geoLat: city.geoLat,
      geoLon: city.geoLon,
      texLat: tex.lat,
      texLon: tex.lon,
    });
  });
  return anchors;
})();

const CALIBRATION_IDW_NEIGHBORS = 16;
const CALIBRATION_IDW_POWER = 2;
const CALIBRATION_SPHERE_SMOOTH_RAD = 0.005;
const CALIBRATION_PLANAR_SMOOTH_DEG = 0.3;

function textureAnchorMatch(a, lat, lon, useTexture) {
  const eps = 1e-4;
  if (useTexture) {
    return Math.abs(lat - a.texLat) < eps && Math.abs(lon - a.texLon) < eps;
  }
  return Math.abs(lat - a.geoLat) < eps && Math.abs(lon - a.geoLon) < eps;
}

function geographicSeparationDeg(latA, lonA, latB, lonB) {
  const cosLat = Math.cos((latA * Math.PI) / 180);
  return Math.hypot(latA - latB, (lonA - lonB) * cosLat);
}

function latLonToUnitVec(lat, lon) {
  const rad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  const cosLat = Math.cos(rad);
  return {
    x: cosLat * Math.cos(lonRad),
    y: cosLat * Math.sin(lonRad),
    z: Math.sin(rad),
  };
}

function sphericalSeparationRad(latA, lonA, latB, lonB) {
  const a = latLonToUnitVec(latA, lonA);
  const b = latLonToUnitVec(latB, lonB);
  const dot = Math.min(1, Math.max(-1, a.x * b.x + a.y * b.y + a.z * b.z));
  return Math.acos(dot);
}

function interpolateLonCircular(values, weights) {
  let sinSum = 0;
  let cosSum = 0;
  values.forEach((lon, i) => {
    const rad = (lon * Math.PI) / 180;
    sinSum += weights[i] * Math.sin(rad);
    cosSum += weights[i] * Math.cos(rad);
  });
  return wrapLongitudeDeg((Math.atan2(sinSum, cosSum) * 180) / Math.PI);
}

function idwLatLon(lat, lon, neighbors, valueLat, valueLon, distKey, smooth, power) {
  const capped = neighbors.slice(0, CALIBRATION_IDW_NEIGHBORS);
  let weightSum = 0;
  let latSum = 0;
  const lonValues = [];
  const lonWeights = [];

  capped.forEach((neighbor) => {
    const dist = neighbor[distKey];
    const weight = 1 / (dist + smooth) ** power;
    weightSum += weight;
    latSum += weight * neighbor[valueLat];
    lonValues.push(neighbor[valueLon]);
    lonWeights.push(weight);
  });

  return {
    lat: latSum / weightSum,
    lon: interpolateLonCircular(lonValues, lonWeights),
  };
}

function geographicToTextureIdw(lat, lon) {
  const neighbors = TEXTURE_CALIBRATION_ANCHORS
    .map((anchor) => ({
      ...anchor,
      dist: sphericalSeparationRad(lat, lon, anchor.geoLat, anchor.geoLon),
    }))
    .sort((a, b) => a.dist - b.dist);

  return idwLatLon(
    lat,
    lon,
    neighbors,
    'texLat',
    'texLon',
    'dist',
    CALIBRATION_SPHERE_SMOOTH_RAD,
    CALIBRATION_IDW_POWER,
  );
}

function textureToGeographicIdw(lat, lon) {
  const neighbors = TEXTURE_CALIBRATION_ANCHORS
    .map((anchor) => ({
      ...anchor,
      dist: geographicSeparationDeg(lat, lon, anchor.texLat, anchor.texLon),
    }))
    .sort((a, b) => a.dist - b.dist);

  return idwLatLon(
    lat,
    lon,
    neighbors,
    'geoLat',
    'geoLon',
    'dist',
    CALIBRATION_PLANAR_SMOOTH_DEG,
    CALIBRATION_IDW_POWER,
  );
}

export function geographicToTextureLatLon(lat, lon) {
  for (const anchor of TEXTURE_CALIBRATION_ANCHORS) {
    if (textureAnchorMatch(anchor, lat, lon, false)) {
      return { lat: anchor.texLat, lon: anchor.texLon };
    }
  }

  return geographicToTextureIdw(lat, lon);
}

export function textureToGeographicLatLon(lat, lon) {
  for (const anchor of TEXTURE_CALIBRATION_ANCHORS) {
    if (textureAnchorMatch(anchor, lat, lon, true)) {
      return { lat: anchor.geoLat, lon: anchor.geoLon };
    }
  }

  return textureToGeographicIdw(lat, lon);
}

/** Great-circle ground track from pad along launch azimuth (degrees from north). */
export function latLonFromDownrange(lat, lon, downrangeM, azimuthDeg) {
  if (downrangeM <= 0) return { lat, lon };

  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  const bearing = (azimuthDeg * Math.PI) / 180;
  const angularDist = downrangeM / R_EARTH;

  const sinLat = Math.sin(latRad);
  const cosLat = Math.cos(latRad);
  const sinAng = Math.sin(angularDist);
  const cosAng = Math.cos(angularDist);
  const sinBrg = Math.sin(bearing);
  const cosBrg = Math.cos(bearing);

  const sinLat2 = sinLat * cosAng + cosLat * sinAng * cosBrg;
  const lat2 = Math.asin(Math.min(1, Math.max(-1, sinLat2)));
  const lon2 = lonRad + Math.atan2(sinBrg * sinAng * cosLat, cosAng - sinLat * sinLat2);

  return {
    lat: (lat2 * 180) / Math.PI,
    lon: (lon2 * 180) / Math.PI,
  };
}