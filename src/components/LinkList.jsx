import { Link } from 'react-router-dom';
import { LinkData } from '../data/data';
import { useState } from 'react';

export default function LinksList() {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <>
            <center><h2>LINKS</h2></center>
            <nav id='link-list'>
                {LinkData.map((item, index) => (
                    <Link 
                        key={item.name} 
                        to={item.link} 
                        target='_blank' 
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <img 
                            src={hoveredIndex === index ? item.hover : item.icon} 
                            className='link-icon' 
                            loading='lazy' 
                            alt={item.name}
                        />
                        <h6>{item.name}</h6>
                    </Link>
                ))}
            </nav>
        </>
    );
}