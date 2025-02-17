import { Link } from 'react-router-dom';
import { LinkData } from '../data/data';

export default function LinksList() {
    const data = LinkData;
    return (
        <>
            <center><h2>LINKS</h2></center>
            <nav id='link-list'>
                {data.map((item)=>{
                    return(
                        <Link key={item.name} to={item.link} target='_blank'>
                            <img src={item.icon} className='link-icon' loading='lazy' alt={item.name}/>
                            <h6>{item.name}</h6>
                        </Link>
                    )
                })}
            </nav>
        </>
    );
}