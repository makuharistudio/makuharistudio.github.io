import { Link } from 'react-router-dom';
import certifications from '../data/certifications';
import Panel from '../assets/theme/accent/components/Panel.jsx'

export default function CertificationList() {
    const data = certifications;

    return (
        <>
            <center><h2>CERTIFICATIONS</h2></center>
            <div id='certification-list'>
                {data.map((certification) => {
                    return (
                        <Link key={certification.id} to={certification.url} target='_blank' alt={certification.name}>
                            <Panel>
                                <h5>{certification.date}</h5>
                                <h3>{certification.name}</h3>
                                <h4>{certification.id}</h4>
                                <p>{certification.url}</p>
                            </Panel>
                        </Link>
                    );
                })}
            </div>
        </>
    );
}
