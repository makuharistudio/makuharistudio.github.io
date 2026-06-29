import React from 'react';
import { Link } from 'react-router-dom';
import Panel from '../assets/theme/accent/components/Panel'

export default function GamesList({ games }) {
  if (!games) {
    return <div>No games available</div>;
  }

  return (
    <div id='games-list'>
      {games.map(g => {
        const isExternalUrl = g.photo.startsWith('http');
        const imagePath = isExternalUrl
          ? g.photo
          : new URL(`../assets/games/${g.photo.split('/').pop().trim()}`, import.meta.url).href;

        return (
          <Link key={g.name} to={'/game/' + g.name}>
            <Panel>
              <h4>{g.title}</h4>
              <img src={imagePath} loading='lazy' alt={g.title} />
              <p>{g.desc}</p>
            </Panel>
          </Link>
        );
      })}
    </div>
  );
}