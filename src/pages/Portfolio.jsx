import PortfolioList from '../components/PortfolioList'
import projects from '../data/projects'

export default function Portfolio() {
    return (
      <>
        <center>
          <h1>PORTFOLIO</h1>
          <h3>These are personal projects I created whilst exploring different technologies.</h3>
        </center>
        <PortfolioList projects={projects} />
      </>
    );
}