import ProjectsList from '../components/ProjectsList'
import projects from '../data/projects'

export default function Projects() {
    return (
      <>
        <center>
          <h1>PROJECTS</h1>
          <h3>These are projects I created whilst exploring different technologies.</h3>
        </center>
        <ProjectsList projects={projects} />
      </>
    );
}