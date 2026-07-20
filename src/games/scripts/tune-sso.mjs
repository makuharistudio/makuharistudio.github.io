import {
  paramsForSiteAndMission,
  simulateTrajectory,
  evaluateMission,
  monteCarloSuccess,
  MISSION_SUCCESS_THRESHOLD,
} from '../../assets/games/rocketlaunchsimulationPhysics.js';

const base = paramsForSiteAndMission('spacex_lc39a', 'leo_sso');
const results = [];

const thrust1s = [6400000, 6600000, 6800000];
const fuel1s = [372000, 390000, 410000];
const fuel2s = [102000, 110000, 120000];
const finalPitches = [0.35, 0.37, 0.39];

for (const thrust1 of thrust1s) {
  for (const stage1Fuel of fuel1s) {
    for (const stage2Fuel of fuel2s) {
      for (const finalPitch of finalPitches) {
        const p = { ...base, thrust1, stage1Fuel, stage2Fuel, finalPitch };
        const ev = evaluateMission(p, simulateTrajectory(p));
        if (ev.success >= 55) {
          const mc = monteCarloSuccess(p, 10);
          results.push({ score: ev.success, mc, alt: ev.finalAltKm, thrust1, stage1Fuel, stage2Fuel, finalPitch });
        }
      }
    }
  }
}

results.sort((a, b) => b.mc - a.mc || b.score - a.score);
console.log(results.slice(0, 10));