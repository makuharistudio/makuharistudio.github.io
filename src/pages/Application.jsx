import { useParams } from 'react-router-dom';
import SVGMaker from '../applications/SVGMaker';
// Add more as needed

export default function ApplicationViewer() {
  const { name } = useParams();
  
  const key = name.toLowerCase();

  switch (key) {
    case 'svg-maker':
      return <SVGMaker />;
    default:
      return <h1>Application not found</h1>;
  }
}
