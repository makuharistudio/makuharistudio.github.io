import { LinkData } from '../data/data';
import { useState } from 'react';
import { useTheme } from './ThemeToggle';

function getLinkIcon(item, theme, isActive) {
    const icons = item.icons[theme];
    return isActive ? icons.active : icons.default;
}

export default function LinkList() {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const { theme } = useTheme();

    return (
        <div id='links-list'>
            {LinkData.map((item, index) => (
                <li
                    key={item.name}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <a href={item.link} target='_blank' rel='noreferrer'>
                        <img
                            src={getLinkIcon(item, theme, hoveredIndex === index)}
                            className='link-icon'
                            loading='lazy'
                            alt={item.name}
                        />
                    </a>
                    <div className="link-gradient"></div>
                    <div className="link-border"></div>
                </li>
            ))}
        </div>
    );
}