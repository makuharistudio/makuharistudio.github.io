import {
  paramsForSiteAndMission,
  clampParamsToMissionBounds,
  simulateTrajectory,
  evaluateMission,
  summarizeTrajectory,
} from '../../assets/games/rocketlaunchsimulationPhysics.js';

const base = paramsForSiteAndMission('spacex_lc39a', 'meo_gps');
let minAp = Infinity;
let maxAp = 0;

for (const stage1Fuel of [480000, 520000, 560000, 600000]) {
  for (const stage2Fuel of [140000, 125000, 110000]) {
    for (const finalPitch of [0.3, 0.34, 0.38, 0.42]) {
      for (const turnEndAlt of [60000, 70000, 85000]) {
        const p = clampParamsToMissionBounds({ ...base, stage1Fuel, stage2Fuel, finalPitch, turnEndAlt }, 'meo_gps');
        const ap = summarizeTrajectory(simulateTrajectory(p), p).apogeeKm;
        minAp = Math.min(minAp, ap);
        maxAp = Math.max(maxAp, ap);
      }
    }
  }
}
console.log('MEO apogee range within bounds:', minAp.toFixed(0), '-', maxAp.toFixed(0));