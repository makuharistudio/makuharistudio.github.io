import {
  paramsForSiteAndMission,
  clampParamsToMissionBounds,
  simulateTrajectory,
  evaluateMission,
  summarizeTrajectory,
  monteCarloSuccess,
} from '../rocketlaunchsimulationPhysics.js';

const base = paramsForSiteAndMission('spacex_lc39a', 'meo_gps');
const tests = [
  { stage1Fuel: 480000, stage2Fuel: 140000, finalPitch: 0.38, turnEndAlt: 70000, cd: 0.52 },
  { stage1Fuel: 480000, stage2Fuel: 140000, finalPitch: 0.4, turnEndAlt: 65000, cd: 0.52 },
  { stage1Fuel: 500000, stage2Fuel: 140000, finalPitch: 0.38, turnEndAlt: 75000, cd: 0.48 },
  { stage1Fuel: 480000, stage2Fuel: 140000, finalPitch: 0.36, turnEndAlt: 80000, cd: 0.5 },
  { stage1Fuel: 520000, stage2Fuel: 140000, finalPitch: 0.34, turnEndAlt: 85000, cd: 0.5 },
];

for (const t of tests) {
  const p = clampParamsToMissionBounds({ ...base, ...t }, 'meo_gps');
  const states = simulateTrajectory(p);
  const ev = evaluateMission(p, states);
  const ap = summarizeTrajectory(states, p).apogeeKm;
  console.log({ ...t, score: ev.success, apogee: ap.toFixed(0), maxQ: (ev.maxQ/1000).toFixed(1), failed: ev.failed, rating: ev.rating?.slice(0,60) });
}