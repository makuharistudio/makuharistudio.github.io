import ReadingsList from '../components/ReadingsList'
import readings from '../data/readings'

export default function Readings() {
    return (
      <>
        <center>
          <h1>READINGS</h1>
          <h3>This is a non-exhaustive list of books I have read along with summaries of lessons learned.</h3>
        </center>
        <ReadingsList readings={readings} />
      </>
    );
}