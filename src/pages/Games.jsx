import GamesList from '../components/GamesList'
import games from '../data/games'

export default function Games() {
  return (
    <>
      <center>
        <h1>GAMES</h1>
        <h3>Educational games vibe-coded using paid Grok API.</h3>
      </center>
      <GamesList games={games} />
    </>
  );
}