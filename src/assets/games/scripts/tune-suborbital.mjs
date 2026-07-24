import {
  paramsForSiteAndMission,
  simulateTrajectory,
  evaluateMission,
  summarizeTrajectory,
  MISSION_SUCCESS_THRESHOLD,
} from '../rocketlaunchsimulationPhysics.js';

const base = paramsForSiteAndMission('spacex_lc39a', 'suborbital');
const results = [];

for (const thrust1 of [650000, 680000, 700000, 720000, 750000]) {
  for (const stage1Fuel of [16000, 18000, 20000, 22000]) {
    for (const cd of [0.55, 0.62, 0.7, 0.82]) {
      for (const finalPitch of [0.76, 0.82, 0.85, 0.9]) {
        for (const turnEndAlt of [15000, 18000, 20000]) {
          const p = { ...base, thrust1, stage1Fuel, cd, finalPitch, turnEndAlt, area: 9 };
          const states = simulateTrajectory(p);
          const ev = evaluateMission(p, states);
          const sum = summarizeTrajectory(states, p);
          if (ev.success >= 55) {
            results.push({
              score: ev.success,
              apogee: sum.apogeeKm.toFixed(1),
              maxQ: (ev.maxQ / 1000).toFixed(1),
              thrust1, stage1Fuel, cd, finalPitch, turnEndAlt,
              failed: ev.failed,
            });
          }
        }
      }
    }
  }
}

results.sort((a, b) => b.score - a.score);
console.log('passing combos', results.length);
console.log(results.slice(0, 15));
console.log('threshold', MISSION_SUCCESS_THRESHOLD);