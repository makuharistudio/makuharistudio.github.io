import ApplicationList from '../components/ApplicationList'
import applications from '../data/applications'

export default function Applications() {
    return (
      <>
        <center>
          <h1>APPLICATIONS</h1>
          <h3>This is a list of applications I vibe-coded with Grok.</h3>
          <p> I gave prompts, performed incremental testing, and made the visual designs.</p>
        </center>
        <ApplicationList applications={applications} />
      </>
    );
}