import { setOutlet, setGameBackground } from '../components/Layout.ts';
import { Panel } from '../components/Panel.ts';
import { listGames, loadGame } from '../library/games.ts';

/** Games list. Cards match the old GamesList: panel, title, photo, description. */
export function renderGames(): void {
  setGameBackground(null);
  const wrap = document.createElement('div');
  const title = document.createElement('center');
  const h1 = document.createElement('h1');
  h1.textContent = 'GAMES';
  const h3 = document.createElement('h3');
  h3.textContent = 'Educational games vibe-coded using paid Grok API.';
  title.append(h1, h3);
  wrap.appendChild(title);

  const list = document.createElement('div');
  list.id = 'games-list';
  for (const game of listGames()) {
    const link = document.createElement('a');
    link.href = `#/game/${game.slug}`;
    const body = document.createElement('div');
    const heading = document.createElement('h4');
    heading.textContent = game.title;
    const img = document.createElement('img');
    img.src = game.photo;
    img.alt = game.title;
    img.loading = 'lazy';
    const blurb = document.createElement('p');
    blurb.textContent = game.description;
    body.append(heading, img, blurb);
    link.appendChild(Panel(body));
    list.appendChild(link);
  }
  wrap.appendChild(list);
  setOutlet(wrap);
}

/**
 * Full-screen game. The site header and footer stay.
 * The previous background is disposed before the game scene starts, and
 * restored when the player leaves.
 */
export function renderGame(slug: string | null): () => void {
  const game = slug ? loadGame(slug) : null;
  if (!game) {
    setGameBackground(null);
    const missing = document.createElement('div');
    missing.style.cssText = 'min-height:70vh;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.5rem;';
    missing.textContent = `Game not found: ${slug ?? ''}`;
    setOutlet(missing);
    return () => {
      setGameBackground(null);
    };
  }

  setGameBackground(game.initialiseBackground ?? null);
  const host = document.createElement('div');
  host.id = 'game-root';
  setOutlet(host);
  const stop = game.mount(host);
  return () => {
    stop();
    setGameBackground(null);
  };
}
