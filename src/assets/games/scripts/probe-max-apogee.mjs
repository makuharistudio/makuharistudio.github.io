import {
  paramsForSiteAndMission,
  simulateTrajectory,
  summarizeTrajectory,
} from '../rocketlaunchsimulationPhysics.js';

for (const id of ['gto', 'geo', 'meo_gps']) {
  const base = paramsForSiteAndMission('spacex_lc39a', id);
  let maxApogee = 0;
  let bestP = null;
  for (const stage2Fuel of [125000, 200000, 280000, 330000]) {
    for (const stage1Fuel of [480000, 600000, 720000, 860000]) {
      for (const finalPitch of [0.22, 0.26, 0.3]) {
        const p = { ...base, stage1Fuel, stage2Fuel, finalPitch, maxSimTime: 15000 };
        const apogee = summarizeTrajectory(simulateTrajectory(p), p).apogeeKm;
        if (apogee > maxApogee) {
          maxApogee = apogee;
          bestP = { stage1Fuel, stage2Fuel, finalPitch };
        }
      }
    }
  }
  console.log(id, 'maxApogee', maxApogee.toFixed(0), bestP);
}