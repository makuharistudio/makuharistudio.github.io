import { Link } from 'react-router-dom';
import { LinkData } from '../data/data';
import { useState } from 'react';
import { useTheme } from './ThemeToggle';

function getLinkIcon(item, theme, isActive) {
    const icons = item.icons[theme];
    return isActive ? icons.active : icons.default;
}

export default function LinksList() {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const { theme } = useTheme();

    return (
        <>
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
                            src={getLinkIcon(item, theme, hoveredIndex === index)}
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