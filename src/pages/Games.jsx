/* ===============================================
   UPDATED /src/pages/Games.jsx
   =============================================== */
import React from 'react';
import { Link } from 'react-router-dom';

export default function Games() {
  const gamesList = [
    {
      name: 'SatelliteCoverageOptimiser',
      title: 'Satellite Coverage Optimizer',
      description: 'Design a real LEO constellation on a 3D Earth sphere. Achieve 100 % global coverage using authentic orbital mechanics, visibility cones, and live heatmap feedback.',
      color: 'emerald',
    },
    // Future games will be added here automatically as you drop more files into /src/assets/games/
  ];

  return (
    <>
      <center>
        <h1>
          This page is under construction.
        </h1>
      </center>
    </>
  )
}

/*
  return (
    <>
      <div className="min-h-screen bg-black text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <center>
            <h1 className="text-5xl font-bold tracking-tighter mb-2">GAMES</h1>
            <p className="text-xl text-zinc-400 mb-12">
              Strategic thinking simulators • Real physics • No reflexes, only brainwork
            </p>
          </center>

          <div className="space-y-6">
            {gamesList.map((game) => (
              <div
                key={game.name}
                className="group bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-3xl p-8 flex flex-col md:flex-row gap-8 transition-all duration-300"
              >
                <div className="flex-1">
                  <div className={`inline-flex px-4 py-1 text-xs font-mono rounded-3xl bg-${game.color}-900 text-${game.color}-400 mb-4`}>
                    SPACE • ROBOTICS
                  </div>
                  <h2 className="text-3xl font-semibold mb-3">{game.title}</h2>
                  <p className="text-zinc-400 text-lg leading-relaxed">{game.description}</p>
                </div>

                <div className="flex flex-col justify-center">
                  <Link
                    to={`/game/${game.name}`}
                    className="px-10 py-6 bg-white text-black rounded-3xl text-xl font-semibold flex items-center justify-center gap-3 hover:scale-105 transition-transform group-hover:shadow-2xl group-hover:shadow-emerald-500/30"
                  >
                    PLAY NOW
                    <span className="text-3xl">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center text-zinc-500 text-sm">
            More thinking games coming soon (Gravity Slingshot, Rover Pathfinder, etc.)
          </div>
        </div>
      </div>
    </>
  );
}
*/