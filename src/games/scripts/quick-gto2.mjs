import {
  paramsForSiteAndMission,
  clampParamsToMissionBounds,
  simulateTrajectory,
  evaluateMission,
  summarizeTrajectory,
} from '../../assets/games/rocketlaunchsimulationPhysics.js';

const base = paramsForSiteAndMission('spacex_lc39a', 'gto');
const tests = [
  { stage1Fuel: 720000, stage2Fuel: 280000, finalPitch: 0.26, turnEndAlt: 95000 },
  { stage1Fuel: 600000, stage2Fuel: 240000, finalPitch: 0.28, turnEndAlt: 85000 },
  { stage1Fuel: 520000, stage2Fuel: 200000, finalPitch: 0.3, turnEndAlt: 75000 },
  { stage1Fuel: 520000, stage2Fuel: 170000, finalPitch: 0.32, turnEndAlt: 70000 },
];

for (const t of tests) {
  const p = clampParamsToMissionBounds({ ...base, ...t }, 'gto');
  const states = simulateTrajectory(p);
  const ev = evaluateMission(p, states);
  const ap = summarizeTrajectory(states, p).apogeeKm;
  console.log({ ...t, score: ev.success, apogee: ap.toFixed(0), failed: ev.failed });
}