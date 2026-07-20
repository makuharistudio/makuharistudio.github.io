import {
  paramsForSiteAndMission,
  clampParamsToMissionBounds,
  simulateTrajectory,
  evaluateMission,
  summarizeTrajectory,
  MISSION_SUCCESS_THRESHOLD,
} from '../../assets/games/rocketlaunchsimulationPhysics.js';

const base = paramsForSiteAndMission('spacex_lc39a', 'gto');
const results = [];

for (const stage1Fuel of [560000, 580000, 600000, 620000, 640000, 660000, 680000]) {
  for (const stage2Fuel of [200000, 220000, 240000, 260000, 280000]) {
    for (const finalPitch of [0.26, 0.28, 0.3]) {
      for (const turnEndAlt of [80000, 85000, 90000]) {
        const p = clampParamsToMissionBounds({ ...base, stage1Fuel, stage2Fuel, finalPitch, turnEndAlt }, 'gto');
        const states = simulateTrajectory(p);
        const ev = evaluateMission(p, states);
        const ap = summarizeTrajectory(states, p).apogeeKm;
        if (ev.success >= 55 || (ap >= 34000 && ap <= 36500)) {
          results.push({ score: ev.success, apogee: ap.toFixed(0), failed: ev.failed, stage1Fuel, stage2Fuel, finalPitch, turnEndAlt });
        }
      }
    }
  }
}

results.sort((a, b) => b.score - a.score);
console.log('hits', results.length);
console.log(results.slice(0, 15));
console.log('threshold', MISSION_SUCCESS_THRESHOLD);