import type { GameMeta, GameModule } from './types.ts';
import dualNBack from '../games/DualNBack.ts';
import rocketLaunch from '../games/RocketLaunchSimulation.ts';
import satellite from '../games/SatelliteCoverageOptimiser.ts';
import vocabulary from '../games/VocabularyTrainer.ts';

/** Old games.json order. Slug is the module basename. */
const modules: GameModule[] = [dualNBack, rocketLaunch, satellite, vocabulary];

export function listGames(): GameMeta[] {
  return modules.map((game) => game.meta);
}

export function loadGame(slug: string): GameModule | null {
  return modules.find((game) => game.meta.slug === slug) ?? null;
}
