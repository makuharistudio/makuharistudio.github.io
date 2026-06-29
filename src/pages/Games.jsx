import GamesList from '../components/GamesList'
import games from '../data/games'

export default function Games() {
  return (
    <>
      <center>
        <h1>GAMES</h1>
        <h3>Strategic thinking simulators and interactive learning experiences.</h3>
      </center>
      <GamesList games={games} />
    </>
  );
}