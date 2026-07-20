import {
  paramsForSiteAndMission,
  simulateTrajectory,
  evaluateMission,
  summarizeTrajectory,
} from '../../assets/games/rocketlaunchsimulationPhysics.js';

const tests = [
  { stage1Fuel: 380000, stage2Fuel: 100000, finalPitch: 0.36, turnEndAlt: 60000 },
  { stage1Fuel: 400000, stage2Fuel: 110000, finalPitch: 0.38, turnEndAlt: 65000 },
  { stage1Fuel: 420000, stage2Fuel: 115000, finalPitch: 0.38, turnEndAlt: 70000 },
  { stage1Fuel: 360000, stage2Fuel: 95000, finalPitch: 0.4, turnEndAlt: 55000 },
  { stage1Fuel: 340000, stage2Fuel: 90000, finalPitch: 0.42, turnEndAlt: 50000 },
  { stage1Fuel: 300000, stage2Fuel: 80000, finalPitch: 0.44, turnEndAlt: 45000 },
];
const base = paramsForSiteAndMission('spacex_lc39a', 'meo_gps');
for (const t of tests) {
  const p = { ...base, ...t };
  const states = simulateTrajectory(p);
  const ev = evaluateMission(p, states);
  const ap = summarizeTrajectory(states, p).apogeeKm;
  console.log({ ...t, score: ev.success, apogee: ap.toFixed(0), rating: ev.rating, failed: ev.failed });
}