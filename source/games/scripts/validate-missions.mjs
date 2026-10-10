import {
  MISSION_PROFILES,
  paramsForSiteAndMission,
  simulateTrajectory,
  evaluateMission,
  monteCarloSuccess,
  summarizeTrajectory,
  MISSION_SUCCESS_THRESHOLD,
} from '../rocketlaunchsimulationPhysics.js';

const siteId = 'spacex_lc39a';
const mcRuns = 12;
for (const m of MISSION_PROFILES) {
  const p = paramsForSiteAndMission(siteId, m.id);
  const states = simulateTrajectory(p);
  const ev = evaluateMission(p, states);
  const sum = summarizeTrajectory(states, p);
  const mc = monteCarloSuccess(p, mcRuns);
  const pass = ev.success >= MISSION_SUCCESS_THRESHOLD ? 'PASS' : 'FAIL';
  console.log(`${pass} ${m.id}: score=${ev.success} mc=${mc}% alt=${ev.finalAltKm?.toFixed?.(1) ?? sum.apogeeKm.toFixed(1)}km failed=${ev.failed ?? 'none'}`);
}
console.log('threshold', MISSION_SUCCESS_THRESHOLD);