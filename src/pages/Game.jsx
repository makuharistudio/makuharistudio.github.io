/* ===============================================
   UPDATED /src/pages/Game.jsx
   =============================================== */
import React, { Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';

export default function Game() {
  const { name } = useParams();

  // Dynamically load any game from /src/assets/games/
  const GameComponent = lazy(() =>
    import(`../assets/games/${name}.jsx`).catch(() => ({
      default: () => (
        <div className="flex h-screen items-center justify-center bg-black text-white text-2xl">
          Game not found: {name}
        </div>
      ),
    }))
  );

  return (
    <Suspense
      fallback={

      <center>
        <div className="flex h-screen w-screen items-center justify-center bg-black text-white font-mono text-xl">
          Loading game...
        </div>
      </center>

      }
    >
      <GameComponent />
    </Suspense>
  );
}