import {
  paramsForSiteAndMission,
  simulateTrajectory,
  evaluateMission,
  summarizeTrajectory,
} from '../../assets/games/rocketlaunchsimulationPhysics.js';

const base = paramsForSiteAndMission('spacex_lc39a', 'gto');
const p = paramsForSiteAndMission('spacex_lc39a', 'gto');
const states = simulateTrajectory(p);
const ev = evaluateMission(p, states);
console.log('default', { score: ev.success, apogee: summarizeTrajectory(states, p).apogeeKm.toFixed(0), rating: ev.rating });

// probe max with extreme fuel
const extreme = { ...base, stage1Fuel: 820000, stage2Fuel: 300000, finalPitch: 0.22, turnEndAlt: 110000, maxSimTime: 15000 };
const st2 = simulateTrajectory(extreme);
const ev2 = evaluateMission(extreme, st2);
console.log('extreme', { score: ev2.success, apogee: summarizeTrajectory(st2, extreme).apogeeKm.toFixed(0), rating: ev2.rating });