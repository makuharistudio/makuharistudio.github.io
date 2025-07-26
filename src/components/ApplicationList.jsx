import { Link } from 'react-router-dom';
import applications from '../data/applications';

export default function ApplicationList() {
    const data = applications;

    return (
        <>
            <div id='application-list'>
                {data.map((application) => {
                    return (
                        <Link key={application.name} to={application.url} alt={application.name}>
                            <h5>{application.date}</h5>
                            <h3>{application.desc}</h3>
                            <p>{application.tags}</p>
                        </Link>
                    );
                })}
            </div>
        </>
    );
}
