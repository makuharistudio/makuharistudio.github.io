import {
  paramsForSiteAndMission,
  simulateTrajectory,
  evaluateMission,
  summarizeTrajectory,
  MISSION_SUCCESS_THRESHOLD,
} from '../../assets/games/rocketlaunchsimulationPhysics.js';

for (const id of ['gto', 'geo']) {
  const base = paramsForSiteAndMission('spacex_lc39a', id);
  let best = { score: -1 };
  let maxApogee = 0;

  for (const stage2Fuel of [280000, 300000, 330000]) {
    for (const stage1Fuel of [720000, 760000, 820000]) {
      for (const finalPitch of [0.22, 0.24, 0.26]) {
        for (const turnEndAlt of [95000, 105000]) {
          for (const maxSimTime of [9600, 12000, 15000]) {
            const p = { ...base, stage1Fuel, stage2Fuel, finalPitch, turnEndAlt, maxSimTime };
            const states = simulateTrajectory(p);
            const apogee = summarizeTrajectory(states, p).apogeeKm;
            maxApogee = Math.max(maxApogee, apogee);
            const ev = evaluateMission(p, states);
            if (ev.success > best.score) {
              best = { score: ev.success, apogee, rating: ev.rating, stage1Fuel, stage2Fuel, finalPitch, turnEndAlt, maxSimTime, failed: ev.failed };
            }
          }
        }
      }
    }
  }
  console.log(id, 'maxApogee', maxApogee.toFixed(0), 'best', JSON.stringify(best));
}
console.log('threshold', MISSION_SUCCESS_THRESHOLD);