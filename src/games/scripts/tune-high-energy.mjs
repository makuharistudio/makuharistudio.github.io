import {
  paramsForSiteAndMission,
  simulateTrajectory,
  evaluateMission,
  summarizeTrajectory,
  missionAltitudeBounds,
  MISSION_SUCCESS_THRESHOLD,
} from '../../assets/games/rocketlaunchsimulationPhysics.js';

for (const id of ['meo_gps', 'gto', 'geo']) {
  const base = paramsForSiteAndMission('spacex_lc39a', id);
  const bounds = missionAltitudeBounds(id);
  let best = null;

  const stage2Fuels = id === 'meo_gps' ? [125000, 150000, 180000] : [280000, 320000, 360000];
  const stage1Fuels = id === 'meo_gps' ? [460000, 520000, 580000] : [720000, 800000, 880000];
  const finalPitches = [0.24, 0.26, 0.28, 0.3];
  const turnEnds = id === 'meo_gps' ? [75000, 85000, 95000] : [90000, 100000, 110000];

  for (const stage2Fuel of stage2Fuels) {
    for (const stage1Fuel of stage1Fuels) {
      for (const finalPitch of finalPitches) {
        for (const turnEndAlt of turnEnds) {
          const p = { ...base, stage1Fuel, stage2Fuel, finalPitch, turnEndAlt };
          const states = simulateTrajectory(p);
          const ev = evaluateMission(p, states);
          const apogee = summarizeTrajectory(states, p).apogeeKm;
          if (!best || ev.success > best.score) {
            best = { id, score: ev.success, apogee, rating: ev.rating, failed: ev.failed, stage1Fuel, stage2Fuel, finalPitch, turnEndAlt, bounds };
          }
        }
      }
    }
  }
  console.log(JSON.stringify(best));
}
console.log('threshold', MISSION_SUCCESS_THRESHOLD);