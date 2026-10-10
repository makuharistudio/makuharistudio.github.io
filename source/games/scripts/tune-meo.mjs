import {
  paramsForSiteAndMission,
  simulateTrajectory,
  evaluateMission,
  summarizeTrajectory,
  monteCarloSuccess,
  MISSION_SUCCESS_THRESHOLD,
} from '../rocketlaunchsimulationPhysics.js';

const base = paramsForSiteAndMission('spacex_lc39a', 'meo_gps');
const results = [];

for (const stage1Fuel of [320000, 360000, 400000, 440000, 480000]) {
  for (const stage2Fuel of [90000, 110000, 125000, 140000]) {
    for (const finalPitch of [0.32, 0.34, 0.36, 0.38, 0.4]) {
      for (const turnEndAlt of [55000, 65000, 75000]) {
        for (const thrust1 of [9200000, 10200000]) {
          const p = { ...base, stage1Fuel, stage2Fuel, finalPitch, turnEndAlt, thrust1 };
          const ev = evaluateMission(p, simulateTrajectory(p));
          const apogee = summarizeTrajectory(simulateTrajectory(p), p).apogeeKm;
          if (ev.success >= 55) {
            const mc = monteCarloSuccess(p, 8);
            results.push({ score: ev.success, mc, apogee: apogee.toFixed(0), stage1Fuel, stage2Fuel, finalPitch, turnEndAlt, thrust1, failed: ev.failed });
          }
        }
      }
    }
  }
}

results.sort((a, b) => b.score - a.score);
console.log('passing', results.length);
console.log(results.slice(0, 12));